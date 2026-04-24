-- ============================================================
-- migration-messaging.sql
--
-- Direct-messaging system with a connection gate:
--   1) Users must exchange an accepted connection before DMs work.
--   2) After a decline, the requester must wait 30 days to retry.
--   3) Text-only messages (v1).
--
-- Tables:
--   public.connections    — edges between two profiles
--   public.conversations  — one row per connected pair (user_a <= user_b)
--   public.messages       — all DMs, scoped to a conversation
--
-- RLS:
--   - connections: users see edges where they're either side; insert only
--     as requester; update only as addressee (to accept/decline).
--   - conversations + messages: accessible only to participants, and only
--     when an accepted connection exists between them.
--
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1) connections
-- ------------------------------------------------------------
create table if not exists public.connections (
  id             uuid primary key default gen_random_uuid(),
  requester_id   uuid not null references public.profiles(id) on delete cascade,
  addressee_id   uuid not null references public.profiles(id) on delete cascade,
  status         text not null default 'pending'
                 check (status in ('pending','accepted','declined')),
  created_at     timestamptz not null default now(),
  responded_at   timestamptz,
  declined_at    timestamptz,
  constraint connections_no_self check (requester_id <> addressee_id)
);

-- At most one row per ordered pair in either direction. This prevents
-- both "B re-requesting A after A already has a pending" and duplicate
-- accepted edges. We index by BOTH orders via a generated expression.
create unique index if not exists connections_pair_unique_idx
  on public.connections (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create index if not exists connections_addressee_idx on public.connections(addressee_id, status);
create index if not exists connections_requester_idx on public.connections(requester_id, status);

-- ------------------------------------------------------------
-- 2) conversations
-- ------------------------------------------------------------
-- user_a is always the lower UUID, user_b the higher — that way we can
-- uniquely locate a conversation between any two people without having
-- to search both directions.
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  user_a           uuid not null references public.profiles(id) on delete cascade,
  user_b           uuid not null references public.profiles(id) on delete cascade,
  last_message_at  timestamptz,
  last_sender_id   uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  constraint conversations_ab_distinct check (user_a < user_b),
  constraint conversations_pair_unique unique (user_a, user_b)
);
create index if not exists conversations_user_a_idx on public.conversations(user_a, last_message_at desc);
create index if not exists conversations_user_b_idx on public.conversations(user_b, last_message_at desc);

-- ------------------------------------------------------------
-- 3) messages
-- ------------------------------------------------------------
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete set null,
  body             text not null,
  created_at       timestamptz not null default now(),
  read_at          timestamptz,
  constraint messages_body_length check (char_length(body) between 1 and 4000)
);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at desc);

-- ------------------------------------------------------------
-- 4) Helpers
-- ------------------------------------------------------------

-- Returns true when the current user has an accepted connection with `other`
create or replace function public.is_connected(other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connections
    where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = other)
        or (addressee_id = auth.uid() and requester_id = other)
      )
  );
$$;

-- Create or fetch the conversation between the current user and `other`.
-- Returns the conversation id (new or existing). Requires an accepted
-- connection; otherwise raises.
create or replace function public.start_conversation(other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  a  uuid;
  b  uuid;
  v_id uuid;
begin
  if me is null then raise exception 'Not signed in'; end if;
  if other is null or other = me then raise exception 'Invalid recipient'; end if;
  if not public.is_connected(other) then
    raise exception 'You must be connected before messaging';
  end if;

  if me < other then
    a := me; b := other;
  else
    a := other; b := me;
  end if;

  select id into v_id from public.conversations where user_a = a and user_b = b;
  if v_id is null then
    insert into public.conversations (user_a, user_b)
    values (a, b)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;
grant execute on function public.is_connected(uuid)       to authenticated;
grant execute on function public.start_conversation(uuid) to authenticated;

-- Create a connection request with 30-day cooldown after a decline, and
-- a soft rate-limit of max 20 outstanding pending requests per user.
create or replace function public.request_connection(other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  v_existing record;
  v_open    int;
  v_id      uuid;
begin
  if me is null then raise exception 'Not signed in'; end if;
  if other is null or other = me then raise exception 'Invalid recipient'; end if;

  -- If a connection row already exists (in either direction), enforce rules.
  select * into v_existing
    from public.connections
   where (requester_id = me and addressee_id = other)
      or (requester_id = other and addressee_id = me)
   limit 1;

  if found then
    if v_existing.status = 'accepted' then
      raise exception 'Already connected';
    elsif v_existing.status = 'pending' then
      -- Already pending — just return the existing id
      return v_existing.id;
    elsif v_existing.status = 'declined' then
      -- 30-day cooldown enforced on the requester side
      if v_existing.requester_id = me
         and v_existing.declined_at is not null
         and v_existing.declined_at > now() - interval '30 days' then
        raise exception 'You were declined. Try again after %',
          to_char(v_existing.declined_at + interval '30 days', 'Mon DD, YYYY');
      end if;
      -- Otherwise refresh the row into a new pending request
      update public.connections
         set requester_id = me,
             addressee_id = other,
             status = 'pending',
             created_at = now(),
             responded_at = null,
             declined_at = null
       where id = v_existing.id
       returning id into v_id;
      return v_id;
    end if;
  end if;

  -- Rate limit: no more than 20 outstanding pending requests from me
  select count(*) into v_open
    from public.connections
   where requester_id = me and status = 'pending';
  if v_open >= 20 then
    raise exception 'Too many pending requests. Wait for responses first.';
  end if;

  insert into public.connections (requester_id, addressee_id, status)
  values (me, other, 'pending')
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.request_connection(uuid) to authenticated;

-- ------------------------------------------------------------
-- 5) RLS
-- ------------------------------------------------------------
alter table public.connections   enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ---------- connections ----------
drop policy if exists connections_read on public.connections;
create policy connections_read on public.connections
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists connections_request on public.connections;
create policy connections_request on public.connections
  for insert to authenticated
  with check (requester_id = auth.uid());

-- Addressee updates status to accept/decline; requester can cancel by
-- setting status back to 'declined' (soft cancel).
drop policy if exists connections_respond on public.connections;
create policy connections_respond on public.connections
  for update to authenticated
  using (addressee_id = auth.uid() or requester_id = auth.uid())
  with check (addressee_id = auth.uid() or requester_id = auth.uid());

-- ---------- conversations ----------
drop policy if exists conversations_read on public.conversations;
create policy conversations_read on public.conversations
  for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- Only inserts allowed via start_conversation() (security definer bypasses)
-- but we still need a policy so the function can write on the caller's behalf.
drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (
    (user_a = auth.uid() or user_b = auth.uid())
    and public.is_connected(case when user_a = auth.uid() then user_b else user_a end)
  );

drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations
  for update to authenticated
  using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());

-- ---------- messages ----------
drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
        and public.is_connected(case when c.user_a = auth.uid() then c.user_b else c.user_a end)
    )
  );

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own on public.messages
  for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- ------------------------------------------------------------
-- 6) Keep conversations.last_message_at fresh
-- ------------------------------------------------------------
create or replace function public.bump_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_sender_id  = new.sender_id
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conv on public.messages;
create trigger messages_bump_conv
  after insert on public.messages
  for each row execute function public.bump_conversation_on_message();

-- ============================================================
-- migration-messaging-admin.sql
--
-- Gives admins / owner full read + write over connections,
-- conversations, and messages, plus a helper RPC for forcibly
-- creating an accepted connection between any two users (useful
-- for seeding test chats during development).
--
-- Safe to re-run.
-- ============================================================

-- ---------- connections ----------
drop policy if exists connections_admin_all on public.connections;
create policy connections_admin_all on public.connections
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- conversations ----------
drop policy if exists conversations_admin_all on public.conversations;
create policy conversations_admin_all on public.conversations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- messages ----------
drop policy if exists messages_admin_all on public.messages;
create policy messages_admin_all on public.messages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- admin_force_connect(a, b, status) — one-shot helper for admins
-- that creates or updates the edge between any two profiles.
-- Accepts 'pending' | 'accepted' | 'declined'. Returns the edge id.
-- ------------------------------------------------------------
create or replace function public.admin_force_connect(
  a uuid,
  b uuid,
  new_status text default 'accepted'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_existing record;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;
  if a is null or b is null or a = b then
    raise exception 'Invalid pair';
  end if;
  if new_status not in ('pending','accepted','declined') then
    raise exception 'Invalid status';
  end if;

  -- Look up existing edge in either direction
  select * into v_existing
    from public.connections
   where (requester_id = a and addressee_id = b)
      or (requester_id = b and addressee_id = a)
   limit 1;

  if found then
    update public.connections
       set status        = new_status,
           responded_at  = case when new_status = 'pending' then null else now() end,
           declined_at   = case when new_status = 'declined' then now() else null end
     where id = v_existing.id
     returning id into v_id;
  else
    insert into public.connections (requester_id, addressee_id, status,
                                    responded_at, declined_at)
    values (
      a, b, new_status,
      case when new_status = 'pending' then null else now() end,
      case when new_status = 'declined' then now() else null end
    )
    returning id into v_id;
  end if;

  -- If accepted, also eagerly create the conversation so admins can see
  -- both users in the messages list without either one initiating a chat.
  if new_status = 'accepted' then
    declare
      lo uuid := least(a, b);
      hi uuid := greatest(a, b);
    begin
      insert into public.conversations (user_a, user_b)
      values (lo, hi)
      on conflict do nothing;
    end;
  end if;

  return v_id;
end;
$$;

grant execute on function public.admin_force_connect(uuid, uuid, text) to authenticated;

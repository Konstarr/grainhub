-- ============================================================
-- migration-forum-settings-and-log.sql
--
-- Three pieces of moderation infrastructure on top of
-- migration-forum-moderation.sql:
--
--   1. forum_settings        — runtime-configurable rate limits
--                              (admins edit in the admin UI).
--   2. moderation_log        — audit trail of mod actions
--                              (lock/pin/solve/delete on threads
--                              and posts).
--   3. filter_violations     — record of attempted posts that hit
--                              the word filter, populated by the
--                              client after the trigger rejects.
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- ── 1) forum_settings table ──────────────────────────────
create table if not exists public.forum_settings (
  key   text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.forum_settings enable row level security;

-- SELECT: any signed-in user can read the limits (the values
-- aren't sensitive — surfacing them in error messages is fine).
drop policy if exists forum_settings_select on public.forum_settings;
create policy forum_settings_select on public.forum_settings
  for select to authenticated using (true);

-- All writes via the SECURITY DEFINER RPC below.

-- Seed defaults (idempotent)
insert into public.forum_settings (key, value) values
  ('thread_rate_limit_per_hour', '2'),
  ('post_rate_limit_per_hour',   '30')
on conflict (key) do nothing;

create or replace function public.get_forum_setting(key_in text, default_in int)
returns int
language plpgsql
stable
as $$
declare
  v text;
begin
  select value into v from public.forum_settings where key = key_in;
  if v is null then return default_in; end if;
  begin
    return v::int;
  exception when others then
    return default_in;
  end;
end $$;

-- Update rate-limit triggers to read from forum_settings.
create or replace function public.enforce_thread_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  caller_role  text;
  max_per_hour int := public.get_forum_setting('thread_rate_limit_per_hour', 2);
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;
  select count(*) into recent_count
    from public.forum_threads
   where author_id = new.author_id
     and created_at > now() - interval '1 hour';
  if recent_count >= max_per_hour then
    raise exception 'rate_limited_threads: you can create at most % threads per hour. Please wait before posting another.', max_per_hour
      using errcode = 'P0001';
  end if;
  return new;
end $$;

create or replace function public.enforce_post_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  caller_role  text;
  max_per_hour int := public.get_forum_setting('post_rate_limit_per_hour', 30);
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;
  select count(*) into recent_count
    from public.forum_posts
   where author_id = new.author_id
     and created_at > now() - interval '1 hour';
  if recent_count >= max_per_hour then
    raise exception 'rate_limited_posts: you can post at most % replies per hour. Please slow down.', max_per_hour
      using errcode = 'P0001';
  end if;
  return new;
end $$;

-- Admin-only RPC to update settings.
create or replace function public.update_forum_setting(key_in text, value_in text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare caller_role text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'owner') then
    raise exception 'admin_only' using errcode = 'P0001';
  end if;
  insert into public.forum_settings (key, value, updated_at)
  values (key_in, value_in, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;
revoke all on function public.update_forum_setting(text, text) from public;
grant execute on function public.update_forum_setting(text, text) to authenticated;

-- ── 2) moderation_log table + triggers ───────────────────
create table if not exists public.moderation_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,        -- 'thread_locked' | 'thread_pinned' | etc.
  target_type text not null,        -- 'thread' | 'post' | 'user' | 'report'
  target_id   uuid,
  summary     text,                 -- human-readable e.g. thread title
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists moderation_log_created_idx
  on public.moderation_log (created_at desc);

alter table public.moderation_log enable row level security;
drop policy if exists moderation_log_select on public.moderation_log;
create policy moderation_log_select on public.moderation_log
  for select using (public.is_moderator() or public.is_admin());

-- Trigger: log thread state changes (lock/pin/solve) and deletions.
create or replace function public.log_thread_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  -- Only log if a moderator/admin made the change. End-user
  -- self-edits to their own thread don't need an audit row.
  if caller_role not in ('moderator', 'admin', 'owner') then
    if tg_op = 'UPDATE' then return new; end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if new.is_locked is distinct from old.is_locked then
      insert into public.moderation_log (actor_id, action, target_type, target_id, summary)
      values (auth.uid(), case when new.is_locked then 'thread_locked' else 'thread_unlocked' end,
              'thread', new.id, new.title);
    end if;
    if new.is_pinned is distinct from old.is_pinned then
      insert into public.moderation_log (actor_id, action, target_type, target_id, summary)
      values (auth.uid(), case when new.is_pinned then 'thread_pinned' else 'thread_unpinned' end,
              'thread', new.id, new.title);
    end if;
    if new.is_solved is distinct from old.is_solved then
      insert into public.moderation_log (actor_id, action, target_type, target_id, summary)
      values (auth.uid(), case when new.is_solved then 'thread_solved' else 'thread_unsolved' end,
              'thread', new.id, new.title);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.moderation_log (actor_id, action, target_type, target_id, summary)
    values (auth.uid(), 'thread_deleted', 'thread', old.id, old.title);
    return old;
  end if;
  return null;
end $$;

drop trigger if exists log_thread_change_trg on public.forum_threads;
create trigger log_thread_change_trg
  after update or delete on public.forum_threads
  for each row execute function public.log_thread_change();

-- Trigger: log post soft-deletes and restores.
create or replace function public.log_post_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare caller_role text;
begin
  if tg_op <> 'UPDATE' then return new; end if;
  if new.is_deleted is not distinct from old.is_deleted then
    return new;
  end if;
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('moderator', 'admin', 'owner') then
    return new;
  end if;
  insert into public.moderation_log (actor_id, action, target_type, target_id, summary, details)
  values (
    auth.uid(),
    case when new.is_deleted then 'post_soft_deleted' else 'post_restored' end,
    'post', new.id,
    left(coalesce(new.body, ''), 80),
    jsonb_build_object('thread_id', new.thread_id)
  );
  return new;
end $$;

drop trigger if exists log_post_change_trg on public.forum_posts;
create trigger log_post_change_trg
  after update on public.forum_posts
  for each row execute function public.log_post_change();

-- ── 3) filter_violations + log RPC ───────────────────────
create table if not exists public.filter_violations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('thread', 'post', 'community_post', 'community_message')),
  attempted_text text not null,
  matched_word   text,
  created_at  timestamptz not null default now()
);
create index if not exists filter_violations_user_idx on public.filter_violations (user_id, created_at desc);
create index if not exists filter_violations_created_idx on public.filter_violations (created_at desc);

alter table public.filter_violations enable row level security;
drop policy if exists filter_violations_select on public.filter_violations;
create policy filter_violations_select on public.filter_violations
  for select using (public.is_moderator() or public.is_admin());

-- The trigger that rejects a post can't INSERT here in the same
-- transaction (the RAISE rolls everything back). Instead the
-- client catches the rejection and calls this RPC.
create or replace function public.log_filter_violation(
  target_type_in text,
  attempted_text_in text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  hit text;
begin
  if uid is null then return; end if;
  -- Cap the stored text so no one can blow the table up.
  if length(attempted_text_in) > 4000 then
    attempted_text_in := substring(attempted_text_in for 4000);
  end if;
  hit := public.check_text_for_blocked_words(attempted_text_in);
  insert into public.filter_violations (user_id, target_type, attempted_text, matched_word)
  values (uid, target_type_in, attempted_text_in, hit);
end $$;

revoke all on function public.log_filter_violation(text, text) from public;
grant execute on function public.log_filter_violation(text, text) to authenticated;

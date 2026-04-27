-- ============================================================
-- migration-notifications.sql
--
-- Site-wide in-app notification system. One row per delivery so
-- each recipient gets their own copy (cheap, easy to mark read).
--
-- Triggers fan out on:
--   * forum_posts insert      → thread author + every subscriber
--   * community_posts insert  → every community member
--   * connections insert      → addressee (when status='pending')
--   * messages insert (DM)    → the other participant
--
-- Self-notifications (you triggering an event you'd be notified by)
-- are suppressed at the trigger level. RLS lets each user see / mark
-- read / delete only their own rows.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Table
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles(id) on delete cascade,
  actor_id      uuid references public.profiles(id) on delete set null,
  kind          text not null,
  title         text,
  body          text,
  link          text,
  payload       jsonb,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_id)
  where is_read = false;

alter table public.notifications enable row level security;

-- Each user only ever sees / mutates their own rows.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated
  using (recipient_id = auth.uid());

-- No INSERT policy on purpose — only triggers (SECURITY DEFINER) write.

-- ------------------------------------------------------------
-- RPCs: mark read, mark all read, count
-- ------------------------------------------------------------
create or replace function public.mark_notification_read(notif_in uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.notifications
     set is_read = true
   where id = notif_in
     and recipient_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.notifications
     set is_read = true
   where recipient_id = auth.uid()
     and is_read = false;
$$;

create or replace function public.fetch_my_unread_notification_count()
returns integer
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select count(*)::int
    from public.notifications
   where recipient_id = auth.uid()
     and is_read = false;
$$;

grant execute on function public.mark_notification_read(uuid)        to authenticated;
grant execute on function public.mark_all_notifications_read()       to authenticated;
grant execute on function public.fetch_my_unread_notification_count() to authenticated;

-- ------------------------------------------------------------
-- Trigger: forum_posts insert
--   notify thread author (kind='thread_reply')
--   notify each subscriber (kind='subscribed_reply')
--   suppress self
-- ------------------------------------------------------------
create or replace function public.notify_on_forum_post()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_thread record;
  v_actor_name text;
  v_link text;
begin
  select t.id, t.slug, t.title, t.author_id
    into v_thread
    from public.forum_threads t
   where t.id = new.thread_id;
  if not found then return new; end if;

  select coalesce(p.full_name, p.username, 'Someone')
    into v_actor_name
    from public.profiles p
   where p.id = new.author_id;

  v_link := '/forum/thread/' || v_thread.slug;

  -- Thread author
  if v_thread.author_id is not null and v_thread.author_id <> new.author_id then
    insert into public.notifications (recipient_id, actor_id, kind, title, body, link, payload)
    values (
      v_thread.author_id,
      new.author_id,
      'thread_reply',
      coalesce(v_actor_name, 'Someone') || ' replied to your thread',
      v_thread.title,
      v_link,
      jsonb_build_object('thread_id', v_thread.id, 'post_id', new.id)
    );
  end if;

  -- Subscribers (excluding the author of the post AND the thread author
  -- to avoid double-notifying when the thread author is also subscribed)
  insert into public.notifications (recipient_id, actor_id, kind, title, body, link, payload)
  select s.user_id,
         new.author_id,
         'subscribed_reply',
         coalesce(v_actor_name, 'Someone') || ' replied to a thread you follow',
         v_thread.title,
         v_link,
         jsonb_build_object('thread_id', v_thread.id, 'post_id', new.id)
    from public.thread_subscriptions s
   where s.thread_id = new.thread_id
     and s.user_id <> new.author_id
     and s.user_id <> coalesce(v_thread.author_id, '00000000-0000-0000-0000-000000000000'::uuid);

  return new;
end;
$$;

drop trigger if exists notify_on_forum_post_trg on public.forum_posts;
create trigger notify_on_forum_post_trg
  after insert on public.forum_posts
  for each row execute function public.notify_on_forum_post();

-- ------------------------------------------------------------
-- Trigger: community_posts insert
--   notify every member except the author.
-- ------------------------------------------------------------
create or replace function public.notify_on_community_post()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_comm record;
  v_actor_name text;
  v_link text;
  v_snippet text;
begin
  select c.id, c.slug, c.name into v_comm
    from public.communities c where c.id = new.community_id;
  if not found then return new; end if;

  select coalesce(p.full_name, p.username, 'Someone')
    into v_actor_name
    from public.profiles p
   where p.id = new.author_id;

  v_link := '/c/' || v_comm.slug;
  v_snippet := substring(coalesce(new.body, '') from 1 for 140);

  insert into public.notifications (recipient_id, actor_id, kind, title, body, link, payload)
  select m.profile_id,
         new.author_id,
         'community_post',
         coalesce(v_actor_name, 'Someone') || ' posted in ' || v_comm.name,
         v_snippet,
         v_link,
         jsonb_build_object('community_id', v_comm.id, 'post_id', new.id)
    from public.community_members m
   where m.community_id = new.community_id
     and m.profile_id <> new.author_id;

  return new;
end;
$$;

drop trigger if exists notify_on_community_post_trg on public.community_posts;
create trigger notify_on_community_post_trg
  after insert on public.community_posts
  for each row execute function public.notify_on_community_post();

-- ------------------------------------------------------------
-- Trigger: connections insert (status='pending')
-- ------------------------------------------------------------
create or replace function public.notify_on_connection_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_name text;
begin
  if new.status is distinct from 'pending' then return new; end if;
  if new.requester_id = new.addressee_id then return new; end if;

  select coalesce(p.full_name, p.username, 'Someone')
    into v_actor_name
    from public.profiles p
   where p.id = new.requester_id;

  insert into public.notifications (recipient_id, actor_id, kind, title, body, link, payload)
  values (
    new.addressee_id,
    new.requester_id,
    'connection_request',
    coalesce(v_actor_name, 'Someone') || ' wants to connect',
    null,
    '/inbox',
    jsonb_build_object('connection_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists notify_on_connection_request_trg on public.connections;
create trigger notify_on_connection_request_trg
  after insert on public.connections
  for each row execute function public.notify_on_connection_request();

-- ------------------------------------------------------------
-- Trigger: DM messages insert
-- ------------------------------------------------------------
create or replace function public.notify_on_dm()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_conv record;
  v_recipient uuid;
  v_actor_name text;
  v_snippet text;
begin
  select c.id, c.user_a, c.user_b into v_conv
    from public.conversations c where c.id = new.conversation_id;
  if not found then return new; end if;

  if new.sender_id = v_conv.user_a then
    v_recipient := v_conv.user_b;
  else
    v_recipient := v_conv.user_a;
  end if;
  if v_recipient is null or v_recipient = new.sender_id then return new; end if;

  select coalesce(p.full_name, p.username, 'Someone')
    into v_actor_name
    from public.profiles p
   where p.id = new.sender_id;

  v_snippet := substring(coalesce(new.body, '') from 1 for 140);

  insert into public.notifications (recipient_id, actor_id, kind, title, body, link, payload)
  values (
    v_recipient,
    new.sender_id,
    'dm',
    coalesce(v_actor_name, 'Someone') || ' sent you a message',
    v_snippet,
    '/inbox',
    jsonb_build_object('conversation_id', v_conv.id, 'message_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists notify_on_dm_trg on public.messages;
create trigger notify_on_dm_trg
  after insert on public.messages
  for each row execute function public.notify_on_dm();

-- ------------------------------------------------------------
-- Realtime publication: stream INSERTs to the client so the bell
-- can light up without polling.
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end $$;

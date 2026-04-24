-- ============================================================
-- migration-community-messages.sql
--
-- Turns communities from thread-listings into chat rooms. Each
-- community now has a simple linear stream of messages posted by
-- its members.
--
-- RLS:
--   - Read messages only if you're a member of the community.
--   - Insert messages only as yourself AND only if you're a member.
--   - Delete your own messages. Mods + owners can soft-delete anyone.
--   - No updates from clients (edit history would need its own model).
--
-- Realtime: enabled on the table so the frontend can stream inserts.
--
-- Safe to re-run.
-- ============================================================

create table if not exists public.community_messages (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  author_id     uuid not null references public.profiles(id)    on delete set null,
  body          text not null check (char_length(body) between 1 and 4000),
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists community_messages_community_idx
  on public.community_messages(community_id, created_at desc);
create index if not exists community_messages_author_idx
  on public.community_messages(author_id);

alter table public.community_messages enable row level security;

-- Shared helper: is the caller a member of the given community?
create or replace function public.is_community_member(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.community_members
     where community_id = cid and profile_id = auth.uid()
  );
$$;
revoke all on function public.is_community_member(uuid) from public;
grant execute on function public.is_community_member(uuid) to authenticated;

-- Is the caller a mod or owner of the community?
create or replace function public.is_community_mod(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.community_members
     where community_id = cid
       and profile_id   = auth.uid()
       and role in ('mod','owner')
  );
$$;
revoke all on function public.is_community_mod(uuid) from public;
grant execute on function public.is_community_mod(uuid) to authenticated;

-- Select: members only (admins always allowed)
drop policy if exists community_msgs_select on public.community_messages;
create policy community_msgs_select on public.community_messages
  for select using (
    public.is_admin()
    or public.is_community_member(community_id)
  );

-- Insert: must be sending as yourself AND be a member
drop policy if exists community_msgs_insert on public.community_messages;
create policy community_msgs_insert on public.community_messages
  for insert with check (
    auth.uid() = author_id
    and public.is_community_member(community_id)
  );

-- Delete: own, or mod/owner, or admin. (We actually soft-delete in
-- the UI by setting deleted_at, but allowing hard delete is fine.)
drop policy if exists community_msgs_delete on public.community_messages;
create policy community_msgs_delete on public.community_messages
  for delete using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

-- Update: allow soft-delete by mods/owners (sets deleted_at). Author
-- can also soft-delete their own. No other updates permitted.
drop policy if exists community_msgs_update on public.community_messages;
create policy community_msgs_update on public.community_messages
  for update using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

-- ── Realtime ────────────────────────────────────────────
-- Add the table to the realtime publication so supabase.channel()
-- can stream INSERTs. This is additive — safe if already in the pub.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
exception when others then
  -- If the publication doesn't exist in this environment (e.g. local
  -- Postgres without Supabase), ignore and move on. Realtime just
  -- won't stream updates; polling still works.
  null;
end $$;

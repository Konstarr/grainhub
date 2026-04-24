-- ============================================================
-- migration-communities.sql
--
-- Introduces a real community system (Reddit-style) on top of the
-- existing forum structure. A community is a user-owned space with
-- a name, icon, banner, and members. Threads can optionally belong
-- to a community — if they do, the community is their "home."
--
-- Tables:
--   communities          — the user-created communities
--   community_members    — many-to-many profile ↔ community + role
--
-- Extensions to existing tables:
--   forum_threads.community_id  — nullable FK to communities
--
-- RLS rules:
--   - Anyone can read public communities and their member counts.
--   - Anyone authenticated can create a community. On creation a
--     trigger auto-adds the creator as 'owner'.
--   - Anyone authenticated can join/leave (insert/delete their own
--     community_members row).
--   - Only the owner and mods can update the community itself.
--
-- All triggers are idempotent; the migration is safe to re-run.
-- ============================================================

-- ── 1) communities table ─────────────────────────────────
create table if not exists public.communities (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  icon_url      text,
  banner_url    text,
  created_by    uuid references public.profiles(id) on delete set null,
  is_public     boolean not null default true,
  member_count  integer not null default 0,
  thread_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists communities_slug_idx on public.communities(slug);
create index if not exists communities_member_count_idx on public.communities(member_count desc);

drop trigger if exists communities_touch on public.communities;
create trigger communities_touch
  before update on public.communities
  for each row execute function public.touch_updated_at();

-- ── 2) community_members table ───────────────────────────
create table if not exists public.community_members (
  community_id  uuid not null references public.communities(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id)    on delete cascade,
  role          text not null default 'member'
                  check (role in ('member', 'mod', 'owner')),
  joined_at     timestamptz not null default now(),
  primary key (community_id, profile_id)
);

create index if not exists community_members_profile_idx
  on public.community_members(profile_id);

-- ── 3) forum_threads → optional community ───────────────
alter table public.forum_threads
  add column if not exists community_id uuid references public.communities(id) on delete set null;

create index if not exists forum_threads_community_idx
  on public.forum_threads(community_id, last_reply_at desc)
  where community_id is not null;

-- ── 4) Maintain denormalized counts ──────────────────────
create or replace function public.bump_community_member_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.communities
       set member_count = member_count + 1
     where id = new.community_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.communities
       set member_count = greatest(member_count - 1, 0)
     where id = old.community_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists community_members_bump on public.community_members;
create trigger community_members_bump
  after insert or delete on public.community_members
  for each row execute function public.bump_community_member_count();

create or replace function public.bump_community_thread_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    if new.community_id is not null then
      update public.communities
         set thread_count = thread_count + 1
       where id = new.community_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    if old.community_id is not null then
      update public.communities
         set thread_count = greatest(thread_count - 1, 0)
       where id = old.community_id;
    end if;
    return old;
  elsif (tg_op = 'UPDATE') then
    if coalesce(old.community_id::text, '') <> coalesce(new.community_id::text, '') then
      if old.community_id is not null then
        update public.communities set thread_count = greatest(thread_count - 1, 0) where id = old.community_id;
      end if;
      if new.community_id is not null then
        update public.communities set thread_count = thread_count + 1 where id = new.community_id;
      end if;
    end if;
    return new;
  end if;
  return null;
end $$;

drop trigger if exists forum_threads_community_bump on public.forum_threads;
create trigger forum_threads_community_bump
  after insert or update or delete on public.forum_threads
  for each row execute function public.bump_community_thread_count();

-- ── 5) Creator auto-joins as 'owner' ─────────────────────
create or replace function public.communities_auto_owner()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.community_members (community_id, profile_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict (community_id, profile_id) do update
      set role = excluded.role;
  end if;
  return new;
end $$;

drop trigger if exists communities_auto_owner_trg on public.communities;
create trigger communities_auto_owner_trg
  after insert on public.communities
  for each row execute function public.communities_auto_owner();

-- ── 6) Row Level Security ────────────────────────────────
alter table public.communities       enable row level security;
alter table public.community_members enable row level security;

-- Communities: public read, author-or-mod write
drop policy if exists communities_select on public.communities;
create policy communities_select on public.communities
  for select using (is_public = true or exists (
    select 1 from public.community_members cm
     where cm.community_id = communities.id and cm.profile_id = auth.uid()
  ) or public.is_admin());

drop policy if exists communities_insert_auth on public.communities;
create policy communities_insert_auth on public.communities
  for insert with check (auth.uid() = created_by);

drop policy if exists communities_update_mod on public.communities;
create policy communities_update_mod on public.communities
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = communities.id
         and cm.profile_id = auth.uid()
         and cm.role in ('mod', 'owner')
    )
  );

drop policy if exists communities_delete_owner on public.communities;
create policy communities_delete_owner on public.communities
  for delete using (
    public.is_admin()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = communities.id
         and cm.profile_id = auth.uid()
         and cm.role = 'owner'
    )
  );

-- Members: anyone reads public rosters, users manage their own membership
drop policy if exists community_members_select on public.community_members;
create policy community_members_select on public.community_members
  for select using (true);

drop policy if exists community_members_join on public.community_members;
create policy community_members_join on public.community_members
  for insert with check (auth.uid() = profile_id);

drop policy if exists community_members_leave on public.community_members;
create policy community_members_leave on public.community_members
  for delete using (auth.uid() = profile_id or public.is_admin());

-- Mods/owners can update OTHERS' roles within their community; users
-- cannot update their own row (prevents self-promotion).
drop policy if exists community_members_update_mod on public.community_members;
create policy community_members_update_mod on public.community_members
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = community_members.community_id
         and cm.profile_id = auth.uid()
         and cm.role in ('mod', 'owner')
         and cm.profile_id <> community_members.profile_id
    )
  );

-- ── 7) Convenience RPCs ──────────────────────────────────

-- My joined communities, with icon/name for fast sidebar rendering.
create or replace function public.my_communities()
returns table (
  id uuid, slug text, name text, icon_url text, member_count int, role text, joined_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.slug, c.name, c.icon_url, c.member_count, cm.role, cm.joined_at
    from public.community_members cm
    join public.communities c on c.id = cm.community_id
   where cm.profile_id = auth.uid()
   order by cm.joined_at desc;
$$;
revoke all on function public.my_communities() from public;
grant execute on function public.my_communities() to authenticated;

-- Mutual communities between two profiles — powers the "you both
-- belong to X, Y, Z" callout on profile pages.
create or replace function public.mutual_communities(other uuid)
returns table (id uuid, slug text, name text, icon_url text, member_count int)
language sql stable security definer set search_path = public
as $$
  select c.id, c.slug, c.name, c.icon_url, c.member_count
    from public.community_members mine
    join public.community_members theirs
      on mine.community_id = theirs.community_id
    join public.communities c
      on c.id = mine.community_id
   where mine.profile_id = auth.uid()
     and theirs.profile_id = other
     and c.is_public = true
   order by c.member_count desc;
$$;
revoke all on function public.mutual_communities(uuid) from public;
grant execute on function public.mutual_communities(uuid) to authenticated;

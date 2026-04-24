-- ============================================================
-- migration-community-posts.sql
--
-- Communities become Facebook-style feeds: each community has a
-- stream of POSTS. A post can be text + optional image; anyone who
-- is a member can react ("like") and comment.
--
-- Tables:
--   community_posts         — top-level post in a community feed
--   community_post_comments — flat comment thread on a post
--   community_post_likes    — one row per (post, profile) like
--
-- Counts on community_posts (like_count, comment_count) are kept in
-- sync by triggers so the feed can render without expensive joins.
--
-- RLS:
--   - Read a post / its comments / its likes only if you're a member
--     of the community (same helper used by community_messages).
--   - Insert a post or comment: must be a member and using your own
--     author_id.
--   - Insert/delete a like: must be a member, one row per profile.
--   - Delete / soft-delete: own record, or mod/owner, or admin.
--
-- Safe to re-run.
-- ============================================================

-- ── 1) community_posts ──────────────────────────────────
create table if not exists public.community_posts (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid not null references public.communities(id) on delete cascade,
  author_id      uuid not null references public.profiles(id)    on delete set null,
  body           text not null check (char_length(body) between 1 and 8000),
  image_url      text,
  like_count     int not null default 0,
  comment_count  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists community_posts_community_idx
  on public.community_posts(community_id, created_at desc);

drop trigger if exists community_posts_touch on public.community_posts;
create trigger community_posts_touch
  before update on public.community_posts
  for each row execute function public.touch_updated_at();

alter table public.community_posts enable row level security;

drop policy if exists community_posts_select on public.community_posts;
create policy community_posts_select on public.community_posts
  for select using (public.is_admin() or public.is_community_member(community_id));

drop policy if exists community_posts_insert on public.community_posts;
create policy community_posts_insert on public.community_posts
  for insert with check (
    auth.uid() = author_id
    and public.is_community_member(community_id)
  );

drop policy if exists community_posts_update on public.community_posts;
create policy community_posts_update on public.community_posts
  for update using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

drop policy if exists community_posts_delete on public.community_posts;
create policy community_posts_delete on public.community_posts
  for delete using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

-- ── 2) community_post_comments ──────────────────────────
create table if not exists public.community_post_comments (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid not null references public.community_posts(id) on delete cascade,
  community_id   uuid not null references public.communities(id)     on delete cascade,
  author_id      uuid not null references public.profiles(id)        on delete set null,
  body           text not null check (char_length(body) between 1 and 4000),
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists community_post_comments_post_idx
  on public.community_post_comments(post_id, created_at asc);

alter table public.community_post_comments enable row level security;

drop policy if exists community_post_comments_select on public.community_post_comments;
create policy community_post_comments_select on public.community_post_comments
  for select using (public.is_admin() or public.is_community_member(community_id));

drop policy if exists community_post_comments_insert on public.community_post_comments;
create policy community_post_comments_insert on public.community_post_comments
  for insert with check (
    auth.uid() = author_id
    and public.is_community_member(community_id)
  );

drop policy if exists community_post_comments_update on public.community_post_comments;
create policy community_post_comments_update on public.community_post_comments
  for update using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

drop policy if exists community_post_comments_delete on public.community_post_comments;
create policy community_post_comments_delete on public.community_post_comments
  for delete using (
    auth.uid() = author_id
    or public.is_community_mod(community_id)
    or public.is_admin()
  );

-- ── 3) community_post_likes ─────────────────────────────
create table if not exists public.community_post_likes (
  post_id      uuid not null references public.community_posts(id) on delete cascade,
  community_id uuid not null references public.communities(id)     on delete cascade,
  profile_id   uuid not null references public.profiles(id)        on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create index if not exists community_post_likes_profile_idx
  on public.community_post_likes(profile_id);

alter table public.community_post_likes enable row level security;

drop policy if exists community_post_likes_select on public.community_post_likes;
create policy community_post_likes_select on public.community_post_likes
  for select using (public.is_admin() or public.is_community_member(community_id));

drop policy if exists community_post_likes_insert on public.community_post_likes;
create policy community_post_likes_insert on public.community_post_likes
  for insert with check (
    auth.uid() = profile_id
    and public.is_community_member(community_id)
  );

drop policy if exists community_post_likes_delete on public.community_post_likes;
create policy community_post_likes_delete on public.community_post_likes
  for delete using (auth.uid() = profile_id or public.is_admin());

-- ── 4) Count maintenance triggers ───────────────────────
create or replace function public.bump_post_like_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.community_posts
       set like_count = like_count + 1
     where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.community_posts
       set like_count = greatest(like_count - 1, 0)
     where id = old.post_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists community_post_likes_bump on public.community_post_likes;
create trigger community_post_likes_bump
  after insert or delete on public.community_post_likes
  for each row execute function public.bump_post_like_count();

create or replace function public.bump_post_comment_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.community_posts
       set comment_count = comment_count + 1
     where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.community_posts
       set comment_count = greatest(comment_count - 1, 0)
     where id = old.post_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists community_post_comments_bump on public.community_post_comments;
create trigger community_post_comments_bump
  after insert or delete on public.community_post_comments
  for each row execute function public.bump_post_comment_count();

-- ── 5) Realtime publication ─────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'community_posts'
  ) then
    alter publication supabase_realtime add table public.community_posts;
  end if;

  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'community_post_comments'
  ) then
    alter publication supabase_realtime add table public.community_post_comments;
  end if;

  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'community_post_likes'
  ) then
    alter publication supabase_realtime add table public.community_post_likes;
  end if;
exception when others then
  null;
end $$;

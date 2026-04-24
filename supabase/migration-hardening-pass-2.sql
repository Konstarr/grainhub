-- ============================================================
-- migration-hardening-pass-2.sql
--
-- Second-pass production hardening:
--
--   1. Missing indexes that the audit flagged on
--      marketplace_listings, jobs, and community_posts.
--
--   2. Rate-limit triggers on user-generated content so a script
--      can't hammer create endpoints. Caps are intentionally
--      generous to never bother a real user; they're floors against
--      abuse, not editorial limits.
--
--   3. URL safety triggers on tables that store user-supplied
--      image / link URLs. Server-side block on `javascript:`,
--      `data:`, `file:`, `vbscript:` even if a frontend gate slips.
--
-- All idempotent. Safe to re-run.
-- ============================================================

-- ── 1) Missing indexes ─────────────────────────────────

-- Marketplace: filter by category + sort by recency, plus the sold flag
create index if not exists marketplace_category_sold_idx
  on public.marketplace_listings(category, is_sold, created_at desc);
create index if not exists marketplace_created_idx
  on public.marketplace_listings(created_at desc);
create index if not exists marketplace_trade_idx
  on public.marketplace_listings(trade) where trade is not null;

-- Jobs: filter by trade / employment type / approved + active
create index if not exists jobs_trade_idx
  on public.jobs(trade) where trade is not null;
create index if not exists jobs_employment_idx
  on public.jobs(employment_type);
create index if not exists jobs_active_idx
  on public.jobs(is_approved, is_filled, expires_at);

-- Community posts: pinned-first ordering used on every community page
create index if not exists community_posts_pinned_created_idx
  on public.community_posts(community_id, is_pinned desc, created_at desc);

-- ── 2) Rate-limit helpers ──────────────────────────────

-- Generic per-user rate limiter. Counts how many rows from `tab` the
-- caller has inserted in the last `seconds` seconds. If at or over
-- `limit_count`, raise. `tab` is interpolated as a regclass so we
-- don't allow arbitrary table names from arbitrary callers — only
-- our own triggers call this.
create or replace function public.assert_rate_limit(
  tab           regclass,
  author_col    text,
  seconds       integer,
  limit_count   integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n   integer;
begin
  if uid is null then return; end if;        -- service role / triggers
  -- Skip rate limit for admins so moderators can clean up backlogs.
  if public.is_admin() then return; end if;

  execute format(
    'select count(*) from %s where %I = $1 and created_at > now() - interval ''%s seconds''',
    tab, author_col, seconds
  ) into n using uid;

  if n >= limit_count then
    raise exception 'rate_limited: too many writes — try again in a moment'
      using errcode = 'P0001';
  end if;
end $$;
revoke all on function public.assert_rate_limit(regclass, text, integer, integer) from public;

-- Per-table trigger functions that call the limiter with sensible
-- caps. Numbers chosen to be generous for humans, restrictive for
-- bots. Adjust freely — the function definitions are the source of
-- truth so tightening is a one-line change.

-- Forum threads: 5 per minute, 30 per hour
create or replace function public.rl_forum_threads()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.forum_threads'::regclass, 'author_id', 60, 5);
  perform public.assert_rate_limit('public.forum_threads'::regclass, 'author_id', 3600, 30);
  return new;
end $$;
drop trigger if exists rl_forum_threads on public.forum_threads;
create trigger rl_forum_threads
  before insert on public.forum_threads
  for each row execute function public.rl_forum_threads();

-- Forum posts (replies): 20 per minute, 200 per hour
create or replace function public.rl_forum_posts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.forum_posts'::regclass, 'author_id', 60, 20);
  perform public.assert_rate_limit('public.forum_posts'::regclass, 'author_id', 3600, 200);
  return new;
end $$;
drop trigger if exists rl_forum_posts on public.forum_posts;
create trigger rl_forum_posts
  before insert on public.forum_posts
  for each row execute function public.rl_forum_posts();

-- Community posts: 10 per minute, 60 per hour
create or replace function public.rl_community_posts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.community_posts'::regclass, 'author_id', 60, 10);
  perform public.assert_rate_limit('public.community_posts'::regclass, 'author_id', 3600, 60);
  return new;
end $$;
drop trigger if exists rl_community_posts on public.community_posts;
create trigger rl_community_posts
  before insert on public.community_posts
  for each row execute function public.rl_community_posts();

-- Community post comments: 30 per minute, 300 per hour
create or replace function public.rl_community_post_comments()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.community_post_comments'::regclass, 'author_id', 60, 30);
  perform public.assert_rate_limit('public.community_post_comments'::regclass, 'author_id', 3600, 300);
  return new;
end $$;
drop trigger if exists rl_community_post_comments on public.community_post_comments;
create trigger rl_community_post_comments
  before insert on public.community_post_comments
  for each row execute function public.rl_community_post_comments();

-- Direct messages: 30 per minute, 300 per hour
create or replace function public.rl_messages()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.messages'::regclass, 'sender_id', 60, 30);
  perform public.assert_rate_limit('public.messages'::regclass, 'sender_id', 3600, 300);
  return new;
end $$;
drop trigger if exists rl_messages on public.messages;
create trigger rl_messages
  before insert on public.messages
  for each row execute function public.rl_messages();

-- Marketplace listings: 5 per hour, 30 per day
create or replace function public.rl_marketplace_listings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.marketplace_listings'::regclass, 'seller_id', 3600, 5);
  perform public.assert_rate_limit('public.marketplace_listings'::regclass, 'seller_id', 86400, 30);
  return new;
end $$;
drop trigger if exists rl_marketplace_listings on public.marketplace_listings;
create trigger rl_marketplace_listings
  before insert on public.marketplace_listings
  for each row execute function public.rl_marketplace_listings();

-- Communities: 1 per minute, 5 per hour, 20 per day
create or replace function public.rl_communities()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.communities'::regclass, 'created_by', 60, 1);
  perform public.assert_rate_limit('public.communities'::regclass, 'created_by', 3600, 5);
  perform public.assert_rate_limit('public.communities'::regclass, 'created_by', 86400, 20);
  return new;
end $$;
drop trigger if exists rl_communities on public.communities;
create trigger rl_communities
  before insert on public.communities
  for each row execute function public.rl_communities();

-- Community post likes: 60 per minute (clicking like/unlike rapidly
-- shouldn't be possible). The unique key already prevents dupes.
create or replace function public.rl_community_post_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_rate_limit('public.community_post_likes'::regclass, 'profile_id', 60, 60);
  return new;
end $$;
drop trigger if exists rl_community_post_likes on public.community_post_likes;
create trigger rl_community_post_likes
  before insert on public.community_post_likes
  for each row execute function public.rl_community_post_likes();

-- ── 3) URL safety triggers ─────────────────────────────

-- Reject any value that looks like a script-bearing URL. Used as
-- a building block by the table-specific triggers below.
create or replace function public.assert_safe_url(u text, field_name text)
returns void
language plpgsql immutable as $$
declare lower_u text;
begin
  if u is null then return; end if;
  lower_u := lower(trim(u));
  if lower_u ~ '^(javascript|data|vbscript|file|ftp):' then
    raise exception 'unsafe_url: % cannot use this protocol', field_name
      using errcode = 'P0001';
  end if;
end $$;

create or replace function public.guard_community_urls()
returns trigger language plpgsql as $$
begin
  perform public.assert_safe_url(new.icon_url,   'icon_url');
  perform public.assert_safe_url(new.banner_url, 'banner_url');
  return new;
end $$;
drop trigger if exists communities_url_guard on public.communities;
create trigger communities_url_guard
  before insert or update on public.communities
  for each row execute function public.guard_community_urls();

create or replace function public.guard_community_post_urls()
returns trigger language plpgsql as $$
begin
  perform public.assert_safe_url(new.image_url, 'image_url');
  return new;
end $$;
drop trigger if exists community_posts_url_guard on public.community_posts;
create trigger community_posts_url_guard
  before insert or update on public.community_posts
  for each row execute function public.guard_community_post_urls();

create or replace function public.guard_profile_urls()
returns trigger language plpgsql as $$
begin
  perform public.assert_safe_url(new.website,            'website');
  perform public.assert_safe_url(new.avatar_url,         'avatar_url');
  perform public.assert_safe_url(new.business_website,   'business_website');
  return new;
end $$;
drop trigger if exists profiles_url_guard on public.profiles;
create trigger profiles_url_guard
  before insert or update on public.profiles
  for each row execute function public.guard_profile_urls();

create or replace function public.guard_news_url()
returns trigger language plpgsql as $$
begin
  perform public.assert_safe_url(new.cover_image_url, 'cover_image_url');
  perform public.assert_safe_url(new.source_url,      'source_url');
  return new;
end $$;
drop trigger if exists news_articles_url_guard on public.news_articles;
create trigger news_articles_url_guard
  before insert or update on public.news_articles
  for each row execute function public.guard_news_url();

create or replace function public.guard_jobs_urls()
returns trigger language plpgsql as $$
begin
  perform public.assert_safe_url(new.apply_url, 'apply_url');
  return new;
end $$;
drop trigger if exists jobs_url_guard on public.jobs;
create trigger jobs_url_guard
  before insert or update on public.jobs
  for each row execute function public.guard_jobs_urls();

-- ============================================================
-- migration-news-view-counter.sql
--
-- 1. Adds a view_count column to news_articles (int, default 0).
-- 2. Adds a SECURITY DEFINER RPC that bumps view_count for a given
--    slug. Required so the sidebar's Trending This Week ranking
--    (views weighted by recency) has real view data to work with.
--    Without this the counter stays at 0 and trending degrades
--    to a pure recency list.
--
-- The function is open to the `anon` role too — anonymous readers
-- count for trending, same as on any news site. Only view_count is
-- touched; nothing else on the row can be modified through this
-- path.
--
-- Safe to re-run.
-- ============================================================

-- 1) Column (idempotent)
alter table public.news_articles
  add column if not exists view_count integer not null default 0;

-- 2) SECURITY DEFINER bumping function
create or replace function public.increment_news_view(article_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.news_articles
     set view_count = coalesce(view_count, 0) + 1
   where slug = article_slug and is_published = true;
$$;

revoke all on function public.increment_news_view(text) from public;
grant execute on function public.increment_news_view(text) to anon, authenticated;

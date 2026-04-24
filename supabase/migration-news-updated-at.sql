-- ============================================================
-- migration-news-updated-at.sql
--
-- Adds an updated_at column + trigger to public.news_articles so
-- the admin panel can show a "last modified" timestamp alongside
-- "created at". The trigger reuses the shared touch_updated_at()
-- function already defined in schema.sql.
--
-- Safe to re-run.
-- ============================================================

alter table public.news_articles
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists news_articles_touch on public.news_articles;
create trigger news_articles_touch
  before update on public.news_articles
  for each row execute function public.touch_updated_at();

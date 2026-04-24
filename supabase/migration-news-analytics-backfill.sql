-- ============================================================
-- migration-news-analytics-backfill.sql
--
-- The events table (news_article_views) was added *after* views had
-- already been racking up in news_articles.view_count. That means the
-- Reports dashboard's line chart reads from an empty events table and
-- shows zero even though articles have real lifetime views.
--
-- This migration seeds one event row per existing lifetime view,
-- timestamping each event with a pseudo-random moment between the
-- article's published_at (or created_at) and now — so the events
-- table is back-consistent with view_count and the line chart has
-- history to render.
--
-- Idempotent guard: only backfills articles whose current event count
-- is less than their view_count. Re-running doesn't double-insert.
-- ============================================================

do $$
declare
  a         record;
  missing   integer;
  span_sec  double precision;
  start_ts  timestamptz;
  i         integer;
begin
  for a in
    select id, view_count, coalesce(published_at, created_at) as start_at
      from public.news_articles
     where coalesce(view_count, 0) > 0
  loop
    select greatest(0, a.view_count - count(*))
      into missing
      from public.news_article_views
     where article_id = a.id;

    if missing > 0 then
      start_ts := coalesce(a.start_at, now() - interval '7 days');
      span_sec := greatest(
        60,
        extract(epoch from (now() - start_ts))
      );
      for i in 1..missing loop
        insert into public.news_article_views (article_id, viewed_at)
        values (
          a.id,
          start_ts + ((random() * span_sec) || ' seconds')::interval
        );
      end loop;
    end if;
  end loop;
end $$;

-- Sanity query (run by hand if you want to verify):
--   select a.slug, a.view_count,
--          (select count(*) from public.news_article_views v
--            where v.article_id = a.id) as events
--     from public.news_articles a
--    where a.view_count > 0
--    order by a.view_count desc;
-- view_count and events should match on every row.

-- ============================================================
-- migration-news-analytics.sql
--
-- Per-view event log + analytics RPC for the admin reports page.
--
-- Previously increment_news_view only bumped a running total on the
-- news_articles row, which is fine for ranking but useless for
-- time-series (views per day, this-week vs last-week, etc.). We now
-- also insert a row into news_article_views for every bump, so we
-- can slice views by date / category / article.
--
-- Safe to re-run.
-- ============================================================

-- ─── 1) Events table ────────────────────────────────────────
create table if not exists public.news_article_views (
  id           bigserial primary key,
  article_id   uuid not null references public.news_articles(id) on delete cascade,
  viewed_at    timestamptz not null default now()
);

create index if not exists news_article_views_viewed_idx
  on public.news_article_views(viewed_at desc);
create index if not exists news_article_views_article_idx
  on public.news_article_views(article_id, viewed_at desc);

-- Lock the table down — only the SECURITY DEFINER functions write to
-- it; only admins read from it directly.
alter table public.news_article_views enable row level security;

drop policy if exists news_views_admin_select on public.news_article_views;
create policy news_views_admin_select on public.news_article_views
  for select using (public.is_admin());

-- No insert/update/delete policies for anon or authenticated — writes
-- happen only through the SECURITY DEFINER RPC below which bypasses RLS.

-- ─── 2) Updated increment function: bumps counter + logs event ──
create or replace function public.increment_news_view(article_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.news_articles
     set view_count = coalesce(view_count, 0) + 1
   where slug = article_slug and is_published = true
   returning id into v_id;

  if v_id is not null then
    insert into public.news_article_views (article_id) values (v_id);
  end if;
end;
$$;

revoke all on function public.increment_news_view(text) from public;
grant execute on function public.increment_news_view(text) to anon, authenticated;

-- ─── 3) Analytics RPC: daily view counts over a window ──────
-- Returns one row per day in the window (including days with zero
-- views) so the line chart doesn't have gaps.
create or replace function public.news_views_by_day(days integer default 30)
returns table (day date, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  with span as (
    select generate_series(
      (current_date - (days - 1) * interval '1 day')::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select s.day,
         coalesce(count(v.id), 0)::bigint as views
    from span s
    left join public.news_article_views v
      on date_trunc('day', v.viewed_at at time zone 'UTC')::date = s.day
   where public.is_admin()
   group by s.day
   order by s.day asc;
$$;

revoke all on function public.news_views_by_day(integer) from public;
grant execute on function public.news_views_by_day(integer) to authenticated;

-- ─── 4) Views by category (lifetime view_count grouped) ─────
create or replace function public.news_views_by_category()
returns table (category text, articles bigint, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(category, 'Uncategorized') as category,
         count(*)::bigint                    as articles,
         coalesce(sum(view_count), 0)::bigint as views
    from public.news_articles
   where is_published = true
     and public.is_admin()
   group by coalesce(category, 'Uncategorized')
   order by views desc, articles desc;
$$;

revoke all on function public.news_views_by_category() from public;
grant execute on function public.news_views_by_category() to authenticated;

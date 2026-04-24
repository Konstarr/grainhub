-- ============================================================
-- migration-owner-dashboard.sql
--
-- Owner-only analytics RPCs that power /admin/dashboard.
--
-- Every function is SECURITY DEFINER and gated by is_owner() so
-- even admins and moderators cannot read the aggregate financials.
-- That matches the product decision that the owner dashboard is a
-- business-admin view, not a content-admin view.
--
-- All RPCs return raw counts; the frontend multiplies by the prices
-- in lib/pricing.js so pricing.js remains the single source of
-- truth for every dollar figure on the site.
--
-- Safe to re-run.
-- ============================================================

-- ── 1) Signups per day over a configurable window ─────────
create or replace function public.owner_user_signups_by_day(days integer default 30)
returns table (day date, signups bigint)
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
         coalesce(count(p.id), 0)::bigint as signups
    from span s
    left join public.profiles p
      on date_trunc('day', coalesce(p.created_at, p.joined_at) at time zone 'UTC')::date = s.day
   where public.is_owner()
   group by s.day
   order by s.day asc;
$$;
revoke all on function public.owner_user_signups_by_day(integer) from public;
grant execute on function public.owner_user_signups_by_day(integer) to authenticated;

-- ── 2) Users by membership tier (split by account_type) ───
create or replace function public.owner_users_by_tier()
returns table (account_type text, membership_tier text, users bigint)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(account_type, 'individual') as account_type,
         coalesce(membership_tier, 'free')    as membership_tier,
         count(*)::bigint                     as users
    from public.profiles
   where public.is_owner()
   group by 1, 2
   order by 1, 2;
$$;
revoke all on function public.owner_users_by_tier() from public;
grant execute on function public.owner_users_by_tier() to authenticated;

-- ── 3) Role-pack breakdown ────────────────────────────────
create or replace function public.owner_packs_breakdown()
returns table (pack_slug text, tier_slug text, users bigint)
language sql
stable
security definer
set search_path = public
as $$
  select pack_slug, tier_slug, count(*)::bigint as users
    from public.subscription_packs
   where public.is_owner()
   group by 1, 2
   order by 1, 2;
$$;
revoke all on function public.owner_packs_breakdown() from public;
grant execute on function public.owner_packs_breakdown() to authenticated;

-- ── 4) Sponsor breakdown ──────────────────────────────────
create or replace function public.owner_sponsor_breakdown()
returns table (sponsor_tier text, users bigint)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sponsor_tier, 'none') as sponsor_tier,
         count(*)::bigint               as users
    from public.profiles
   where sponsor_tier is not null
     and public.is_owner()
   group by 1
   order by 1;
$$;
revoke all on function public.owner_sponsor_breakdown() from public;
grant execute on function public.owner_sponsor_breakdown() to authenticated;

-- ── 5) Content counts — articles/threads/posts/listings/jobs ──
-- Single call returns a row with all counts so the dashboard loads
-- everything in one round-trip.
create or replace function public.owner_content_counts()
returns table (
  users_total           bigint,
  users_individual      bigint,
  users_business        bigint,
  articles_total        bigint,
  articles_published    bigint,
  threads_total         bigint,
  posts_total           bigint,
  listings_total        bigint,
  listings_active       bigint,
  jobs_total            bigint,
  jobs_active           bigint,
  events_total          bigint,
  suppliers_total       bigint,
  messages_total        bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles)                              as users_total,
    (select count(*) from public.profiles where coalesce(account_type,'individual')='individual') as users_individual,
    (select count(*) from public.profiles where account_type='business') as users_business,
    (select count(*) from public.news_articles)                         as articles_total,
    (select count(*) from public.news_articles where is_published)      as articles_published,
    (select count(*) from public.forum_threads)                         as threads_total,
    (select count(*) from public.forum_posts)                           as posts_total,
    (select count(*) from public.marketplace_listings)                  as listings_total,
    (select count(*) from public.marketplace_listings where is_sold=false) as listings_active,
    (select count(*) from public.jobs)                                  as jobs_total,
    (select count(*) from public.jobs
       where is_approved = true
         and is_filled = false
         and (expires_at is null or expires_at > now()))                 as jobs_active,
    (select count(*) from public.events)                                as events_total,
    (select count(*) from public.suppliers)                             as suppliers_total,
    (select count(*) from public.messages)                              as messages_total
  where public.is_owner();
$$;
revoke all on function public.owner_content_counts() from public;
grant execute on function public.owner_content_counts() to authenticated;

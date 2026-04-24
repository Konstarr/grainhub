-- ============================================================
-- migration-membership-tiers.sql
--
-- Introduces the unified membership model:
--
--   Axis 1) Membership tier — free / basic / pro / enterprise
--           Stored on profiles.membership_tier. Applies to both
--           individual and business accounts; the tier's meaning
--           is interpreted against account_type by the frontend.
--
--   Axis 2) Role packs — recruiter / vendor / supplier
--           Stored in subscription_packs (profile_id, pack_slug,
--           tier_slug). Each active pack gets one row. A profile
--           can hold at most one row per (profile, pack_slug).
--
--   Axis 3) Sponsorship — existing profiles.sponsor_tier column.
--           Unchanged.
--
-- Stripe bookkeeping columns added for future billing.
--
-- RLS:
--   - Profile owner can read their own packs.
--   - Admins can read and write all packs (via is_admin()).
--   - Nobody else can write — UI writes go through admin, and
--     eventually through a Stripe webhook running as service role
--     (service role bypasses RLS so no explicit policy needed).
--
-- Safe to re-run.
-- ============================================================

-- ── 1) membership_tier + stripe columns on profiles ──
alter table public.profiles
  add column if not exists membership_tier  text not null default 'free',
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text;

-- Valid values for membership_tier. 'enterprise' is only meaningful
-- for business accounts but we don't enforce that in the CHECK so
-- admins can comp an individual to 'enterprise' for dev/testing.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'profiles_membership_tier_check'
  ) then
    alter table public.profiles drop constraint profiles_membership_tier_check;
  end if;
end $$;

alter table public.profiles
  add constraint profiles_membership_tier_check
  check (membership_tier in ('free','basic','pro','enterprise'));

-- Extend the safe column grant to include the new columns so the
-- frontend can read them through the public projection.
grant select (membership_tier) on public.profiles to anon, authenticated;

-- ── 2) subscription_packs table ──
create table if not exists public.subscription_packs (
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  pack_slug    text not null check (pack_slug in ('recruiter','vendor','supplier')),
  tier_slug    text not null check (tier_slug in ('starter','growth','scale','enterprise')),
  started_at   timestamptz not null default now(),
  current_period_end timestamptz,
  stripe_subscription_item_id text,
  primary key (profile_id, pack_slug)
);

create index if not exists subscription_packs_profile_idx
  on public.subscription_packs(profile_id);

alter table public.subscription_packs enable row level security;

drop policy if exists sub_packs_select_self on public.subscription_packs;
create policy sub_packs_select_self on public.subscription_packs
  for select using (auth.uid() = profile_id or public.is_admin());

drop policy if exists sub_packs_admin_write on public.subscription_packs;
create policy sub_packs_admin_write on public.subscription_packs
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 3) Helper view for convenient joining from code ──
-- A flat view that returns a profile with its pack set collapsed
-- into JSONB. Read-only. Frontend uses this to load "everything
-- about my plan" in one query.
create or replace view public.profile_plan as
select
  p.id,
  p.username,
  p.account_type,
  p.membership_tier,
  p.sponsor_tier,
  coalesce(
    (select jsonb_object_agg(pack_slug, tier_slug)
       from public.subscription_packs s
      where s.profile_id = p.id),
    '{}'::jsonb
  ) as packs
from public.profiles p;

grant select on public.profile_plan to anon, authenticated;

-- ============================================================
-- Verify:
--   select membership_tier from profiles where id = auth.uid();
--   select * from subscription_packs where profile_id = auth.uid();
--   select packs from profile_plan where id = auth.uid();
-- ============================================================

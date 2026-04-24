-- ============================================================
-- migration-profile-access-reset.sql
--
-- Recovers two things that got out of sync:
--
-- 1) The safe-column SELECT grants on public.profiles that the
--    frontend AuthContext fallback relies on. If a prior run of
--    migration-hardening.sql errored partway through (for example
--    because a column in the grant list didn't exist yet) we can
--    end up with SELECT revoked but no column grants — which shows
--    up as "permission denied for table profiles" in the client.
--
-- 2) The get_my_profile() SECURITY DEFINER RPC that returns the
--    caller's own full profile row (private columns included).
--    AuthContext tries this first before the safe-projection
--    fallback.
--
-- All idempotent. Safe to re-run any time.
-- ============================================================

-- 1) Profile column grants
revoke select on public.profiles from anon;
revoke select on public.profiles from authenticated;

grant select (
  id, username, full_name, bio, avatar_url, trade, location, website,
  role, reputation, thread_count, post_count, joined_at, created_at, updated_at,
  is_verified, is_suspended,
  account_type, business_name, business_website, business_verified,
  sponsor_tier, sponsor_company,
  profile_public, show_on_leaderboard, email_visible
) on public.profiles to anon, authenticated;

grant update on public.profiles to authenticated;

-- 2) get_my_profile() SECURITY DEFINER
create or replace function public.get_my_profile()
returns setof public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;

-- ============================================================
-- Verify:
--   select has_table_privilege('authenticated','public.profiles','SELECT');  -- f (table-level)
--   select has_column_privilege('authenticated','public.profiles','id','SELECT'); -- t (column-level)
--   select get_my_profile();  -- should return your own row when run from the app
-- ============================================================

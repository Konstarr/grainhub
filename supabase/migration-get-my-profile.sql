-- ============================================================
-- migration-get-my-profile.sql
--
-- The hardening migration revoked column-level SELECT on
-- public.profiles so private fields (preferences, business_*,
-- permission flags) wouldn't leak through the public profiles_select
-- RLS policy. The side-effect: a logged-in user can no longer SELECT
-- their own full profile directly from the client — the query fails
-- silently, AuthContext gets null, role defaults to 'member', and
-- staff-gated UI (Admin panel link, etc.) disappears.
--
-- Fix: expose get_my_profile() — a SECURITY DEFINER function that
-- returns the caller's own full profile row and nothing else.
-- ============================================================

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

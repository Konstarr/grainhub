-- ============================================================
-- migration-admin-profile-update.sql
--
-- Fixes "permission denied for table profiles" when an admin tries
-- to edit another user's profile (avatar, name, role, etc.).
--
-- Root cause: column-level GRANT setup on public.profiles +
-- table-level revokes leave a state where direct UPDATE through
-- PostgREST hits the GRANT layer before RLS even runs. We route
-- admin edits through a SECURITY DEFINER RPC that bypasses GRANT
-- checks (it runs as the function owner) and re-validates that the
-- caller is an admin/owner before writing.
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- Make sure UPDATE grant exists at the table level for the
-- profiles_update_self / profiles_admin_update RLS policies to work
-- via direct UPDATE (covers user-self-edit AND admin direct edit).
grant select, update on public.profiles to authenticated;

create or replace function public.admin_update_profile(
  target_id uuid,
  patch     jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  result_row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'sign_in_required' using errcode = 'P0001';
  end if;

  select role into caller_role
    from public.profiles
   where id = auth.uid();

  if caller_role is null or caller_role not in ('admin', 'owner') then
    raise exception 'admin_only: only admins/owners can edit other profiles'
      using errcode = 'P0001';
  end if;

  -- jsonb_populate_record applies only the keys present in `patch` to a
  -- copy of the existing row. Updates atomic; absent keys keep their
  -- current values. This avoids the column-by-column COALESCE list.
  update public.profiles p
     set (
       username, full_name, bio, avatar_url, trade, location, website,
       role,
       is_verified, is_suspended,
       account_type, business_name, business_website, business_verified,
       sponsor_tier, sponsor_company,
       membership_tier,
       profile_public, show_on_leaderboard, email_visible,
       can_post_forums, can_post_marketplace, can_post_jobs, can_submit_events,
       updated_at
     ) = (
       coalesce(patch->>'username',          p.username),
       coalesce(patch->>'full_name',         p.full_name),
       coalesce(patch->>'bio',               p.bio),
       coalesce(patch->>'avatar_url',        p.avatar_url),
       coalesce(patch->>'trade',             p.trade),
       coalesce(patch->>'location',          p.location),
       coalesce(patch->>'website',           p.website),
       coalesce(patch->>'role',              p.role),
       coalesce((patch->>'is_verified')::boolean,  p.is_verified),
       coalesce((patch->>'is_suspended')::boolean, p.is_suspended),
       coalesce(patch->>'account_type',      p.account_type),
       coalesce(patch->>'business_name',     p.business_name),
       coalesce(patch->>'business_website',  p.business_website),
       coalesce((patch->>'business_verified')::boolean, p.business_verified),
       case when patch ? 'sponsor_tier'
            then nullif(patch->>'sponsor_tier', '')
            else p.sponsor_tier end,
       coalesce(patch->>'sponsor_company',   p.sponsor_company),
       coalesce(patch->>'membership_tier',   p.membership_tier),
       coalesce((patch->>'profile_public')::boolean,        p.profile_public),
       coalesce((patch->>'show_on_leaderboard')::boolean,   p.show_on_leaderboard),
       coalesce((patch->>'email_visible')::boolean,         p.email_visible),
       coalesce((patch->>'can_post_forums')::boolean,       p.can_post_forums),
       coalesce((patch->>'can_post_marketplace')::boolean,  p.can_post_marketplace),
       coalesce((patch->>'can_post_jobs')::boolean,         p.can_post_jobs),
       coalesce((patch->>'can_submit_events')::boolean,     p.can_submit_events),
       now()
     )
   where p.id = target_id
   returning p.* into result_row;

  return result_row;
end $$;

revoke all on function public.admin_update_profile(uuid, jsonb) from public;
grant execute on function public.admin_update_profile(uuid, jsonb) to authenticated;

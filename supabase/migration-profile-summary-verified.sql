-- ============================================================
-- migration-profile-summary-verified.sql
-- Adds is_verified to the profile_summary view so the Profile
-- page (which reads from the view first) can render the
-- verified badge.
-- Idempotent.
-- ============================================================

-- Append is_verified at the end. create-or-replace forbids reordering
-- existing columns, so the new column has to come after badge_count.
create or replace view public.profile_summary as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.trade,
  p.location,
  p.role,
  p.reputation,
  p.post_count,
  p.thread_count,
  p.joined_at,
  (select count(*) from public.profile_badges pb where pb.profile_id = p.id) as badge_count,
  p.is_verified
from public.profiles p;

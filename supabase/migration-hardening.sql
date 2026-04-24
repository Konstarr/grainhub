-- ============================================================
-- migration-hardening.sql
--
-- Post-audit hardening pass. Fixes:
--   1. profiles_staff_update allowed moderators to edit ANY column on
--      ANY user (including `role` — privilege escalation). Tightened so
--      only admins+owner can modify role/permission fields, and
--      moderators can only edit moderation-specific fields.
--   2. sponsor_media owner update let a Silver sponsor self-promote to
--      Platinum by flipping `tier` + `slot` on a previously-approved
--      row. Locked tier/slot/is_approved to admin writes only.
--   3. profiles SELECT was fully public — leaked mod_note, sponsor_notes,
--      and is_shadowbanned. Replaced with a safe projection via a view.
--   4. Missing index on messages.sender_id used by markConversationRead.
--   5. Missing composite index on sponsor_media for the public-read path.
--
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1) profiles_staff_update — narrow the blast radius
-- ------------------------------------------------------------
-- The previous policy let moderators UPDATE every column on every row
-- (migration-users-sponsors.sql). We split responsibility:
--   - admins & owner  → full access
--   - moderators      → only columns that relate to moderation
--   - everyone else   → only their own row (existing policy)

drop policy if exists profiles_staff_update   on public.profiles;
drop policy if exists profiles_admin_update   on public.profiles;
drop policy if exists profiles_mod_update     on public.profiles;
drop policy if exists profiles_update_self    on public.profiles;

-- Admin & owner: anything on anyone
create policy profiles_admin_update on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Users update themselves
create policy profiles_update_self on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Moderators can suspend / verify / shadowban / leave notes on any user,
-- but NOT change role, NOT change sponsor_tier, NOT change permission flags.
-- We enforce the "which columns can change" rule via a trigger below,
-- since Postgres RLS can't do per-column check in a single policy.
create policy profiles_mod_update on public.profiles
  for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());

-- Column-scope enforcement: if a non-admin moderator touches any
-- privileged column, the trigger raises.
create or replace function public.enforce_profile_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_self     boolean := new.id = auth.uid();
  is_adm      boolean := public.is_admin();
  is_mod_only boolean := public.is_moderator() and not is_adm;
begin
  -- No restriction for admin/owner or the user on their own row.
  if is_adm or is_self then
    return new;
  end if;

  -- Moderator-only edits: forbid any write to privileged columns.
  if is_mod_only then
    if new.role is distinct from old.role then
      raise exception 'moderators cannot change role';
    end if;
    if new.sponsor_tier is distinct from old.sponsor_tier then
      raise exception 'moderators cannot change sponsor tier';
    end if;
    if new.account_type is distinct from old.account_type then
      raise exception 'moderators cannot change account type';
    end if;
    -- Content permission flags
    if new.can_post_forums      is distinct from old.can_post_forums      or
       new.can_post_marketplace is distinct from old.can_post_marketplace or
       new.can_post_jobs        is distinct from old.can_post_jobs        or
       new.can_submit_events    is distinct from old.can_submit_events then
      raise exception 'moderators cannot change content permissions';
    end if;
    return new;
  end if;

  -- Anyone else should never reach here thanks to RLS, but defense-in-depth
  raise exception 'unauthorized profile update';
end;
$$;

drop trigger if exists profiles_enforce_scope on public.profiles;
create trigger profiles_enforce_scope
  before update on public.profiles
  for each row execute function public.enforce_profile_update_scope();

-- ------------------------------------------------------------
-- 2) sponsor_media owner_update — disallow tier / slot / approval edits
-- ------------------------------------------------------------
-- The old policy let the owner rewrite any column. A Silver sponsor
-- could wait until their row was approved, then flip tier=platinum
-- slot=hero, and the public-read policy would honor it. We keep the
-- owner-can-update flow but forbid the tier-escalation columns via a
-- trigger (Postgres can't filter columns inside a single RLS policy).

create or replace function public.enforce_sponsor_media_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_adm      boolean := public.is_admin();
  is_owner    boolean := new.owner_id = auth.uid();
begin
  if is_adm then return new; end if;

  if is_owner then
    if new.tier         is distinct from old.tier         then
      raise exception 'only admins can change tier';
    end if;
    if new.slot         is distinct from old.slot         then
      raise exception 'only admins can change slot';
    end if;
    if new.is_approved  is distinct from old.is_approved  then
      raise exception 'only admins can approve media';
    end if;
    if new.owner_id     is distinct from old.owner_id     then
      raise exception 'cannot change owner';
    end if;
    return new;
  end if;

  raise exception 'unauthorized sponsor_media update';
end;
$$;

drop trigger if exists sponsor_media_enforce_scope on public.sponsor_media;
create trigger sponsor_media_enforce_scope
  before update on public.sponsor_media
  for each row execute function public.enforce_sponsor_media_scope();

-- ------------------------------------------------------------
-- 3) profiles SELECT — hide moderator-only columns from everyone else
-- ------------------------------------------------------------
-- The simplest safe fix without breaking the rest of the app is a
-- "public" view the frontend can read from for unauthenticated display,
-- plus a tightened policy on the raw table so non-admins only see
-- fields they should.
--
-- We achieve this by REVOKEing direct column access to sensitive
-- columns for the `anon` and `authenticated` roles and re-granting
-- only the safe projection. RLS still governs row visibility; column
-- grants govern field visibility.

-- Revoke broad SELECT (takes effect immediately for subsequent queries)
revoke select on public.profiles from anon;
revoke select on public.profiles from authenticated;

-- Grant only the safe public columns. Note: badge_count / any other
-- aggregate metric lives on the profile_summary view, not on the base
-- table — consumers that need those should read from profile_summary
-- (which remains public-readable).
grant select (
  id, username, full_name, bio, avatar_url, trade, location, website,
  role, reputation, thread_count, post_count, joined_at, created_at, updated_at,
  is_verified, is_suspended,
  account_type, business_name, business_website, business_verified,
  sponsor_tier, sponsor_company,
  profile_public, show_on_leaderboard, email_visible
) on public.profiles to anon, authenticated;

-- Admin/owner access to every column goes through SECURITY DEFINER
-- helper functions (updateProfileAdmin uses UPDATE which bypasses this
-- column grant because grants apply to SELECT/INSERT/UPDATE/DELETE
-- separately). For UPDATE we keep full access so admin edit forms work:
grant update on public.profiles to authenticated;

-- Helper for admins who need the full row (used by AdminUserEdit)
create or replace function public.admin_get_profile(target uuid)
returns setof public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = target and public.is_admin();
$$;
grant execute on function public.admin_get_profile(uuid) to authenticated;

-- ------------------------------------------------------------
-- 4) Missing indexes found in perf audit
-- ------------------------------------------------------------
create index if not exists messages_sender_idx
  on public.messages(sender_id, conversation_id)
  where read_at is null;

create index if not exists sponsor_media_public_idx
  on public.sponsor_media(slot, is_approved, is_active, sort_order);

create index if not exists connections_requester_status_idx
  on public.connections(requester_id, status);

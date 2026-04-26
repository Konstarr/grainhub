-- ============================================================
-- migration-admin-community-leadership.sql
--
-- Lets site admins / site owners (`is_admin()` returns true) manage
-- community leadership without first being a member of that community.
-- Current RPCs only allow the community's own `owner` role to call
-- them; this extends the gate so platform admins can also:
--
--   * transfer_community_ownership() to any member
--   * set_community_member_role()   to flip a member to mod / member
--
-- Also adds an `admin_set_community_owner()` helper that handles the
-- "make this profile the owner even if they're not yet a member" case
-- the admin UI needs (auto-inserts a membership row at owner level if
-- one doesn't exist, and demotes the prior owner to mod).
--
-- All idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Re-create the existing RPCs with an admin-bypass branch.
--    Drop first because Postgres treats argument-list as identity.
-- ------------------------------------------------------------

drop function if exists public.transfer_community_ownership(uuid, uuid);

create or replace function public.transfer_community_ownership(
  community_id_in uuid,
  new_owner_in    uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller        uuid := auth.uid();
  v_caller_is_adm boolean := false;
  v_caller_role   text;
  v_target_exists boolean;
  v_current_owner uuid;
begin
  if v_caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  -- Site admin / owner gets to do this for any community.
  begin
    v_caller_is_adm := public.is_admin();
  exception when others then
    v_caller_is_adm := false;
  end;

  if not v_caller_is_adm then
    -- Otherwise the caller must currently be the community's owner.
    select cm.role into v_caller_role
      from public.community_members cm
     where cm.community_id = community_id_in
       and cm.profile_id   = v_caller;
    if v_caller_role is null or v_caller_role <> 'owner' then
      raise exception 'forbidden_not_owner' using errcode = '42501';
    end if;
  end if;

  -- New owner must already be a member.
  select exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = new_owner_in
  ) into v_target_exists;

  if not v_target_exists then
    raise exception 'recipient_not_member' using errcode = '22000';
  end if;

  if new_owner_in = v_caller and not v_caller_is_adm then
    raise exception 'cannot_transfer_to_self' using errcode = '22000';
  end if;

  -- Find the current owner row (might not match the caller when
  -- a site admin is doing the transfer).
  select profile_id into v_current_owner
    from public.community_members
   where community_id = community_id_in
     and role = 'owner'
   limit 1;

  -- Demote the existing owner to 'mod' (if any).
  if v_current_owner is not null and v_current_owner <> new_owner_in then
    update public.community_members
       set role = 'mod'
     where community_id = community_id_in
       and profile_id   = v_current_owner;
  end if;

  -- Promote target.
  update public.community_members
     set role = 'owner'
   where community_id = community_id_in
     and profile_id   = new_owner_in;

  -- Mirror to the denormalized created_by column on the parent row
  -- so the UI's "Owner: ___" display follows the transfer.
  update public.communities
     set created_by = new_owner_in
   where id = community_id_in;
end;
$$;

grant execute on function public.transfer_community_ownership(uuid, uuid)
  to authenticated;


drop function if exists public.set_community_member_role(uuid, uuid, text);

create or replace function public.set_community_member_role(
  community_id_in uuid,
  member_in       uuid,
  new_role_in     text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller        uuid := auth.uid();
  v_caller_is_adm boolean := false;
  v_caller_role   text;
begin
  if v_caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  -- Only 'member' and 'mod' are settable through this RPC.
  -- Use transfer_community_ownership for 'owner'.
  if new_role_in not in ('member', 'mod') then
    raise exception 'invalid_role' using errcode = '22000';
  end if;

  -- Site admin bypass.
  begin
    v_caller_is_adm := public.is_admin();
  exception when others then
    v_caller_is_adm := false;
  end;

  if not v_caller_is_adm then
    select cm.role into v_caller_role
      from public.community_members cm
     where cm.community_id = community_id_in
       and cm.profile_id   = v_caller;
    if v_caller_role is null or v_caller_role <> 'owner' then
      raise exception 'forbidden_not_owner' using errcode = '42501';
    end if;
    -- Don't allow the owner to demote themselves accidentally.
    if member_in = v_caller then
      raise exception 'cannot_change_own_role' using errcode = '22000';
    end if;
  end if;

  -- The target must currently be a member of the community.
  if not exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = member_in
  ) then
    raise exception 'target_not_member' using errcode = '22000';
  end if;

  -- Don't let this RPC overwrite an owner row.
  if exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = member_in
       and role = 'owner'
  ) then
    raise exception 'cannot_change_owner_role' using errcode = '22000';
  end if;

  update public.community_members
     set role = new_role_in
   where community_id = community_id_in
     and profile_id   = member_in;
end;
$$;

grant execute on function public.set_community_member_role(uuid, uuid, text)
  to authenticated;


-- ------------------------------------------------------------
-- 2. Admin convenience: install a profile as community owner even
--    if they aren't currently a member.
-- ------------------------------------------------------------

create or replace function public.admin_set_community_owner(
  community_id_in uuid,
  new_owner_in    uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid           uuid := auth.uid();
  v_caller_is_adm boolean := false;
  v_current_owner uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  begin
    v_caller_is_adm := public.is_admin();
  exception when others then
    v_caller_is_adm := false;
  end;
  if not v_caller_is_adm then
    raise exception 'forbidden_not_admin' using errcode = '42501';
  end if;

  -- Add target as member if not already in the community
  insert into public.community_members (community_id, profile_id, role)
       values (community_id_in, new_owner_in, 'owner')
       on conflict (community_id, profile_id) do update
       set role = 'owner';

  -- Demote previous owner (if different) to mod
  select profile_id into v_current_owner
    from public.community_members
   where community_id = community_id_in
     and role = 'owner'
     and profile_id <> new_owner_in
   limit 1;
  if v_current_owner is not null then
    update public.community_members
       set role = 'mod'
     where community_id = community_id_in
       and profile_id   = v_current_owner;
  end if;

  -- Mirror to the denormalized created_by column on the parent row.
  update public.communities
     set created_by = new_owner_in
   where id = community_id_in;
end;
$$;

grant execute on function public.admin_set_community_owner(uuid, uuid)
  to authenticated;


create or replace function public.admin_remove_community_member(
  community_id_in uuid,
  member_in       uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid           uuid := auth.uid();
  v_caller_is_adm boolean := false;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  begin
    v_caller_is_adm := public.is_admin();
  exception when others then
    v_caller_is_adm := false;
  end;
  if not v_caller_is_adm then
    raise exception 'forbidden_not_admin' using errcode = '42501';
  end if;

  -- Don't let admins accidentally orphan a community of its owner;
  -- they should transfer ownership first.
  if exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = member_in
       and role = 'owner'
  ) then
    raise exception 'cannot_remove_owner_transfer_first' using errcode = '22000';
  end if;

  delete from public.community_members
   where community_id = community_id_in
     and profile_id   = member_in;
end;
$$;

grant execute on function public.admin_remove_community_member(uuid, uuid)
  to authenticated;

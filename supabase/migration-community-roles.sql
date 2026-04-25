-- ============================================================
-- migration-community-roles.sql
--
-- Helpers for ownership transfer + role changes on communities.
--
-- The existing RLS on community_members allows mods/owners to
-- update OTHER members' roles, but explicitly forbids updating
-- one's own row (prevents self-promotion). That blocks the
-- outgoing owner from demoting themselves during a transfer, so
-- we route ownership transfer through a SECURITY DEFINER RPC
-- that does both updates atomically.
-- ============================================================

create or replace function public.transfer_community_ownership(
  community_id_in uuid,
  new_owner_in    uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  caller_role text;
begin
  if uid is null then
    raise exception 'sign_in_required' using errcode = 'P0001';
  end if;
  if community_id_in is null or new_owner_in is null then
    raise exception 'missing_arguments' using errcode = 'P0001';
  end if;
  if uid = new_owner_in then
    raise exception 'cannot_transfer_to_self' using errcode = 'P0001';
  end if;

  -- Must be an owner of the community to transfer
  select role into caller_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = uid;

  if caller_role is null or caller_role <> 'owner' then
    raise exception 'not_owner: only an owner can transfer ownership'
      using errcode = 'P0001';
  end if;

  -- Recipient must already be a member
  if not exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = new_owner_in
  ) then
    raise exception 'new_owner_not_a_member' using errcode = 'P0001';
  end if;

  -- Atomic swap: promote new owner first, then demote old owner.
  update public.community_members
     set role = 'owner'
   where community_id = community_id_in
     and profile_id   = new_owner_in;

  update public.community_members
     set role = 'member'
   where community_id = community_id_in
     and profile_id   = uid;

  -- Mirror created_by so it shows the current owner. Permission
  -- decisions key off the role column anyway, but several UI
  -- surfaces read created_by for "owned by …" display.
  update public.communities
     set created_by = new_owner_in,
         updated_at = now()
   where id = community_id_in;
end $$;

revoke all on function public.transfer_community_ownership(uuid, uuid) from public;
grant execute on function public.transfer_community_ownership(uuid, uuid) to authenticated;

-- ── Promote / demote moderators ─────────────────────────────
-- Owners can flip a member between 'member' and 'mod'. Routed
-- through an RPC so the role validation is centralized.
create or replace function public.set_community_member_role(
  community_id_in uuid,
  member_in       uuid,
  new_role_in     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  caller_role text;
begin
  if uid is null then
    raise exception 'sign_in_required' using errcode = 'P0001';
  end if;
  if new_role_in not in ('member', 'mod') then
    raise exception 'invalid_role: only member or mod can be set this way'
      using errcode = 'P0001';
  end if;
  if uid = member_in then
    raise exception 'cannot_change_own_role' using errcode = 'P0001';
  end if;

  select role into caller_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = uid;

  if caller_role is null or caller_role <> 'owner' then
    raise exception 'not_owner: only an owner can change roles'
      using errcode = 'P0001';
  end if;

  update public.community_members
     set role = new_role_in
   where community_id = community_id_in
     and profile_id   = member_in
     and role <> 'owner';   -- never overwrite an owner row this way
end $$;

revoke all on function public.set_community_member_role(uuid, uuid, text) from public;
grant execute on function public.set_community_member_role(uuid, uuid, text) to authenticated;

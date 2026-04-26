-- ============================================================
-- migration-transfer-demotes-to-member.sql
--
-- Adjusts the ownership-transfer RPCs so the outgoing owner is
-- demoted to a regular 'member' instead of being promoted to
-- moderator. This matches the user expectation: "once ownership
-- is transferred I think the owner goes to a regular member".
--
-- If the owner wants to keep moderator powers, the new owner can
-- explicitly promote them via set_community_member_role.
--
-- Affects:
--   * public.transfer_community_ownership(uuid, uuid)
--   * public.admin_set_community_owner(uuid, uuid)
--
-- All idempotent.
-- ============================================================

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
  end if;

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

  select profile_id into v_current_owner
    from public.community_members
   where community_id = community_id_in
     and role = 'owner'
   limit 1;

  -- Demote the existing owner to a regular 'member' (changed from 'mod').
  if v_current_owner is not null and v_current_owner <> new_owner_in then
    update public.community_members
       set role = 'member'
     where community_id = community_id_in
       and profile_id   = v_current_owner;
  end if;

  -- Promote target to owner.
  update public.community_members
     set role = 'owner'
   where community_id = community_id_in
     and profile_id   = new_owner_in;

  -- Mirror to the denormalized created_by column on the parent row.
  update public.communities
     set created_by = new_owner_in
   where id = community_id_in;
end;
$$;

grant execute on function public.transfer_community_ownership(uuid, uuid)
  to authenticated;


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

  insert into public.community_members (community_id, profile_id, role)
       values (community_id_in, new_owner_in, 'owner')
       on conflict (community_id, profile_id) do update
       set role = 'owner';

  -- Demote previous owner (if different) to a regular 'member'.
  select profile_id into v_current_owner
    from public.community_members
   where community_id = community_id_in
     and role = 'owner'
     and profile_id <> new_owner_in
   limit 1;
  if v_current_owner is not null then
    update public.community_members
       set role = 'member'
     where community_id = community_id_in
       and profile_id   = v_current_owner;
  end if;

  update public.communities
     set created_by = new_owner_in
   where id = community_id_in;
end;
$$;

grant execute on function public.admin_set_community_owner(uuid, uuid)
  to authenticated;

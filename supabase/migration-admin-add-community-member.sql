-- ============================================================
-- migration-admin-add-community-member.sql
--
-- Adds the admin "Add a member" surface area: a SECURITY DEFINER
-- RPC that lets a site admin (is_admin() = true) drop any GrainHub
-- profile straight into a community at member-level, bypassing the
-- normal apply / invite handshake.
--
-- The matching admin "remove" RPC already exists from
-- migration-admin-community-leadership.sql.
-- ============================================================

create or replace function public.admin_add_community_member(
  community_id_in uuid,
  profile_in      uuid
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
  if community_id_in is null or profile_in is null then
    raise exception 'missing_arguments' using errcode = '22000';
  end if;

  begin
    v_caller_is_adm := public.is_admin();
  exception when others then
    v_caller_is_adm := false;
  end;
  if not v_caller_is_adm then
    raise exception 'forbidden_not_admin' using errcode = '42501';
  end if;

  -- If they are already a member at any role, we leave the role alone
  -- so this RPC is safely re-runnable. Use set_community_member_role
  -- or admin_set_community_owner to change an existing member's role.
  insert into public.community_members (community_id, profile_id, role)
       values (community_id_in, profile_in, 'member')
       on conflict (community_id, profile_id) do nothing;
end;
$$;

grant execute on function public.admin_add_community_member(uuid, uuid)
  to authenticated;

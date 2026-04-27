-- ============================================================
-- migration-ban-reason-required.sql
--
-- Tighten community_ban_member: a non-empty reason is now required
-- so the ban log always shows why the action was taken.
-- ============================================================

create or replace function public.community_ban_member(
  community_id_in uuid,
  profile_in      uuid,
  reason_in       text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid         uuid := auth.uid();
  v_target_role text;
  v_reason      text;
begin
  if not public._community_can_moderate(community_id_in) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_reason := nullif(trim(coalesce(reason_in, '')), '');
  if v_reason is null then
    raise exception 'ban_reason_required' using errcode = '22000';
  end if;
  if length(v_reason) < 5 then
    raise exception 'ban_reason_too_short' using errcode = '22000';
  end if;
  if length(v_reason) > 500 then
    v_reason := substring(v_reason from 1 for 500);
  end if;

  select role into v_target_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  if v_target_role = 'owner' then
    raise exception 'cannot_ban_owner' using errcode = '22000';
  end if;

  delete from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  update public.community_join_requests
     set status = 'rejected', reviewed_at = now(), reviewed_by = v_uid
   where community_id = community_id_in
     and profile_id   = profile_in
     and status       = 'pending';

  update public.community_invitations
     set status = 'cancelled', responded_at = now()
   where community_id = community_id_in
     and invitee_id   = profile_in
     and status       = 'pending';

  insert into public.community_bans (community_id, profile_id, banned_by, reason)
       values (community_id_in, profile_in, v_uid, v_reason)
       on conflict (community_id, profile_id) do update
       set banned_by  = excluded.banned_by,
           reason     = excluded.reason,
           created_at = now();
end;
$$;

grant execute on function public.community_ban_member(uuid, uuid, text) to authenticated;

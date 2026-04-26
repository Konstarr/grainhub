-- ============================================================
-- migration-community-kick-ban.sql
--
-- Adds kick + ban support to communities.
--
-- Kick = remove from membership; the kicked profile can re-apply.
-- Ban  = remove + record in community_bans so future requests and
--        invitations refuse them until a mod/owner/admin unbans.
--
-- Authorization: mods, owners, and site admins (is_admin) can kick,
-- ban, and unban. Owners themselves cannot be kicked or banned —
-- the new owner has to be in place first.
--
-- Surface area:
--   * public.community_bans                          (table)
--   * public.community_kick_member(uuid, uuid)
--   * public.community_ban_member(uuid, uuid, text)
--   * public.community_unban_member(uuid, uuid)
--
-- Also extends:
--   * request_to_join_community  → refuses if banned
--   * invite_to_community        → refuses if banned
--
-- All idempotent.
-- ============================================================

create table if not exists public.community_bans (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id)    on delete cascade,
  banned_by     uuid references public.profiles(id),
  reason        text,
  created_at    timestamptz not null default now()
);

create unique index if not exists community_bans_unique
  on public.community_bans (community_id, profile_id);

create index if not exists community_bans_profile_idx
  on public.community_bans (profile_id);


alter table public.community_bans enable row level security;

drop policy if exists community_bans_select on public.community_bans;
create policy community_bans_select on public.community_bans
  for select using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = community_bans.community_id
         and cm.profile_id   = auth.uid()
         and cm.role in ('mod', 'owner')
    )
    or public.is_admin()
  );

-- All writes go through the SECURITY DEFINER RPCs below.


-- ------------------------------------------------------------
-- Helper: shared role check for kick/ban/unban authorization.
-- Returns true if the current auth.uid() is a mod or owner of the
-- given community OR a site admin.
-- ------------------------------------------------------------
create or replace function public._community_can_moderate(community_id_in uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_role   text;
  v_is_adm boolean := false;
begin
  if v_uid is null then return false; end if;
  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;
  if v_is_adm then return true; end if;
  select role into v_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = v_uid;
  return coalesce(v_role in ('mod', 'owner'), false);
end;
$$;

grant execute on function public._community_can_moderate(uuid) to authenticated;


-- ------------------------------------------------------------
-- Kick: remove a member from the community without recording a ban.
-- Owners cannot be kicked.
-- ------------------------------------------------------------
create or replace function public.community_kick_member(
  community_id_in uuid,
  profile_in      uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_target_role text;
begin
  if not public._community_can_moderate(community_id_in) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select role into v_target_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  if v_target_role is null then
    return;  -- not a member, no-op
  end if;
  if v_target_role = 'owner' then
    raise exception 'cannot_kick_owner' using errcode = '22000';
  end if;

  delete from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  -- Cancel any open join request from this profile so they don't
  -- end up with a stale pending row after being kicked.
  update public.community_join_requests
     set status = 'cancelled', reviewed_at = now()
   where community_id = community_id_in
     and profile_id   = profile_in
     and status       = 'pending';
end;
$$;

grant execute on function public.community_kick_member(uuid, uuid) to authenticated;


-- ------------------------------------------------------------
-- Ban: kick + record a ban so future apply/invite rejects them.
-- Owners cannot be banned.
-- ------------------------------------------------------------
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
begin
  if not public._community_can_moderate(community_id_in) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select role into v_target_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  if v_target_role = 'owner' then
    raise exception 'cannot_ban_owner' using errcode = '22000';
  end if;

  -- Remove their membership row (if any).
  delete from public.community_members
   where community_id = community_id_in
     and profile_id   = profile_in;

  -- Cancel any pending join request and pending invitation so they
  -- can't slip through after the ban lands.
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

  -- Record the ban (or update an existing one with a fresh reason).
  insert into public.community_bans (community_id, profile_id, banned_by, reason)
       values (community_id_in, profile_in, v_uid, nullif(trim(reason_in), ''))
       on conflict (community_id, profile_id) do update
       set banned_by  = excluded.banned_by,
           reason     = excluded.reason,
           created_at = now();
end;
$$;

grant execute on function public.community_ban_member(uuid, uuid, text) to authenticated;


-- ------------------------------------------------------------
-- Unban: lift the ban so they can apply again.
-- ------------------------------------------------------------
create or replace function public.community_unban_member(
  community_id_in uuid,
  profile_in      uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public._community_can_moderate(community_id_in) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from public.community_bans
   where community_id = community_id_in
     and profile_id   = profile_in;
end;
$$;

grant execute on function public.community_unban_member(uuid, uuid) to authenticated;


-- ------------------------------------------------------------
-- Replace request_to_join_community + invite_to_community to
-- short-circuit on a ban.
-- ------------------------------------------------------------
create or replace function public.request_to_join_community(
  community_id_in uuid,
  message_in      text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.community_bans
     where community_id = community_id_in and profile_id = v_uid
  ) then
    raise exception 'banned_from_community' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.community_members
     where community_id = community_id_in and profile_id = v_uid
  ) then
    raise exception 'already_member' using errcode = '22000';
  end if;

  if exists (
    select 1 from public.community_join_requests
     where community_id = community_id_in
       and profile_id   = v_uid
       and status       = 'pending'
  ) then
    raise exception 'request_already_pending' using errcode = '22000';
  end if;

  insert into public.community_join_requests (community_id, profile_id, message)
       values (community_id_in, v_uid, nullif(trim(message_in), ''))
       returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.request_to_join_community(uuid, text) to authenticated;


create or replace function public.invite_to_community(
  community_id_in uuid,
  invitee_in      uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid         uuid := auth.uid();
  v_caller_role text;
  v_id          uuid;
  v_is_adm      boolean := false;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if invitee_in is null then
    raise exception 'invitee_required' using errcode = '22000';
  end if;
  if invitee_in = v_uid then
    raise exception 'cannot_invite_self' using errcode = '22000';
  end if;

  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;

  if not v_is_adm then
    select role into v_caller_role
      from public.community_members
     where community_id = community_id_in
       and profile_id   = v_uid;
    if v_caller_role is null or v_caller_role not in ('mod', 'owner') then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  if exists (
    select 1 from public.community_bans
     where community_id = community_id_in and profile_id = invitee_in
  ) then
    raise exception 'invitee_banned' using errcode = '22000';
  end if;

  if exists (
    select 1 from public.community_members
     where community_id = community_id_in
       and profile_id   = invitee_in
  ) then
    raise exception 'already_member' using errcode = '22000';
  end if;

  if exists (
    select 1 from public.community_invitations
     where community_id = community_id_in
       and invitee_id   = invitee_in
       and status       = 'pending'
  ) then
    raise exception 'invitation_already_pending' using errcode = '22000';
  end if;

  update public.community_join_requests
     set status      = 'approved',
         reviewed_at = now(),
         reviewed_by = v_uid
   where community_id = community_id_in
     and profile_id   = invitee_in
     and status       = 'pending';

  insert into public.community_invitations (community_id, invitee_id, inviter_id)
       values (community_id_in, invitee_in, v_uid)
       returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.invite_to_community(uuid, uuid) to authenticated;

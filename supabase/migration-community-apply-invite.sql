-- ============================================================
-- migration-community-apply-invite.sql
--
-- Adds an apply / invite workflow to communities and locks
-- ownership transfer down so an owner can never accidentally
-- evict themselves from the community.
--
-- New surface area:
--   * public.community_join_requests          (table)
--   * public.community_invitations            (table)
--   * public.request_to_join_community(uuid, text)
--   * public.cancel_join_request(uuid)
--   * public.approve_join_request(uuid)
--   * public.reject_join_request(uuid)
--   * public.invite_to_community(uuid, uuid)
--   * public.accept_community_invitation(uuid)
--   * public.decline_community_invitation(uuid)
--   * public.cancel_community_invitation(uuid)
--   * public.leave_community(uuid)            (owner-blocked)
--
-- The community_members DELETE policy is also tightened so the
-- owner row can never be self-deleted from the table directly,
-- only via the admin RPCs (which require a successor).
--
-- All idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tables
-- ------------------------------------------------------------

create table if not exists public.community_join_requests (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id)    on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  message       text,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references public.profiles(id)
);

-- Only one pending row per (community, profile) pair.
create unique index if not exists community_join_requests_one_pending
  on public.community_join_requests (community_id, profile_id)
  where status = 'pending';

create index if not exists community_join_requests_community_status_idx
  on public.community_join_requests (community_id, status);

create index if not exists community_join_requests_profile_idx
  on public.community_join_requests (profile_id);


create table if not exists public.community_invitations (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  invitee_id    uuid not null references public.profiles(id)    on delete cascade,
  inviter_id    uuid not null references public.profiles(id)    on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz
);

create unique index if not exists community_invitations_one_pending
  on public.community_invitations (community_id, invitee_id)
  where status = 'pending';

create index if not exists community_invitations_invitee_idx
  on public.community_invitations (invitee_id, status);

create index if not exists community_invitations_community_idx
  on public.community_invitations (community_id, status);


-- ------------------------------------------------------------
-- 2. RLS
-- ------------------------------------------------------------
alter table public.community_join_requests enable row level security;
alter table public.community_invitations   enable row level security;

-- Requesters can read their own; mods+owners of the target community can read all
drop policy if exists community_join_requests_select on public.community_join_requests;
create policy community_join_requests_select on public.community_join_requests
  for select using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = community_join_requests.community_id
         and cm.profile_id   = auth.uid()
         and cm.role in ('mod', 'owner')
    )
    or public.is_admin()
  );

-- Invitees, inviters, mods+owners of the community, and admins can read invitations
drop policy if exists community_invitations_select on public.community_invitations;
create policy community_invitations_select on public.community_invitations
  for select using (
    invitee_id = auth.uid()
    or inviter_id = auth.uid()
    or exists (
      select 1 from public.community_members cm
       where cm.community_id = community_invitations.community_id
         and cm.profile_id   = auth.uid()
         and cm.role in ('mod', 'owner')
    )
    or public.is_admin()
  );

-- All mutations go through SECURITY DEFINER RPCs below — no direct insert/update/delete
-- policies are needed for the new tables.


-- ------------------------------------------------------------
-- 3. Tighten community_members DELETE so owners can never
--    self-evict directly from the table. Owners must transfer
--    ownership first; everyone else can still leave normally
--    via the leave_community RPC (which routes around RLS via
--    SECURITY DEFINER).
-- ------------------------------------------------------------
drop policy if exists community_members_leave on public.community_members;
create policy community_members_leave on public.community_members
  for delete using (
    public.is_admin()
    or (auth.uid() = profile_id and role <> 'owner')
  );


-- ------------------------------------------------------------
-- 4. Apply / cancel
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


create or replace function public.cancel_join_request(request_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  update public.community_join_requests
     set status = 'cancelled', reviewed_at = now()
   where id = request_id_in
     and profile_id = v_uid
     and status = 'pending';
end;
$$;

grant execute on function public.cancel_join_request(uuid) to authenticated;


-- ------------------------------------------------------------
-- 5. Approve / reject (mod + owner + site admin)
-- ------------------------------------------------------------
create or replace function public.approve_join_request(request_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid         uuid := auth.uid();
  v_caller_role text;
  v_req         public.community_join_requests%rowtype;
  v_is_adm      boolean := false;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select * into v_req from public.community_join_requests where id = request_id_in;
  if v_req.id is null then
    raise exception 'request_not_found' using errcode = '22000';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'request_not_pending' using errcode = '22000';
  end if;

  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;

  if not v_is_adm then
    select role into v_caller_role
      from public.community_members
     where community_id = v_req.community_id
       and profile_id   = v_uid;
    if v_caller_role is null or v_caller_role not in ('mod', 'owner') then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  insert into public.community_members (community_id, profile_id, role)
       values (v_req.community_id, v_req.profile_id, 'member')
       on conflict (community_id, profile_id) do nothing;

  update public.community_join_requests
     set status      = 'approved',
         reviewed_at = now(),
         reviewed_by = v_uid
   where id = request_id_in;
end;
$$;

grant execute on function public.approve_join_request(uuid) to authenticated;


create or replace function public.reject_join_request(request_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid         uuid := auth.uid();
  v_caller_role text;
  v_req         public.community_join_requests%rowtype;
  v_is_adm      boolean := false;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select * into v_req from public.community_join_requests where id = request_id_in;
  if v_req.id is null then
    raise exception 'request_not_found' using errcode = '22000';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'request_not_pending' using errcode = '22000';
  end if;

  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;

  if not v_is_adm then
    select role into v_caller_role
      from public.community_members
     where community_id = v_req.community_id
       and profile_id   = v_uid;
    if v_caller_role is null or v_caller_role not in ('mod', 'owner') then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  update public.community_join_requests
     set status      = 'rejected',
         reviewed_at = now(),
         reviewed_by = v_uid
   where id = request_id_in;
end;
$$;

grant execute on function public.reject_join_request(uuid) to authenticated;


-- ------------------------------------------------------------
-- 6. Invitations (mod + owner + site admin can invite)
-- ------------------------------------------------------------
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

  -- Auto-approve any pending request from the same person — sending an
  -- invite is functionally equivalent to approving them.
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


create or replace function public.accept_community_invitation(invitation_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.community_invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select * into v_inv from public.community_invitations where id = invitation_id_in;
  if v_inv.id is null then
    raise exception 'invitation_not_found' using errcode = '22000';
  end if;
  if v_inv.invitee_id <> v_uid then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'invitation_not_pending' using errcode = '22000';
  end if;

  insert into public.community_members (community_id, profile_id, role)
       values (v_inv.community_id, v_inv.invitee_id, 'member')
       on conflict (community_id, profile_id) do nothing;

  update public.community_invitations
     set status       = 'accepted',
         responded_at = now()
   where id = invitation_id_in;
end;
$$;

grant execute on function public.accept_community_invitation(uuid) to authenticated;


create or replace function public.decline_community_invitation(invitation_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.community_invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select * into v_inv from public.community_invitations where id = invitation_id_in;
  if v_inv.id is null then
    raise exception 'invitation_not_found' using errcode = '22000';
  end if;
  if v_inv.invitee_id <> v_uid then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'invitation_not_pending' using errcode = '22000';
  end if;
  update public.community_invitations
     set status = 'declined', responded_at = now()
   where id = invitation_id_in;
end;
$$;

grant execute on function public.decline_community_invitation(uuid) to authenticated;


create or replace function public.cancel_community_invitation(invitation_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid         uuid := auth.uid();
  v_caller_role text;
  v_inv         public.community_invitations%rowtype;
  v_is_adm      boolean := false;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select * into v_inv from public.community_invitations where id = invitation_id_in;
  if v_inv.id is null then
    raise exception 'invitation_not_found' using errcode = '22000';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'invitation_not_pending' using errcode = '22000';
  end if;

  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;
  if v_inv.inviter_id <> v_uid and not v_is_adm then
    select role into v_caller_role
      from public.community_members
     where community_id = v_inv.community_id
       and profile_id   = v_uid;
    if v_caller_role is null or v_caller_role not in ('mod', 'owner') then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  update public.community_invitations
     set status = 'cancelled', responded_at = now()
   where id = invitation_id_in;
end;
$$;

grant execute on function public.cancel_community_invitation(uuid) to authenticated;


-- ------------------------------------------------------------
-- 7. Owner-aware leave RPC. The community_members DELETE policy
--    already blocks owner self-removal at the table level; this
--    surface lets the client get a clean error message instead
--    of a silent no-op.
-- ------------------------------------------------------------
create or replace function public.leave_community(community_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select role into v_role
    from public.community_members
   where community_id = community_id_in
     and profile_id   = v_uid;

  if v_role is null then
    return;  -- not a member, nothing to do
  end if;

  if v_role = 'owner' then
    raise exception 'owner_must_transfer_first' using errcode = '22000';
  end if;

  delete from public.community_members
   where community_id = community_id_in
     and profile_id   = v_uid;
end;
$$;

grant execute on function public.leave_community(uuid) to authenticated;

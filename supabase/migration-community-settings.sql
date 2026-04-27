-- ============================================================
-- migration-community-settings.sql
--
-- Lets mods, owners, and site admins edit a community's editable
-- fields (name, description, icon, banner, public/private flag)
-- without exposing the bare communities UPDATE policy.
--
-- Routes through a SECURITY DEFINER RPC so the permission check
-- happens server-side. Pass nulls for fields you don't want to
-- change.
-- ============================================================

create or replace function public.update_community_settings(
  community_id_in uuid,
  name_in         text    default null,
  description_in  text    default null,
  icon_url_in     text    default null,
  banner_url_in   text    default null,
  is_public_in    boolean default null
)
returns public.communities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_role    text;
  v_is_adm  boolean := false;
  v_row     public.communities%rowtype;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  begin v_is_adm := public.is_admin(); exception when others then v_is_adm := false; end;

  if not v_is_adm then
    select cm.role into v_role
      from public.community_members cm
     where cm.community_id = community_id_in
       and cm.profile_id   = v_uid;
    if v_role is null or v_role not in ('mod', 'owner') then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  end if;

  -- Validate inputs lightly. The application is expected to do
  -- friendlier validation, but we don't want garbage in the DB.
  if name_in is not null and length(trim(name_in)) < 3 then
    raise exception 'name_too_short' using errcode = '22000';
  end if;
  if name_in is not null and length(name_in) > 80 then
    raise exception 'name_too_long' using errcode = '22000';
  end if;
  if description_in is not null and length(description_in) > 4000 then
    raise exception 'description_too_long' using errcode = '22000';
  end if;

  update public.communities
     set name        = coalesce(nullif(trim(name_in), ''),        name),
         description = case
                         when description_in is null then description
                         when trim(description_in) = '' then null
                         else trim(description_in)
                       end,
         icon_url    = case
                         when icon_url_in is null then icon_url
                         when trim(icon_url_in) = '' then null
                         else trim(icon_url_in)
                       end,
         banner_url  = case
                         when banner_url_in is null then banner_url
                         when trim(banner_url_in) = '' then null
                         else trim(banner_url_in)
                       end,
         is_public   = coalesce(is_public_in, is_public)
   where id = community_id_in
   returning * into v_row;

  if v_row.id is null then
    raise exception 'community_not_found' using errcode = '22000';
  end if;
  return v_row;
end;
$$;

grant execute on function public.update_community_settings(uuid, text, text, text, text, boolean)
  to authenticated;

-- ============================================================
-- migration-supplier-kind.sql
--
-- Adds a `kind` discriminator on suppliers so the same directory
-- can surface two distinct experiences:
--   * 'vendor'       — hardware / lumber / parts vendors (default)
--   * 'manufacturer' — millwork shops, cabinet makers, installers
--
-- Existing rows default to 'vendor'. Frontend filters by kind on
-- the /suppliers page tab toggle. Admin-update RPC is extended to
-- accept the new field.
-- ============================================================

alter table public.suppliers
  add column if not exists kind text not null default 'vendor'
    check (kind in ('vendor','manufacturer'));

create index if not exists suppliers_kind_idx on public.suppliers(kind);

-- Extend admin_update_supplier so admins can flip a row from
-- vendor → manufacturer and vice versa.
create or replace function public.admin_update_supplier(
  supplier_id_in uuid,
  patch_in       jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.suppliers
     set name          = coalesce(patch_in->>'name',          name),
         slug          = coalesce(patch_in->>'slug',          slug),
         kind          = coalesce(patch_in->>'kind',          kind),
         category      = coalesce(patch_in->>'category',      category),
         trade         = coalesce(patch_in->>'trade',         trade),
         logo_initials = coalesce(patch_in->>'logo_initials', logo_initials),
         logo_url      = coalesce(patch_in->>'logo_url',      logo_url),
         banner_url    = coalesce(patch_in->>'banner_url',    banner_url),
         description   = coalesce(patch_in->>'description',   description),
         website       = coalesce(patch_in->>'website',       website),
         phone         = coalesce(patch_in->>'phone',         phone),
         email         = coalesce(patch_in->>'email',         email),
         address       = coalesce(patch_in->>'address',       address),
         hours         = coalesce(patch_in->>'hours',         hours),
         is_verified   = coalesce((patch_in->>'is_verified')::boolean, is_verified),
         is_approved   = coalesce((patch_in->>'is_approved')::boolean, is_approved),
         badges        = coalesce(
                           case when patch_in ? 'badges'
                                then array(select jsonb_array_elements_text(patch_in->'badges'))
                           end,
                           badges),
         updated_at    = now()
   where id = supplier_id_in;
end;
$$;

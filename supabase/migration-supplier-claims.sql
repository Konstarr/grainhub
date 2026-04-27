-- ============================================================
-- migration-supplier-claims.sql
--
-- "Claim your business" flow for the suppliers directory.
-- Adds a supplier_claims table and a set of RPCs:
--
--   submit_supplier_claim(supplier_id, claim_email, evidence)
--     - Auto-approves if the claim_email domain matches the
--       supplier's website domain (sets claimed_by + is_verified).
--     - Otherwise inserts a pending claim for admin review.
--
--   approve_supplier_claim(claim_id)         -- admin only
--   reject_supplier_claim(claim_id, reason)  -- admin only
--   update_my_supplier(supplier_id, patch)   -- claim owner only
--
-- Editable fields by the owner: logo_url, description, website,
-- phone, email, address. Everything else (name, slug, category,
-- is_verified, badges, rating) stays admin-only.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- supplier_claims
-- ------------------------------------------------------------
create table if not exists public.supplier_claims (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid not null references public.suppliers(id) on delete cascade,
  claimant_id  uuid not null references public.profiles(id)  on delete cascade,
  claim_email  text not null,
  evidence     text,
  status       text not null default 'pending'
                 check (status in ('pending','auto_approved','approved','rejected')),
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  reject_reason text,
  created_at   timestamptz not null default now()
);

-- Only one OPEN (pending) claim per (supplier, claimant) pair.
create unique index if not exists supplier_claims_one_pending_idx
  on public.supplier_claims (supplier_id, claimant_id)
  where status = 'pending';

create index if not exists supplier_claims_supplier_idx
  on public.supplier_claims (supplier_id, created_at desc);

create index if not exists supplier_claims_claimant_idx
  on public.supplier_claims (claimant_id, created_at desc);

create index if not exists supplier_claims_pending_idx
  on public.supplier_claims (created_at desc) where status = 'pending';

alter table public.supplier_claims enable row level security;

drop policy if exists "supplier_claims_select_own_or_admin" on public.supplier_claims;
create policy "supplier_claims_select_own_or_admin" on public.supplier_claims
  for select using (claimant_id = auth.uid() or public.is_admin());

-- No INSERT/UPDATE/DELETE policy — all writes go through SECURITY DEFINER RPCs.

-- ------------------------------------------------------------
-- Helper: extract the registrable host from a URL.
-- Handles missing scheme, paths, and ports. Returns null if blank.
-- ------------------------------------------------------------
create or replace function public._host_from_url(u text)
returns text
language plpgsql
immutable
as $$
declare
  s text := trim(coalesce(u, ''));
  host text;
begin
  if s = '' then return null; end if;
  -- strip scheme
  s := regexp_replace(s, '^https?://', '', 'i');
  -- strip user info
  s := regexp_replace(s, '^[^/@]+@', '');
  -- take up to first slash
  host := split_part(s, '/', 1);
  -- strip port
  host := split_part(host, ':', 1);
  -- lower + strip leading "www."
  host := lower(host);
  host := regexp_replace(host, '^www\.', '');
  if host = '' then return null; end if;
  return host;
end;
$$;

-- ------------------------------------------------------------
-- submit_supplier_claim
-- ------------------------------------------------------------
create or replace function public.submit_supplier_claim(
  supplier_id_in uuid,
  claim_email_in text,
  evidence_in    text default null
)
returns table(claim_id uuid, status text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid          uuid := auth.uid();
  v_supplier     record;
  v_email        text := lower(trim(coalesce(claim_email_in, '')));
  v_email_domain text;
  v_site_host    text;
  v_status       text;
  v_id           uuid;
begin
  if v_uid is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'invalid_email' using errcode = '22000';
  end if;

  select id, name, slug, website, claimed_by
    into v_supplier
    from public.suppliers
   where id = supplier_id_in;
  if not found then
    raise exception 'supplier_not_found' using errcode = '42704';
  end if;

  if v_supplier.claimed_by is not null then
    raise exception 'already_claimed' using errcode = '22000';
  end if;

  -- email domain (everything after the @, lowercased, www stripped).
  v_email_domain := lower(split_part(v_email, '@', 2));
  v_email_domain := regexp_replace(v_email_domain, '^www\.', '');
  v_site_host    := public._host_from_url(v_supplier.website);

  -- Auto-approve if domains match.
  if v_site_host is not null
     and v_email_domain is not null
     and v_email_domain = v_site_host then
    update public.suppliers
       set claimed_by = v_uid,
           is_verified = true,
           updated_at = now()
     where id = v_supplier.id;
    v_status := 'auto_approved';

    insert into public.supplier_claims
      (supplier_id, claimant_id, claim_email, evidence, status, reviewed_at)
    values
      (v_supplier.id, v_uid, v_email, evidence_in, 'auto_approved', now())
    returning id into v_id;
  else
    -- Pending review. Single open claim per (supplier, claimant)
    -- enforced by partial unique index — surface friendly error.
    begin
      insert into public.supplier_claims
        (supplier_id, claimant_id, claim_email, evidence, status)
      values
        (v_supplier.id, v_uid, v_email, evidence_in, 'pending')
      returning id into v_id;
    exception when unique_violation then
      raise exception 'claim_already_pending' using errcode = '22000';
    end;
    v_status := 'pending';
  end if;

  return query select v_id, v_status;
end;
$$;

grant execute on function public.submit_supplier_claim(uuid, text, text) to authenticated;

-- ------------------------------------------------------------
-- approve_supplier_claim  (admin only)
-- ------------------------------------------------------------
create or replace function public.approve_supplier_claim(claim_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claim record;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_claim from public.supplier_claims where id = claim_id_in;
  if not found then
    raise exception 'claim_not_found' using errcode = '42704';
  end if;
  if v_claim.status not in ('pending') then
    raise exception 'claim_not_pending' using errcode = '22000';
  end if;

  update public.suppliers
     set claimed_by = v_claim.claimant_id,
         is_verified = true,
         updated_at  = now()
   where id = v_claim.supplier_id;

  update public.supplier_claims
     set status      = 'approved',
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = v_claim.id;

  -- Auto-reject other pending claims for the same supplier.
  update public.supplier_claims
     set status        = 'rejected',
         reviewed_by   = auth.uid(),
         reviewed_at   = now(),
         reject_reason = 'superseded'
   where supplier_id = v_claim.supplier_id
     and status      = 'pending'
     and id         <> v_claim.id;
end;
$$;

grant execute on function public.approve_supplier_claim(uuid) to authenticated;

-- ------------------------------------------------------------
-- reject_supplier_claim  (admin only)
-- ------------------------------------------------------------
create or replace function public.reject_supplier_claim(
  claim_id_in uuid,
  reason_in   text default null
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

  update public.supplier_claims
     set status        = 'rejected',
         reviewed_by   = auth.uid(),
         reviewed_at   = now(),
         reject_reason = nullif(trim(coalesce(reason_in, '')), '')
   where id     = claim_id_in
     and status = 'pending';
end;
$$;

grant execute on function public.reject_supplier_claim(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- update_my_supplier  (claim owner only)
-- Editable fields: logo_url, description, website, phone, email, address.
-- Pass null to leave a field unchanged.
-- ------------------------------------------------------------
create or replace function public.update_my_supplier(
  supplier_id_in uuid,
  logo_url_in    text default null,
  description_in text default null,
  website_in     text default null,
  phone_in       text default null,
  email_in       text default null,
  address_in     text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
begin
  if v_uid is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  select claimed_by into v_owner from public.suppliers where id = supplier_id_in;
  if not found then
    raise exception 'supplier_not_found' using errcode = '42704';
  end if;
  if v_owner is null or (v_owner <> v_uid and not public.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.suppliers
     set logo_url    = coalesce(logo_url_in,    logo_url),
         description = coalesce(description_in, description),
         website     = coalesce(website_in,     website),
         phone       = coalesce(phone_in,       phone),
         email       = coalesce(email_in,       email),
         address     = coalesce(address_in,     address),
         updated_at  = now()
   where id = supplier_id_in;
end;
$$;

grant execute on function public.update_my_supplier(uuid, text, text, text, text, text, text) to authenticated;

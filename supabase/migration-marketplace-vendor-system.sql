-- ============================================================
-- migration-marketplace-vendor-system.sql
--
-- Adds the vendor-pack-gated listing creator system:
--
--   1. marketplace_pack_limits  — admin-editable per-vendor-tier
--      monthly post cap. Seeded with starter=3, growth=10, scale &
--      enterprise = unlimited. Editable from /admin/marketplace-settings.
--
--   2. marketplace_eligibility() RPC — returns whether the calling
--      user can post right now, plus posted_this_month / monthly_limit
--      / remaining for the UI banner.
--
--   3. create_marketplace_listing() RPC (SECURITY DEFINER) — server-
--      side enforcement of the eligibility check before inserting.
--      Auto-publishes (is_approved = true) per spec.
--
--   4. admin_upsert_marketplace_pack_limit() RPC — admin-only writer
--      for the settings table.
--
-- All idempotent. RLS for the new table allows public SELECT (so the
-- /pricing page can show the live caps), admin-only writes via RPC.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Pack limits table
-- ------------------------------------------------------------

create table if not exists public.marketplace_pack_limits (
  pack_tier_slug    text primary key,
  pack_label        text not null,
  monthly_post_limit int,
  sort_order        int not null default 0,
  is_active         boolean not null default true,
  updated_at        timestamptz not null default now(),
  updated_by        uuid references public.profiles(id) on delete set null
);

comment on table public.marketplace_pack_limits is
  'Admin-editable monthly listing post caps per vendor pack tier. NULL monthly_post_limit means unlimited.';

-- Seed defaults (idempotent — only inserts if missing).
insert into public.marketplace_pack_limits (pack_tier_slug, pack_label, monthly_post_limit, sort_order)
values
  ('vendor:starter',    'Vendor Starter',    3,    10),
  ('vendor:growth',     'Vendor Growth',     10,   20),
  ('vendor:scale',      'Vendor Scale',      null, 30),
  ('vendor:enterprise', 'Vendor Enterprise', null, 40)
on conflict (pack_tier_slug) do nothing;

alter table public.marketplace_pack_limits enable row level security;

drop policy if exists pack_limits_select_public on public.marketplace_pack_limits;
create policy pack_limits_select_public on public.marketplace_pack_limits
  for select using (true);

-- No direct INSERT/UPDATE/DELETE policies — all writes go through the
-- admin RPC below, which is SECURITY DEFINER + checks is_admin().


-- ------------------------------------------------------------
-- 2. Helper: read a profile's vendor pack tier slug
--    (e.g. 'vendor:starter'). Returns null when no vendor pack.
--    The packs JSON shape is { "vendor": "starter" | "growth" | ... }
--    per src/lib/pricing.js. We tolerate either column shape so this
--    survives the membership_tier vs profile_plan refactor.
-- ------------------------------------------------------------

create or replace function public.get_my_vendor_pack_tier()
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_packs jsonb;
  v_tier  text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select coalesce(p.profile_plan->'packs', '{}'::jsonb)
    into v_packs
    from public.profiles p
   where p.id = auth.uid();

  v_tier := v_packs->>'vendor';
  if v_tier is null or v_tier = '' then
    return null;
  end if;

  return 'vendor:' || v_tier;
end;
$$;

grant execute on function public.get_my_vendor_pack_tier() to authenticated;


-- ------------------------------------------------------------
-- 3. Eligibility check
-- ------------------------------------------------------------

create or replace function public.marketplace_eligibility()
returns table (
  eligible            boolean,
  reason              text,
  pack_tier_slug      text,
  pack_label          text,
  monthly_limit       int,
  posted_this_month   int,
  remaining           int
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_slug   text;
  v_label  text;
  v_limit  int;
  v_count  int;
begin
  if v_uid is null then
    return query select false, 'not_signed_in', null::text, null::text, null::int, 0, 0;
    return;
  end if;

  v_slug := public.get_my_vendor_pack_tier();

  if v_slug is null then
    return query select false, 'no_vendor_pack', null::text, null::text, null::int, 0, 0;
    return;
  end if;

  select pack_label, monthly_post_limit
    into v_label, v_limit
    from public.marketplace_pack_limits
   where pack_tier_slug = v_slug
     and is_active = true;

  if v_label is null then
    -- Pack tier is set on the profile but not configured in the limits
    -- table — admin needs to add it. Treat as no-vendor-pack so we
    -- don't accidentally allow unlimited posting.
    return query select false, 'pack_not_configured', v_slug, null::text, null::int, 0, 0;
    return;
  end if;

  select count(*)::int
    into v_count
    from public.marketplace_listings
   where seller_id = v_uid
     and created_at >= date_trunc('month', now());

  if v_limit is null then
    -- Unlimited.
    return query select true, 'ok', v_slug, v_label, null::int, v_count, 999999;
    return;
  end if;

  if v_count >= v_limit then
    return query select false, 'monthly_limit_reached', v_slug, v_label, v_limit, v_count, 0;
    return;
  end if;

  return query select true, 'ok', v_slug, v_label, v_limit, v_count, (v_limit - v_count);
end;
$$;

grant execute on function public.marketplace_eligibility() to authenticated;


-- ------------------------------------------------------------
-- 4. Server-side listing creator with eligibility enforcement
-- ------------------------------------------------------------

create or replace function public.create_marketplace_listing(
  p_title       text,
  p_category    text,
  p_condition   text,
  p_price       numeric,
  p_currency    text,
  p_description text,
  p_location    text,
  p_trade       text,
  p_images      text[]
)
returns table (
  id        uuid,
  slug      text,
  is_approved boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid       uuid := auth.uid();
  v_eligible  boolean;
  v_reason    text;
  v_slug      text;
  v_base      text;
  v_suffix    text;
  v_title     text;
  v_new_id    uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  v_title := nullif(btrim(coalesce(p_title, '')), '');
  if v_title is null or length(v_title) < 5 then
    raise exception 'title_too_short' using errcode = '22000';
  end if;
  if length(v_title) > 200 then
    raise exception 'title_too_long' using errcode = '22000';
  end if;

  -- Re-run eligibility server-side. Frontend check is for UX only.
  select e.eligible, e.reason
    into v_eligible, v_reason
    from public.marketplace_eligibility() e;

  if not v_eligible then
    raise exception 'not_eligible: %', v_reason using errcode = '42501';
  end if;

  -- Slugify: lowercase, alphanumeric+hyphen, collapsed, +6char suffix
  -- so we never collide with existing rows.
  v_base := lower(regexp_replace(v_title, '[^a-zA-Z0-9]+', '-', 'g'));
  v_base := btrim(v_base, '-');
  v_base := substr(v_base, 1, 60);
  if v_base = '' then
    v_base := 'listing';
  end if;
  v_suffix := substr(md5(random()::text || clock_timestamp()::text), 1, 6);
  v_slug := v_base || '-' || v_suffix;

  insert into public.marketplace_listings (
    seller_id, title, slug, category, trade, condition,
    price, currency, description, location, images,
    is_sold, is_approved
  ) values (
    v_uid, v_title, v_slug,
    nullif(p_category, ''),
    nullif(p_trade, ''),
    nullif(p_condition, ''),
    p_price,
    coalesce(nullif(p_currency, ''), 'USD'),
    nullif(p_description, ''),
    nullif(p_location, ''),
    coalesce(p_images, '{}'::text[]),
    false,
    true   -- auto-publish per spec
  )
  returning marketplace_listings.id into v_new_id;

  return query
    select v_new_id, v_slug, true;
end;
$$;

grant execute on function public.create_marketplace_listing(
  text, text, text, numeric, text, text, text, text, text[]
) to authenticated;


-- ------------------------------------------------------------
-- 5. Admin upsert for pack limits
-- ------------------------------------------------------------

create or replace function public.admin_upsert_marketplace_pack_limit(
  p_pack_tier_slug   text,
  p_pack_label       text,
  p_monthly_limit    int,
  p_sort_order       int,
  p_is_active        boolean
)
returns public.marketplace_pack_limits
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.marketplace_pack_limits;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.marketplace_pack_limits (
    pack_tier_slug, pack_label, monthly_post_limit, sort_order, is_active, updated_at, updated_by
  ) values (
    p_pack_tier_slug,
    coalesce(nullif(btrim(p_pack_label), ''), p_pack_tier_slug),
    p_monthly_limit,
    coalesce(p_sort_order, 0),
    coalesce(p_is_active, true),
    now(),
    auth.uid()
  )
  on conflict (pack_tier_slug) do update
    set pack_label         = excluded.pack_label,
        monthly_post_limit = excluded.monthly_post_limit,
        sort_order         = excluded.sort_order,
        is_active          = excluded.is_active,
        updated_at         = now(),
        updated_by         = auth.uid()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.admin_upsert_marketplace_pack_limit(
  text, text, int, int, boolean
) to authenticated;


create or replace function public.admin_delete_marketplace_pack_limit(p_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from public.marketplace_pack_limits where pack_tier_slug = p_slug;
end;
$$;

grant execute on function public.admin_delete_marketplace_pack_limit(text) to authenticated;


-- ------------------------------------------------------------
-- 6. Performance index for the per-month count query
-- ------------------------------------------------------------

create index if not exists idx_marketplace_listings_seller_created
  on public.marketplace_listings (seller_id, created_at desc);

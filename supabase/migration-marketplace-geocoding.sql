-- ============================================================
-- migration-marketplace-geocoding.sql
--
-- Adds the columns the distance filter needs:
--   zip_code   text   - what the seller types when posting
--   latitude   double precision  - lat of the zip's centroid
--   longitude  double precision  - lng of the zip's centroid
--
-- Geocoding happens client-side via Nominatim before the row is
-- created (or edited), so by the time the row hits the DB it already
-- has lat/lng. The columns are nullable so old listings stay valid.
--
-- create_marketplace_listing() is updated to accept the new fields.
-- Idempotent.
-- ============================================================

alter table public.marketplace_listings
  add column if not exists zip_code  text,
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;

-- Distance queries scan a lot of rows; this index makes the WHERE
-- "lat is not null" + bounding-box scan O(log n) instead of O(n).
create index if not exists idx_marketplace_listings_geo
  on public.marketplace_listings (latitude, longitude)
  where latitude is not null and longitude is not null;


-- ------------------------------------------------------------
-- Re-create create_marketplace_listing with the new params.
-- Drops the old signature first because Postgres treats the
-- argument list as part of the function identity.
-- ------------------------------------------------------------
drop function if exists public.create_marketplace_listing(
  text, text, text, numeric, text, text, text, text, text[]
);

create or replace function public.create_marketplace_listing(
  p_title       text,
  p_category    text,
  p_condition   text,
  p_price       numeric,
  p_currency    text,
  p_description text,
  p_location    text,
  p_trade       text,
  p_images      text[],
  p_zip_code    text,
  p_latitude    double precision,
  p_longitude   double precision
)
returns table (
  id          uuid,
  slug        text,
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
  v_zip       text;
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

  v_zip := nullif(btrim(coalesce(p_zip_code, '')), '');
  if v_zip is null then
    raise exception 'zip_required' using errcode = '22000';
  end if;
  -- Loose check: 5+ chars, alphanumeric + hyphen/space (covers US 5/9
  -- and CA / UK / EU postcode shapes).
  if length(v_zip) < 3 or length(v_zip) > 12 then
    raise exception 'zip_invalid' using errcode = '22000';
  end if;

  -- Re-run eligibility server-side. Frontend check is for UX only.
  select e.eligible, e.reason
    into v_eligible, v_reason
    from public.marketplace_eligibility() e;

  if not v_eligible then
    raise exception 'not_eligible: %', v_reason using errcode = '42501';
  end if;

  -- Slugify with a random suffix so we never collide.
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
    zip_code, latitude, longitude,
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
    v_zip,
    p_latitude,
    p_longitude,
    false,
    true   -- auto-publish per spec
  )
  returning marketplace_listings.id into v_new_id;

  return query
    select v_new_id, v_slug, true;
end;
$$;

grant execute on function public.create_marketplace_listing(
  text, text, text, numeric, text, text, text, text, text[],
  text, double precision, double precision
) to authenticated;

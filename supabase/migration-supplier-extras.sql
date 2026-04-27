-- ============================================================
-- migration-supplier-extras.sql
--
-- Wires the supplier profile up end-to-end:
--   * adds banner_url + hours columns to public.suppliers
--   * adds supplier_reviews + RPCs (submit / delete)
--   * trigger that recomputes suppliers.rating + review_count
--   * extends update_my_supplier to cover banner_url + hours
--   * adds admin_update_supplier (full field control)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- New columns on suppliers
-- ------------------------------------------------------------
alter table public.suppliers
  add column if not exists banner_url text,
  add column if not exists hours      text;

-- ------------------------------------------------------------
-- supplier_reviews
-- One review per (supplier, reviewer). Self-review blocked.
-- ------------------------------------------------------------
create table if not exists public.supplier_reviews (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid not null references public.suppliers(id) on delete cascade,
  reviewer_id  uuid not null references public.profiles(id)  on delete cascade,
  rating       int  not null check (rating between 1 and 5),
  body         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (supplier_id, reviewer_id)
);

create index if not exists supplier_reviews_supplier_idx
  on public.supplier_reviews (supplier_id, created_at desc);

alter table public.supplier_reviews enable row level security;

drop policy if exists "supplier_reviews_select_all" on public.supplier_reviews;
create policy "supplier_reviews_select_all" on public.supplier_reviews
  for select using (true);

drop policy if exists "supplier_reviews_insert_self" on public.supplier_reviews;
create policy "supplier_reviews_insert_self" on public.supplier_reviews
  for insert to authenticated
  with check (reviewer_id = auth.uid());

drop policy if exists "supplier_reviews_update_self" on public.supplier_reviews;
create policy "supplier_reviews_update_self" on public.supplier_reviews
  for update to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

drop policy if exists "supplier_reviews_delete_self_or_admin" on public.supplier_reviews;
create policy "supplier_reviews_delete_self_or_admin" on public.supplier_reviews
  for delete to authenticated
  using (reviewer_id = auth.uid() or public.is_admin());

-- Touch trigger
drop trigger if exists supplier_reviews_touch on public.supplier_reviews;
create trigger supplier_reviews_touch before update on public.supplier_reviews
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- Aggregate trigger: keep suppliers.rating + review_count fresh
-- ------------------------------------------------------------
create or replace function public._supplier_recompute_rating(s_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_avg   numeric;
  v_count int;
begin
  select round(avg(rating)::numeric, 1), count(*)
    into v_avg, v_count
    from public.supplier_reviews
   where supplier_id = s_id;
  update public.suppliers
     set rating       = v_avg,
         review_count = coalesce(v_count, 0),
         updated_at   = now()
   where id = s_id;
end;
$$;

create or replace function public._supplier_reviews_after_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (tg_op = 'DELETE') then
    perform public._supplier_recompute_rating(old.supplier_id);
    return old;
  else
    perform public._supplier_recompute_rating(new.supplier_id);
    return new;
  end if;
end;
$$;

drop trigger if exists supplier_reviews_aggregate_trg on public.supplier_reviews;
create trigger supplier_reviews_aggregate_trg
  after insert or update or delete on public.supplier_reviews
  for each row execute function public._supplier_reviews_after_change();

-- ------------------------------------------------------------
-- submit_supplier_review (insert or update)
-- Block self-reviews (the claimed_by user can't rate their own).
-- ------------------------------------------------------------
create or replace function public.submit_supplier_review(
  supplier_id_in uuid,
  rating_in      int,
  body_in        text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_owner uuid;
begin
  if v_uid is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if rating_in is null or rating_in < 1 or rating_in > 5 then
    raise exception 'invalid_rating' using errcode = '22000';
  end if;

  select claimed_by into v_owner from public.suppliers where id = supplier_id_in;
  if not found then
    raise exception 'supplier_not_found' using errcode = '42704';
  end if;
  if v_owner is not null and v_owner = v_uid then
    raise exception 'cannot_review_own' using errcode = '22000';
  end if;

  insert into public.supplier_reviews (supplier_id, reviewer_id, rating, body)
  values (supplier_id_in, v_uid, rating_in, nullif(trim(coalesce(body_in,'')),''))
  on conflict (supplier_id, reviewer_id) do update
    set rating     = excluded.rating,
        body       = excluded.body,
        updated_at = now();
end;
$$;

grant execute on function public.submit_supplier_review(uuid, int, text) to authenticated;

-- ------------------------------------------------------------
-- update_my_supplier — extended to include banner_url + hours
-- (replaces the version from migration-supplier-claims.sql)
-- ------------------------------------------------------------
create or replace function public.update_my_supplier(
  supplier_id_in uuid,
  logo_url_in    text default null,
  banner_url_in  text default null,
  description_in text default null,
  website_in     text default null,
  phone_in       text default null,
  email_in       text default null,
  address_in     text default null,
  hours_in       text default null
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
         banner_url  = coalesce(banner_url_in,  banner_url),
         description = coalesce(description_in, description),
         website     = coalesce(website_in,     website),
         phone       = coalesce(phone_in,       phone),
         email       = coalesce(email_in,       email),
         address     = coalesce(address_in,     address),
         hours       = coalesce(hours_in,       hours),
         updated_at  = now()
   where id = supplier_id_in;
end;
$$;

grant execute on function public.update_my_supplier(uuid, text, text, text, text, text, text, text, text) to authenticated;

-- ------------------------------------------------------------
-- admin_update_supplier — full field control for staff
-- ------------------------------------------------------------
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
         is_verified   = coalesce((patch_in->>'is_verified')::boolean,   is_verified),
         is_approved   = coalesce((patch_in->>'is_approved')::boolean,   is_approved),
         badges        = coalesce(
                           case when patch_in ? 'badges'
                                then array(select jsonb_array_elements_text(patch_in->'badges'))
                           end,
                           badges),
         updated_at    = now()
   where id = supplier_id_in;
end;
$$;

grant execute on function public.admin_update_supplier(uuid, jsonb) to authenticated;

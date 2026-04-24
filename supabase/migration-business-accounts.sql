-- ============================================================
-- migration-business-accounts.sql
--
-- Splits profiles into two account types — 'individual' (default)
-- and 'business'. Businesses carry extra fields (company name,
-- website, contact info, trade, size) and are the only accounts
-- that can hold a sponsor_tier.
--
-- Also updates handle_new_user to copy account_type and business
-- fields from the signup metadata into the profile row.
--
-- Safe to re-run — everything is idempotent.
-- ============================================================

-- 1) Columns
alter table public.profiles
  add column if not exists account_type          text not null default 'individual',
  add column if not exists business_name         text,
  add column if not exists business_website      text,
  add column if not exists business_contact_email text,
  add column if not exists business_phone        text,
  add column if not exists business_trade        text,
  add column if not exists business_size         text,
  add column if not exists business_verified     boolean not null default false;

-- Normalize existing rows (everyone pre-migration is an individual)
update public.profiles set account_type = 'individual' where account_type is null;

-- Account-type CHECK constraint
do $$
declare
  cons_name text;
begin
  select conname into cons_name
    from pg_constraint
   where conrelid = 'public.profiles'::regclass
     and contype  = 'c'
     and pg_get_constraintdef(oid) ilike '%account_type%';
  if cons_name is not null then
    execute format('alter table public.profiles drop constraint %I', cons_name);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_account_type_check
  check (account_type in ('individual', 'business'));

-- sponsor_tier is only valid when account_type = 'business'
do $$
declare
  cons_name text;
begin
  select conname into cons_name
    from pg_constraint
   where conrelid = 'public.profiles'::regclass
     and contype  = 'c'
     and pg_get_constraintdef(oid) ilike '%sponsor_tier%and%account_type%';
  if cons_name is not null then
    execute format('alter table public.profiles drop constraint %I', cons_name);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_sponsor_requires_business
  check (sponsor_tier is null or account_type = 'business');

-- 2) Update the auto-profile trigger to consume signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_username text;
  v_full_name text;
begin
  v_type := coalesce(new.raw_user_meta_data->>'account_type', 'individual');
  if v_type not in ('individual','business') then
    v_type := 'individual';
  end if;

  v_username := coalesce(
    new.raw_user_meta_data->>'preferred_username',
    lower(split_part(new.email, '@', 1)) || '-' || substr(replace(new.id::text, '-', ''), 1, 6)
  );

  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', null);

  insert into public.profiles (
    id, username, full_name,
    account_type,
    business_name,
    business_website,
    business_contact_email,
    business_phone,
    business_trade,
    business_size
  )
  values (
    new.id,
    v_username,
    v_full_name,
    v_type,
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_website',
    new.raw_user_meta_data->>'business_contact_email',
    new.raw_user_meta_data->>'business_phone',
    new.raw_user_meta_data->>'business_trade',
    new.raw_user_meta_data->>'business_size'
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Index: find businesses fast
create index if not exists profiles_account_type_idx on public.profiles(account_type);
create index if not exists profiles_sponsor_tier_idx on public.profiles(sponsor_tier) where sponsor_tier is not null;

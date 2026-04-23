-- ============================================================
-- GrainHub — Supabase schema
-- ============================================================
-- Paste this whole file into Supabase Studio → SQL Editor → New query
-- and Run. Safe to re-run (uses create if not exists / drop policy if exists).
--
-- Tables created:
--   profiles             one row per registered user (extends auth.users)
--   forum_groups         top-level forum sections (reference data)
--   forum_categories     sub-forums inside each group (reference data)
--   forum_threads        user-created threads
--   forum_posts          user-created posts inside threads
--   jobs                 job board listings
--   events               industry events + meetups
--   suppliers            supplier directory + claim flow
--   wiki_articles        editorial wiki content
--   news_articles        editorial news content
--   marketplace_listings for-sale listings (machines, lumber, etc.)
--
-- Row Level Security (RLS) is enabled on every user-facing table so that
-- the anon key used in the frontend cannot modify anything it shouldn't.
-- ============================================================

-- Helpful extensions (usually on by default in Supabase)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  full_name    text,
  bio          text,
  avatar_url   text,
  trade        text,                                     -- primary trade slug
  location     text,
  website      text,
  role         text not null default 'member'
               check (role in ('member','moderator','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Keep updated_at fresh on any update
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    -- default username: everything before @ in email, lowercased, uniquified with random suffix
    lower(split_part(new.email, '@', 1)) || '-' || substr(replace(new.id::text, '-', ''), 1, 6),
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- FORUM STRUCTURE (reference tables, seeded from data files)
-- ------------------------------------------------------------
create table if not exists public.forum_groups (
  id             text primary key,           -- slug, e.g. 'cabinet-making'
  name           text not null,
  description    text,
  icon           text,
  icon_color     text,
  display_order  int not null default 0
);

create table if not exists public.forum_categories (
  id             text primary key,           -- slug, e.g. 'frameless-cabinets'
  group_id       text not null references public.forum_groups(id) on delete cascade,
  name           text not null,
  description    text,
  icon           text,
  icon_color     text,
  trade          text,                       -- trade slug for filtering
  display_order  int not null default 0
);

-- ------------------------------------------------------------
-- FORUM CONTENT (user-generated)
-- ------------------------------------------------------------
create table if not exists public.forum_threads (
  id              uuid primary key default gen_random_uuid(),
  category_id     text not null references public.forum_categories(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  title           text not null,
  slug            text unique not null,
  is_pinned       boolean not null default false,
  is_locked       boolean not null default false,
  is_solved       boolean not null default false,
  view_count      int not null default 0,
  reply_count     int not null default 0,
  last_reply_at   timestamptz not null default now(),
  last_reply_by   uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists forum_threads_category_idx on public.forum_threads(category_id, last_reply_at desc);
create index if not exists forum_threads_author_idx   on public.forum_threads(author_id);

create table if not exists public.forum_posts (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references public.forum_threads(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  parent_post_id  uuid references public.forum_posts(id) on delete set null,
  body            text not null,
  is_deleted      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists forum_posts_thread_idx on public.forum_posts(thread_id, created_at);

drop trigger if exists forum_posts_touch on public.forum_posts;
create trigger forum_posts_touch before update on public.forum_posts
  for each row execute function public.touch_updated_at();

-- Keep thread.reply_count + last_reply_at in sync when posts change
create or replace function public.bump_thread_on_post()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads
       set reply_count   = reply_count + 1,
           last_reply_at = new.created_at,
           last_reply_by = new.author_id
     where id = new.thread_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.forum_threads
       set reply_count = greatest(reply_count - 1, 0)
     where id = old.thread_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists forum_posts_bump on public.forum_posts;
create trigger forum_posts_bump
  after insert or delete on public.forum_posts
  for each row execute function public.bump_thread_on_post();

-- ------------------------------------------------------------
-- JOBS
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid references public.profiles(id) on delete set null,
  title            text not null,
  company          text not null,
  location         text not null,
  trade            text,
  employment_type  text,            -- 'full-time','part-time','contract','apprenticeship'
  salary_min       int,
  salary_max       int,
  salary_period    text default 'year', -- 'hour','year'
  description      text not null,
  requirements     text,
  benefits         text,
  apply_url        text,
  apply_email      text,
  is_approved      boolean not null default false,
  is_filled        boolean not null default false,
  posted_at        timestamptz not null default now(),
  expires_at       timestamptz
);
create index if not exists jobs_approved_idx on public.jobs(is_approved, posted_at desc);

-- ------------------------------------------------------------
-- EVENTS
-- ------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid references public.profiles(id) on delete set null,
  title             text not null,
  slug              text unique not null,
  description       text not null,
  event_type        text,                -- 'conference','workshop','meetup','trade-show'
  start_date        timestamptz not null,
  end_date          timestamptz,
  location          text,
  venue_name        text,
  is_online         boolean not null default false,
  registration_url  text,
  cover_image_url   text,
  trade             text,
  is_approved       boolean not null default false,
  created_at        timestamptz not null default now()
);
create index if not exists events_start_idx on public.events(start_date);

-- ------------------------------------------------------------
-- SUPPLIERS
-- ------------------------------------------------------------
create table if not exists public.suppliers (
  id             uuid primary key default gen_random_uuid(),
  claimed_by     uuid references public.profiles(id) on delete set null,
  name           text not null,
  slug           text unique not null,
  category       text,
  trade          text,
  logo_initials  text,
  logo_url       text,
  description    text,
  website        text,
  phone          text,
  email          text,
  address        text,
  rating         numeric(2,1),
  review_count   int not null default 0,
  badges         text[] not null default '{}',
  is_verified    boolean not null default false,
  is_approved    boolean not null default true,  -- seed data is pre-approved
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists suppliers_trade_idx on public.suppliers(trade);

drop trigger if exists suppliers_touch on public.suppliers;
create trigger suppliers_touch before update on public.suppliers
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- WIKI
-- ------------------------------------------------------------
create table if not exists public.wiki_articles (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid references public.profiles(id) on delete set null,
  title             text not null,
  slug              text unique not null,
  category          text,
  trade             text,
  excerpt           text,
  body              text not null,       -- markdown
  cover_image_url   text,
  read_time_minutes int,
  is_published      boolean not null default false,
  published_at      timestamptz,
  updated_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
create index if not exists wiki_published_idx on public.wiki_articles(is_published, published_at desc);

drop trigger if exists wiki_touch on public.wiki_articles;
create trigger wiki_touch before update on public.wiki_articles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- NEWS
-- ------------------------------------------------------------
create table if not exists public.news_articles (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references public.profiles(id) on delete set null,
  title           text not null,
  slug            text unique not null,
  category        text,
  trade           text,
  excerpt         text,
  body            text not null,
  cover_image_url text,
  source_url      text,                 -- if syndicated from elsewhere
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists news_published_idx on public.news_articles(is_published, published_at desc);

-- ------------------------------------------------------------
-- MARKETPLACE
-- ------------------------------------------------------------
create table if not exists public.marketplace_listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid references public.profiles(id) on delete set null,
  title        text not null,
  slug         text unique not null,
  category     text,
  trade        text,
  condition    text,                    -- 'new','used-excellent','used-good','used-fair'
  price        numeric(10,2),
  currency     text not null default 'USD',
  description  text,
  images       text[] not null default '{}',
  location     text,
  is_sold      boolean not null default false,
  is_approved  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists marketplace_approved_idx on public.marketplace_listings(is_approved, created_at desc);

drop trigger if exists marketplace_touch on public.marketplace_listings;
create trigger marketplace_touch before update on public.marketplace_listings
  for each row execute function public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper: is the current user a moderator or admin?
create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator','admin')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS
alter table public.profiles             enable row level security;
alter table public.forum_groups          enable row level security;
alter table public.forum_categories      enable row level security;
alter table public.forum_threads         enable row level security;
alter table public.forum_posts           enable row level security;
alter table public.jobs                  enable row level security;
alter table public.events                enable row level security;
alter table public.suppliers             enable row level security;
alter table public.wiki_articles         enable row level security;
alter table public.news_articles         enable row level security;
alter table public.marketplace_listings  enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id or public.is_moderator());

-- ---------- forum_groups / forum_categories (reference data) ----------
drop policy if exists forum_groups_select on public.forum_groups;
create policy forum_groups_select on public.forum_groups for select using (true);

drop policy if exists forum_groups_admin_write on public.forum_groups;
create policy forum_groups_admin_write on public.forum_groups
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists forum_categories_select on public.forum_categories;
create policy forum_categories_select on public.forum_categories for select using (true);

drop policy if exists forum_categories_admin_write on public.forum_categories;
create policy forum_categories_admin_write on public.forum_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- forum_threads ----------
drop policy if exists forum_threads_select on public.forum_threads;
create policy forum_threads_select on public.forum_threads for select using (true);

drop policy if exists forum_threads_insert_auth on public.forum_threads;
create policy forum_threads_insert_auth on public.forum_threads
  for insert with check (auth.uid() = author_id);

drop policy if exists forum_threads_update_own on public.forum_threads;
create policy forum_threads_update_own on public.forum_threads
  for update using (auth.uid() = author_id or public.is_moderator());

drop policy if exists forum_threads_delete_mod on public.forum_threads;
create policy forum_threads_delete_mod on public.forum_threads
  for delete using (auth.uid() = author_id or public.is_moderator());

-- ---------- forum_posts ----------
drop policy if exists forum_posts_select on public.forum_posts;
create policy forum_posts_select on public.forum_posts for select using (true);

drop policy if exists forum_posts_insert_auth on public.forum_posts;
create policy forum_posts_insert_auth on public.forum_posts
  for insert with check (auth.uid() = author_id);

drop policy if exists forum_posts_update_own on public.forum_posts;
create policy forum_posts_update_own on public.forum_posts
  for update using (auth.uid() = author_id or public.is_moderator());

drop policy if exists forum_posts_delete_mod on public.forum_posts;
create policy forum_posts_delete_mod on public.forum_posts
  for delete using (auth.uid() = author_id or public.is_moderator());

-- ---------- jobs ----------
-- Public sees only approved + not filled. Author sees their own always.
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select using (is_approved = true or auth.uid() = author_id or public.is_moderator());

drop policy if exists jobs_insert_auth on public.jobs;
create policy jobs_insert_auth on public.jobs
  for insert with check (auth.uid() = author_id);

drop policy if exists jobs_update_own on public.jobs;
create policy jobs_update_own on public.jobs
  for update using (auth.uid() = author_id or public.is_moderator());

drop policy if exists jobs_delete_own on public.jobs;
create policy jobs_delete_own on public.jobs
  for delete using (auth.uid() = author_id or public.is_moderator());

-- ---------- events ----------
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select using (is_approved = true or auth.uid() = author_id or public.is_moderator());

drop policy if exists events_insert_auth on public.events;
create policy events_insert_auth on public.events
  for insert with check (auth.uid() = author_id);

drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events
  for update using (auth.uid() = author_id or public.is_moderator());

drop policy if exists events_delete_own on public.events;
create policy events_delete_own on public.events
  for delete using (auth.uid() = author_id or public.is_moderator());

-- ---------- suppliers ----------
drop policy if exists suppliers_select on public.suppliers;
create policy suppliers_select on public.suppliers
  for select using (is_approved = true or auth.uid() = claimed_by or public.is_moderator());

-- Only moderators can add new suppliers to the directory (for now).
drop policy if exists suppliers_insert_mod on public.suppliers;
create policy suppliers_insert_mod on public.suppliers
  for insert with check (public.is_moderator());

-- A claimed supplier can be edited by the claimer or a mod.
drop policy if exists suppliers_update_claimer on public.suppliers;
create policy suppliers_update_claimer on public.suppliers
  for update using (auth.uid() = claimed_by or public.is_moderator());

drop policy if exists suppliers_delete_mod on public.suppliers;
create policy suppliers_delete_mod on public.suppliers
  for delete using (public.is_moderator());

-- ---------- wiki_articles (editorial — admin only) ----------
drop policy if exists wiki_select on public.wiki_articles;
create policy wiki_select on public.wiki_articles
  for select using (is_published = true or public.is_admin());

drop policy if exists wiki_admin_write on public.wiki_articles;
create policy wiki_admin_write on public.wiki_articles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- news_articles (editorial — admin only) ----------
drop policy if exists news_select on public.news_articles;
create policy news_select on public.news_articles
  for select using (is_published = true or public.is_admin());

drop policy if exists news_admin_write on public.news_articles;
create policy news_admin_write on public.news_articles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- marketplace_listings ----------
drop policy if exists marketplace_select on public.marketplace_listings;
create policy marketplace_select on public.marketplace_listings
  for select using (is_approved = true or auth.uid() = seller_id or public.is_moderator());

drop policy if exists marketplace_insert_auth on public.marketplace_listings;
create policy marketplace_insert_auth on public.marketplace_listings
  for insert with check (auth.uid() = seller_id);

drop policy if exists marketplace_update_own on public.marketplace_listings;
create policy marketplace_update_own on public.marketplace_listings
  for update using (auth.uid() = seller_id or public.is_moderator());

drop policy if exists marketplace_delete_own on public.marketplace_listings;
create policy marketplace_delete_own on public.marketplace_listings
  for delete using (auth.uid() = seller_id or public.is_moderator());

-- ============================================================
-- Done. Run supabase/seed.sql next to populate reference data.
-- ============================================================

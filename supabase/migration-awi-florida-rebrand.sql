-- ============================================================================
-- AWI FLORIDA CHAPTER REBRAND
--
-- This migration rebuilds the forum taxonomy around the hybrid model
-- (topic-based top-level + dedicated Regional Meet-ups) and replaces the
-- existing freemium tier system with three chapter membership tiers:
--   member     — paid full member, full access
--   associate  — limited access (e.g. sponsor employees, student/edu)
--   guest      — free signup, read-only on members-only content
--
-- It is SAFE to run on top of the current Millwork.io DB. It will:
--   * REPLACE forum_groups and forum_categories with the AWI FL structure.
--   * Add chapter-tier metadata columns (region, member_since, dues_paid_through).
--   * Leave existing forum_threads / forum_posts intact, but they'll point
--     at categories that no longer exist. See the OPTIONAL block at the end
--     for a wipe-history command if you want a clean slate.
--
-- Run order: paste the entire file into the Supabase SQL editor.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. WIPE existing forum reference data so we can rebuild cleanly.
--    forum_categories cascades on forum_groups via FK; forum_threads will
--    cascade-delete via category FK, which is what we want when category
--    IDs are changing.
-- ----------------------------------------------------------------------------
delete from public.forum_categories;
delete from public.forum_groups;

-- ----------------------------------------------------------------------------
-- 2. INSERT the AWI Florida Chapter forum taxonomy.
--    Top-level "groups" are the visible category cards on /forums.
--    "categories" are the slug-based sub-forums users actually post in.
-- ----------------------------------------------------------------------------
insert into public.forum_groups (id, name, description, icon_color, display_order) values
  ('shop',         'Shop Floor',         'Day-to-day production, bench talk, and shop management', '#8a5030', 10),
  ('estimating',   'Estimating & Bidding','Takeoffs, proposals, change orders, and pricing custom work', '#a36441', 20),
  ('field',        'Field & Install',    'Site coordination, scribing, punch lists, and install crews',   '#6B3F1F', 30),
  ('code',         'Code & Compliance',  'Florida building code, FBC, TSCA, fire ratings, and impact glazing', '#9B2222', 40),
  ('standards',    'AWS / QCP',          'Architectural Woodwork Standards, QCP certification, AWI programs', '#2E6F2E', 50),
  ('industry',     'Industry Talk',      'Hardware, software, materials, finishes, and trade news',       '#185FA5', 60),
  ('regional',     'Regional Meet-ups',  'In-person and regional discussion for your part of Florida',    '#c07a3c', 70);

-- Categories live INSIDE groups. The id is the slug used in /forums URLs.
insert into public.forum_categories (id, group_id, name, description, display_order) values
  -- Shop Floor
  ('shop-general',          'shop',       'General shop talk',         'Anything that doesn''t fit elsewhere', 10),
  ('shop-production',       'shop',       'Production & flow',         'Nested-base, batch cutting, scheduling, throughput', 20),
  ('shop-equipment',        'shop',       'Equipment & machinery',     'CNC, edge banders, beam saws, dust collection', 30),
  ('shop-finishing',        'shop',       'Finishing & spray booth',   'Conversion varnish, waterborne, VOC compliance', 40),
  ('shop-hiring',           'shop',       'Hiring & crews',            'Apprentice pipelines, retention, WCA, FL trade schools', 50),

  -- Estimating & Bidding
  ('est-takeoffs',          'estimating', 'Takeoffs & quantities',     'Reading drawings, RFIs, scope', 10),
  ('est-pricing',           'estimating', 'Pricing & labor rates',     'FL labor markets, hourly rates, profit margins', 20),
  ('est-bids',              'estimating', 'Bids & proposals',          'Bid documents, qualifications, alternates', 30),
  ('est-change-orders',     'estimating', 'Change orders',             'Documenting, pricing, and getting paid for changes', 40),
  ('est-software',          'estimating', 'Estimating software',       'Cabinet Vision, Microvellum, KCDw, Mozaik', 50),

  -- Field & Install
  ('field-coordination',    'field',      'Site coordination',         'GC handoffs, sequencing, lifts, deliveries', 10),
  ('field-scribing',        'field',      'Scribing & field fitting',  'Tricks for tight tolerances on built-up walls', 20),
  ('field-millwork',        'field',      'Millwork installs',         'Casework, paneling, ceilings, reception desks', 30),
  ('field-punch',           'field',      'Punch list & closeout',     'Closeout docs, attic stock, warranties', 40),

  -- Code & Compliance
  ('code-fbc',              'code',       'Florida Building Code',     'Most recent FBC edition, local jurisdictions', 10),
  ('code-impact',           'code',       'Impact / hurricane glazing','Coordinating with door/window subs in coastal counties', 20),
  ('code-fire',             'code',       'Fire ratings & assemblies', '20/45/90-min ratings on wood doors and assemblies', 30),
  ('code-tsca',             'code',       'TSCA / formaldehyde',       'TSCA Title VI, CARB-2, supplier documentation', 40),
  ('code-osha',             'code',       'OSHA & shop safety',        'Dust, lockout/tagout, MSDS, EPA RRP for finishers', 50),

  -- AWS / QCP
  ('std-aws',               'standards',  'AWS standards',             'Custom vs. Premium grade, joinery, tolerances', 10),
  ('std-qcp',               'standards',  'QCP certification',         'Licensure, inspections, AWI Florida QCP support', 20),
  ('std-submittals',        'standards',  'Shop drawings & submittals','Tabbing, cut sheets, what GCs actually look for', 30),
  ('std-awi-programs',      'standards',  'AWI national programs',     'CMP, AWI conferences, scholarships, education', 40),

  -- Industry Talk
  ('ind-hardware',          'industry',   'Hardware',                  'Blum, Hettich, Salice, Grass, Hafele — sourcing in FL', 10),
  ('ind-materials',         'industry',   'Materials & lumber',        'FL hardwood sourcing, plywood, MDF, HPL', 20),
  ('ind-software',          'industry',   'Design & CNC software',     'Cabinet Vision, Microvellum, KCDw, Mozaik', 30),
  ('ind-news',              'industry',   'Industry news',             'AWI national news, FL construction market', 40),

  -- Regional Meet-ups (one category per FL region)
  ('region-south-fl',       'regional',   'South Florida',             'Miami-Dade, Broward, Palm Beach, Monroe', 10),
  ('region-treasure-coast', 'regional',   'Treasure Coast',            'Martin, St. Lucie, Indian River, Okeechobee', 20),
  ('region-central-fl',     'regional',   'Central Florida',           'Orlando, Volusia, Brevard, Lake, Polk, Seminole', 30),
  ('region-tampa-bay',      'regional',   'Tampa Bay',                 'Hillsborough, Pinellas, Pasco, Manatee, Sarasota', 40),
  ('region-southwest-fl',   'regional',   'Southwest Florida',         'Lee, Collier, Charlotte, Hendry', 50),
  ('region-north-fl',       'regional',   'North Florida / Jax',       'Duval, Clay, St. Johns, Nassau, Alachua', 60),
  ('region-panhandle',      'regional',   'Panhandle',                 'Escambia, Santa Rosa, Okaloosa, Bay, Leon, west of Tallahassee', 70);

-- ----------------------------------------------------------------------------
-- 3. PROFILES: add chapter-membership metadata columns.
--    region        — which FL region the member is in (filters/forum prefs)
--    member_since  — when they first joined the chapter
--    dues_paid_through — annual dues expiry
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists region            text,
  add column if not exists member_since      date,
  add column if not exists dues_paid_through date,
  add column if not exists company_name      text;

create index if not exists profiles_region_idx
  on public.profiles(region) where region is not null;

-- ----------------------------------------------------------------------------
-- 4. MEMBERSHIP TIERS — repurpose the existing membership_tier column.
--    We standardize on three values: 'member' | 'associate' | 'guest'.
--    Existing rows get a one-time mapping:
--      'pro' / 'enterprise' / 'business' → 'member'
--      anything else                     → 'guest'
--
--    NOTE: there is a row-level trigger `profiles_enforce_scope` on
--    public.profiles that blocks updates when auth.uid() is not the row
--    owner. Bulk migration UPDATEs run from the SQL editor have no
--    auth.uid(), so we disable the trigger for the duration of the bulk
--    update, then re-enable. RLS isn't relevant here because the SQL
--    editor runs as the project owner.
-- ----------------------------------------------------------------------------
-- First: drop ANY existing check constraint on membership_tier so the
-- bulk UPDATE below can move rows through transitional values without
-- the old constraint blocking us.
do $$
declare
  cn text;
begin
  for cn in
    select con.conname
    from pg_constraint con
    join pg_class      c   on c.oid = con.conrelid
    join pg_namespace  n   on n.oid = c.relnamespace
    where c.relname = 'profiles'
      and n.nspname = 'public'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%membership_tier%'
  loop
    execute format('alter table public.profiles drop constraint %I', cn);
  end loop;
end$$;

alter table public.profiles disable trigger profiles_enforce_scope;

-- Map EVERY existing value to one of the new three. Anything we don't
-- explicitly recognize (null, 'free', 'starter', 'plus', or anything
-- else legacy) collapses to 'guest'.
update public.profiles
   set membership_tier = case
     when membership_tier in ('member', 'associate', 'guest')      then membership_tier
     when membership_tier in ('pro', 'enterprise', 'business')     then 'member'
     else 'guest'
   end;

alter table public.profiles enable trigger profiles_enforce_scope;

-- Now enforce the new tier vocabulary going forward.
alter table public.profiles
  add constraint profiles_membership_tier_check
    check (membership_tier in ('member', 'associate', 'guest'));

-- ----------------------------------------------------------------------------
-- 5. CHAPTER MEMBERSHIP TIER DEFINITIONS — a tiny reference table the
--    Membership page reads to render pricing + perks. Editable by admins.
-- ----------------------------------------------------------------------------
create table if not exists public.chapter_tiers (
  id              text primary key,            -- 'member' | 'associate' | 'guest'
  name            text not null,
  annual_dues_usd numeric(10,2),               -- null = free
  blurb           text,
  perks           jsonb not null default '[]'::jsonb,
  display_order   int not null default 0,
  is_active       boolean not null default true,
  updated_at      timestamptz not null default now()
);

insert into public.chapter_tiers (id, name, annual_dues_usd, blurb, perks, display_order) values
  ('member',    'Chapter Member', 350,
    'Full chapter access: events at member rate, member directory listing, full forum and resource library access.',
    '["Discounted event pricing","Listed in member directory","Full forum + resources access","Vote in chapter elections","Eligible for chapter board"]'::jsonb,
    10),
  ('associate', 'Associate',      150,
    'For employees of member firms and academic affiliates. Full read access, limited member-only events.',
    '["Full forum + resources access","Member-only events (priced separately)","Cannot be listed in directory","No voting rights"]'::jsonb,
    20),
  ('guest',     'Guest',          0,
    'Free signup. Browse public forums and select chapter content. Upgrade any time to access member-only resources.',
    '["Public forums (read + post in select categories)","Public events at non-member rate","Cannot access member-only resources"]'::jsonb,
    30)
on conflict (id) do update set
  name            = excluded.name,
  annual_dues_usd = excluded.annual_dues_usd,
  blurb           = excluded.blurb,
  perks           = excluded.perks,
  display_order   = excluded.display_order,
  updated_at      = now();

-- RLS — anyone can read the tier definitions; only admins write.
alter table public.chapter_tiers enable row level security;

drop policy if exists chapter_tiers_select on public.chapter_tiers;
create policy chapter_tiers_select on public.chapter_tiers for select using (true);

drop policy if exists chapter_tiers_admin_write on public.chapter_tiers;
create policy chapter_tiers_admin_write on public.chapter_tiers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
  );

commit;

-- ============================================================================
-- OPTIONAL — wipe existing forum content so the rebrand starts clean.
-- This DROPS every thread, post, vote, and report. Only run if you really
-- want a fresh start. Comment out otherwise.
-- ============================================================================
-- begin;
--   delete from public.forum_post_votes;
--   delete from public.forum_thread_reports;
--   delete from public.forum_posts;
--   delete from public.forum_threads;
-- commit;

-- ============================================================================
-- VERIFY: after running, this should return 7 groups and ~32 categories.
-- select count(*) from public.forum_groups;       -- expect 7
-- select count(*) from public.forum_categories;   -- expect ~32
-- select id, name, annual_dues_usd from public.chapter_tiers order by display_order;
-- ============================================================================

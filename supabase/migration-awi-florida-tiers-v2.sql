-- ============================================================================
-- AWI FLORIDA CHAPTER — Tiers v2 + Sponsorship Opportunities
--
-- Modeled on the AWI Chicago Chapter membership structure:
--   * Two paid tiers — Manufacturer ($575/yr) and Supplier ($575/yr)
--   * Free Guest tier for read-only access
--   * Annual chapter sponsorships (Platinum / Gold / Silver)
--   * Event sponsorship opportunities (golf, showcase, etc.)
--
-- Safe to run after `migration-awi-florida-rebrand.sql`. It:
--   * Migrates existing rows: 'member' → 'manufacturer', 'associate' → 'guest'
--   * Replaces the check constraint with the new vocabulary
--   * Re-seeds chapter_tiers
--   * Creates and seeds public.chapter_sponsorships
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Migrate profiles to the new tier vocabulary.
--    member → manufacturer (the active full-member equivalent)
--    associate → guest     (associate goes away; restate as guest)
-- ----------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_membership_tier_check;

alter table public.profiles disable trigger profiles_enforce_scope;

update public.profiles
   set membership_tier = case
     when membership_tier = 'member'    then 'manufacturer'
     when membership_tier = 'associate' then 'guest'
     when membership_tier in ('manufacturer','supplier','guest') then membership_tier
     else 'guest'
   end;

alter table public.profiles enable trigger profiles_enforce_scope;

alter table public.profiles
  add constraint profiles_membership_tier_check
    check (membership_tier in ('manufacturer','supplier','guest'));

-- ----------------------------------------------------------------------------
-- 2. Re-seed chapter_tiers with the new vocabulary.
-- ----------------------------------------------------------------------------
delete from public.chapter_tiers;

insert into public.chapter_tiers (id, name, annual_dues_usd, blurb, perks, display_order) values
  ('manufacturer', 'Manufacturer Member', 575,
    'For Florida cabinet shops, architectural millwork firms, finishers, and installers doing the work. Full chapter access, voting rights, member directory listing.',
    '["Listed in the chapter directory","Member rate on every chapter event","Voting rights in chapter elections","Eligible for chapter board service","Full forum and resource library access","Logo eligibility on event collateral"]'::jsonb,
    10),
  ('supplier', 'Supplier Member', 575,
    'For hardware, lumber, machinery, software, and finish suppliers selling into the Florida architectural woodwork industry. Same access — plus direct visibility into the chapter''s manufacturer membership.',
    '["Listed in the chapter directory","Direct exposure to manufacturer members at chapter events","Member rate on every chapter event","First right of refusal on event sponsorships","Full forum and resource library access","Voting rights in chapter elections"]'::jsonb,
    20),
  ('guest', 'Guest', 0,
    'Free signup. Browse public chapter content. Upgrade any time to access members-only resources and discounted event pricing.',
    '["Public forums and resources","Events at non-member rate","Not listed in the member directory","No voting rights"]'::jsonb,
    30);

-- ----------------------------------------------------------------------------
-- 3. Chapter sponsorship opportunities — annual + event-level.
--    Mirrors the AWI Chicago model (golf outing, tabletop showcase, etc.)
--    `tier` is either 'annual' (year-round) or 'event' (one specific event).
--    `event_slug` links event-tier rows to a specific event for cross-reference.
-- ----------------------------------------------------------------------------
create table if not exists public.chapter_sponsorships (
  id               text primary key,
  tier             text not null check (tier in ('annual','event')),
  name             text not null,
  price_usd        numeric(10,2),
  blurb            text,
  perks            jsonb not null default '[]'::jsonb,
  event_slug       text,                       -- null for annual; event slug for event-tier
  slots_available  int,                        -- null = unlimited
  display_order    int not null default 0,
  is_active        boolean not null default true,
  updated_at       timestamptz not null default now()
);

create index if not exists chapter_sponsorships_tier_idx
  on public.chapter_sponsorships(tier, display_order);

-- ----------------------------------------------------------------------------
-- 4. Seed sponsorship opportunities. Editable by admins via SQL or admin UI.
-- ----------------------------------------------------------------------------
insert into public.chapter_sponsorships
  (id, tier, name, price_usd, blurb, perks, event_slug, slots_available, display_order)
values
  -- ANNUAL — year-round chapter sponsorships
  ('annual-platinum', 'annual', 'Platinum Annual Sponsor', 5000,
    'Top-billing year-round visibility across every chapter event, the chapter website, and all chapter communications.',
    '["Top logo placement on the chapter website","Logo on every chapter event banner","Dedicated speaking slot at one chapter event per year","Reserved priority table at the annual showcase","First right of refusal on event sponsorships","Recognition in every chapter email"]'::jsonb,
    null, 2, 10),

  ('annual-gold', 'annual', 'Gold Annual Sponsor', 2500,
    'Strong year-round chapter visibility without the top-tier commitment.',
    '["Logo on the chapter website","Logo on chapter event banners","Reserved seating at the annual showcase","Recognition in quarterly chapter emails"]'::jsonb,
    null, 4, 20),

  ('annual-silver', 'annual', 'Silver Annual Sponsor', 1000,
    'Affordable year-round listing for smaller suppliers and single-shop firms.',
    '["Logo on the chapter website","Listed as a chapter sponsor in the directory","Recognition at chapter events"]'::jsonb,
    null, 8, 30),

  -- EVENT — Annual Golf Outing
  ('event-golf-title', 'event', 'Golf Outing — Title Sponsor', 2500,
    'Title sponsorship of the chapter''s annual golf outing.',
    '["Logo on every hole sign","Logo on tournament bags","Recognized at opening ceremony","Complimentary foursome included"]'::jsonb,
    'annual-golf-outing', 1, 40),

  ('event-golf-drink', 'event', 'Golf Outing — Drink Cart Sponsor', 500,
    'Brand the drink carts circulating the course on tournament day.',
    '["Branding on both drink carts","Recognized at opening ceremony","Listed in the event program"]'::jsonb,
    'annual-golf-outing', 2, 50),

  ('event-golf-hole', 'event', 'Golf Outing — Hole Sponsor', 250,
    'Sponsor a single hole at the annual golf outing.',
    '["Branded sign at one hole","Listed in the event program"]'::jsonb,
    'annual-golf-outing', 18, 60),

  ('event-golf-food', 'event', 'Golf Outing — Food/Lunch Sponsor', 500,
    'Sponsor the lunch service for all participants.',
    '["Branding at the lunch service area","Recognized at opening ceremony","Listed in the event program"]'::jsonb,
    'annual-golf-outing', 2, 70),

  -- EVENT — Tabletop Product Showcase
  ('event-showcase-table', 'event', 'Showcase — Exhibit Table', 250,
    'A 6-foot display table at the annual tabletop product showcase.',
    '["Reserved 6-foot display table","Listed in the event program","Two attendee badges"]'::jsonb,
    'tabletop-showcase', 30, 80),

  ('event-showcase-bar', 'event', 'Showcase — Bar Sponsor', 500,
    'Sponsor the bar at the annual tabletop showcase.',
    '["Branding behind the bar","Two complimentary attendee badges","Recognized at opening remarks"]'::jsonb,
    'tabletop-showcase', 2, 90),

  ('event-showcase-bowling', 'event', 'Showcase — Bowling Sponsor', 500,
    'Sponsor a bowling lane block at the showcase social activity.',
    '["Branding at sponsored lanes","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 2, 100),

  ('event-showcase-shoes', 'event', 'Showcase — Bowling Shoe Sponsor', 250,
    'Logo on the bowling shoe rental tags at the showcase.',
    '["Logo on shoe-rental tags","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 1, 110),

  ('event-showcase-bocce', 'event', 'Showcase — Bocce Ball Sponsor', 350,
    'Sponsor the bocce court at the showcase social activity.',
    '["Branding at the bocce court","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 1, 120)
on conflict (id) do update set
  tier            = excluded.tier,
  name            = excluded.name,
  price_usd       = excluded.price_usd,
  blurb           = excluded.blurb,
  perks           = excluded.perks,
  event_slug      = excluded.event_slug,
  slots_available = excluded.slots_available,
  display_order   = excluded.display_order,
  updated_at      = now();

-- ----------------------------------------------------------------------------
-- 5. RLS — everyone reads, only admins/owners write.
-- ----------------------------------------------------------------------------
alter table public.chapter_sponsorships enable row level security;

drop policy if exists chapter_sponsorships_select on public.chapter_sponsorships;
create policy chapter_sponsorships_select on public.chapter_sponsorships
  for select using (true);

drop policy if exists chapter_sponsorships_admin_write on public.chapter_sponsorships;
create policy chapter_sponsorships_admin_write on public.chapter_sponsorships
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','owner'))
  );

commit;

-- ============================================================================
-- Verify after running:
-- select membership_tier, count(*) from public.profiles
--   group by membership_tier;                                   -- expect manufacturer/supplier/guest only
-- select id, name, annual_dues_usd from public.chapter_tiers
--   order by display_order;
-- select tier, count(*), sum(coalesce(price_usd,0)) as total_value_usd
--   from public.chapter_sponsorships where is_active group by tier;
-- ============================================================================

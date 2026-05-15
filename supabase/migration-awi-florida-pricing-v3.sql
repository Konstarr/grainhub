-- ============================================================================
-- AWI Florida Chapter — pricing & showcase update (v3)
--
-- Three changes:
--   1. Annual dues drop from $575 to $500 for both Manufacturer and Supplier.
--   2. "Tabletop Product Showcase" renamed → "Annual Product Showcase".
--   3. Generic Sponsor A / B / C replace the old bowling/bocce/shoe
--      activity sponsorships. The Exhibit Table line stays (just renamed).
--   4. Membership tier order: Guest first, then Manufacturer, then Supplier.
-- ============================================================================

begin;

-- ── 1. Drop dues to $500 ────────────────────────────────────────────────
update public.chapter_tiers
   set annual_dues_usd = 500,
       updated_at      = now()
 where id in ('manufacturer', 'supplier');

-- ── 2. Reorder tiers so Guest is first ──────────────────────────────────
update public.chapter_tiers set display_order = 10 where id = 'guest';
update public.chapter_tiers set display_order = 20 where id = 'manufacturer';
update public.chapter_tiers set display_order = 30 where id = 'supplier';

-- ── 3. Drop the activity-themed showcase sponsorships ───────────────────
--    (bar, bowling, bowling shoe, bocce ball)
delete from public.chapter_sponsorships
 where event_slug = 'tabletop-showcase'
   and id in (
     'event-showcase-bar',
     'event-showcase-bowling',
     'event-showcase-shoes',
     'event-showcase-bocce'
   );

-- ── 4. Rename the Exhibit Table line (drop "Tabletop") ──────────────────
update public.chapter_sponsorships
   set name       = 'Product Showcase — Exhibit Table',
       blurb      = 'A 6-foot display table at the annual product showcase.',
       updated_at = now()
 where id = 'event-showcase-table';

-- ── 5. Insert generic Sponsor A / B / C ────────────────────────────────
insert into public.chapter_sponsorships
  (id, tier, name, price_usd, blurb, perks, event_slug, slots_available, display_order)
values
  ('event-showcase-sponsor-a', 'event', 'Product Showcase — Sponsor A', 500,
    'Premier event sponsor at the annual product showcase.',
    '["Premier branding throughout the event","Two complimentary attendee badges","Recognition at opening remarks","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 2, 90),

  ('event-showcase-sponsor-b', 'event', 'Product Showcase — Sponsor B', 350,
    'Mid-tier event sponsor at the annual product showcase.',
    '["Branding placement at the event","One complimentary attendee badge","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 2, 100),

  ('event-showcase-sponsor-c', 'event', 'Product Showcase — Sponsor C', 250,
    'Entry-tier event sponsor at the annual product showcase.',
    '["Branding placement at the event","Listed in the event program"]'::jsonb,
    'tabletop-showcase', 4, 110)
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

commit;

-- ── Verify ──────────────────────────────────────────────────────────────
-- select id, name, annual_dues_usd, display_order
--   from public.chapter_tiers order by display_order;
-- select id, name, price_usd, slots_available
--   from public.chapter_sponsorships
--   where event_slug = 'tabletop-showcase'
--   order by display_order;

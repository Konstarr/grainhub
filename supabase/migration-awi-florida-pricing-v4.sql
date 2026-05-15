-- ============================================================================
-- AWI Florida Chapter — sponsor tier order (v4)
--
-- Reverse the annual chapter sponsorship order so the cheapest option
-- (Silver) appears first and the premier tier (Platinum) appears last.
-- This matches the conventional "good / better / best" pricing-table
-- pattern that leads the eye toward the premium offering on the right.
--
-- Effect on /membership: the three annual sponsor cards render in the
-- order Silver → Gold → Platinum, with the "Top tier" highlight badge
-- still on Platinum (now in the rightmost position).
-- ============================================================================

begin;

update public.chapter_sponsorships set display_order = 10, updated_at = now()
 where id = 'annual-silver';

update public.chapter_sponsorships set display_order = 20, updated_at = now()
 where id = 'annual-gold';

update public.chapter_sponsorships set display_order = 30, updated_at = now()
 where id = 'annual-platinum';

commit;

-- Verify:
-- select id, name, price_usd, display_order
--   from public.chapter_sponsorships
--   where tier = 'annual'
--   order by display_order;
--
-- expected:
--   annual-silver    Silver Annual Sponsor    $1,000    10
--   annual-gold      Gold Annual Sponsor      $2,500    20
--   annual-platinum  Platinum Annual Sponsor  $5,000    30

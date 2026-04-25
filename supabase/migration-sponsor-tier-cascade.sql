-- ============================================================
-- migration-sponsor-tier-cascade.sql
--
-- When a profile's sponsor_tier changes (an admin upgrades or
-- downgrades a sponsor in /admin/users), automatically retag every
-- sponsor_media row owned by that profile to the new tier. Without
-- this, existing media rows kept their old tier and the public
-- placement components (SponsorFeatured filters tier='platinum',
-- SponsorMulti filters tier='gold') never moved them.
--
-- The cascade runs as the table owner (postgres) inside the trigger,
-- which bypasses the enforce_sponsor_media_scope guard cleanly.
--
-- Idempotent. Safe to re-run.
-- ============================================================

create or replace function public.cascade_sponsor_tier_to_media()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only act when sponsor_tier actually changed.
  if new.sponsor_tier is distinct from old.sponsor_tier then
    -- A null sponsor_tier means the user is no longer a sponsor —
    -- pause their media instead of nulling out the tier (which would
    -- violate the NOT NULL the column likely carries).
    if new.sponsor_tier is null then
      update public.sponsor_media
         set is_active = false
       where owner_id = new.id;
    else
      update public.sponsor_media
         set tier = new.sponsor_tier
       where owner_id = new.id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_cascade_sponsor_tier on public.profiles;
create trigger profiles_cascade_sponsor_tier
  after update of sponsor_tier on public.profiles
  for each row execute function public.cascade_sponsor_tier_to_media();

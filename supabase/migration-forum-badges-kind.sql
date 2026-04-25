-- ============================================================
-- migration-forum-badges-kind.sql
--
-- Split badges into two conceptual buckets so the admin UI can
-- show them separately:
--
--   level    — community standing tiers earned by overall
--              reputation (Newcomer → Trusted → Respected → …).
--              One per user at a time, conceptually a rank.
--   accolade — recognition for specific content
--              (Liked, Helpful, Authority, …). Stackable; users
--              can hold many at once.
--
-- Adds the `kind` column, backfills the seeded badges, and
-- inserts a starter set of level badges so the admin page has
-- something useful in the Levels group out of the box.
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- 1) Column.
alter table public.badges
  add column if not exists kind text;

-- Soft constraint at the app layer; promote to CHECK later if we
-- want hard enforcement. For now we accept 'level' / 'accolade' /
-- 'custom' / null (treated as accolade in the UI).

-- 2) Backfill the original seeded rows.
update public.badges set kind = 'level'    where id in ('reputation-100', 'reputation-500');
update public.badges set kind = 'accolade' where id in ('liked', 'helpful', 'authority');

-- 3) Default any other existing rows to 'accolade' so nothing
--    falls through the cracks in the UI.
update public.badges set kind = 'accolade' where kind is null;

-- 4) Seed a starter set of level badges (idempotent via upsert).
--    Tiers map onto rough rep brackets. Admin can edit any of
--    these or delete and re-create as needed.
insert into public.badges (id, name, description, icon, tier, kind, metric_type, threshold, "order")
values
  ('level-newcomer',   'Newcomer',   'Welcome to the workshop.',                 '🌱', 'bronze',   'level', 'reputation', 0,    1),
  ('level-contributor','Contributor','Posting and helping out regularly.',       '🔨', 'bronze',   'level', 'reputation', 50,   2),
  ('level-trusted',    'Trusted',    'Consistently constructive across topics.', '🛠',  'silver',   'level', 'reputation', 250,  3),
  ('level-respected',  'Respected',  'Recognized voice in the community.',       '⭐',  'gold',     'level', 'reputation', 1000, 4),
  ('level-veteran',    'Veteran',    'Long-standing pillar of GrainHub.',        '🏛',  'platinum', 'level', 'reputation', 2500, 5)
on conflict (id) do nothing;

-- 5) Make sure the existing reputation-* badges sort below the
--    starter levels so the new ones lead the list.
update public.badges set "order" = 6 where id = 'reputation-100' and "order" < 6;
update public.badges set "order" = 7 where id = 'reputation-500' and "order" < 7;

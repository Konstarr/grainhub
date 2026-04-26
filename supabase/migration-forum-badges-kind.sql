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

-- 1b) Widen the tier check constraint so admins can pick
--     'platinum' (the original schema only allowed bronze/silver/
--     gold). Drop-and-recreate is the cleanest path; the constraint
--     name is the auto-generated badges_tier_check.
alter table public.badges drop constraint if exists badges_tier_check;
alter table public.badges
  add constraint badges_tier_check
  check (tier in ('bronze','silver','gold','platinum'));

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
--    NOTE: the column is named display_order in the original
--    migration-forum-system.sql (not "order") — keep aligned.
insert into public.badges (id, name, description, icon, tier, kind, metric_type, threshold, display_order)
values
  ('level-newcomer',   'Newcomer',   'Welcome to the workshop.',                 '🌱', 'bronze',   'level', 'reputation', 0,    1),
  ('level-contributor','Contributor','Posting and helping out regularly.',       '🔨', 'bronze',   'level', 'reputation', 50,   2),
  ('level-trusted',    'Trusted',    'Consistently constructive across topics.', '🛠',  'silver',   'level', 'reputation', 250,  3),
  ('level-respected',  'Respected',  'Recognized voice in the community.',       '⭐',  'gold',     'level', 'reputation', 1000, 4),
  ('level-veteran',    'Veteran',    'Long-standing pillar of Millwork.io.',        '🏛',  'platinum', 'level', 'reputation', 2500, 5)
on conflict (id) do nothing;

-- 5) Make sure the existing reputation-* badges sort below the
--    starter levels so the new ones lead the list.
update public.badges set display_order = 6 where id = 'reputation-100' and display_order < 6;
update public.badges set display_order = 7 where id = 'reputation-500' and display_order < 7;

-- 6) Replace the old admin-only RLS policy with one that uses
--    is_admin() (which covers both 'admin' and 'owner'). The old
--    policy from migration-forum-system.sql checked role = 'admin'
--    exactly, so owners couldn't update or delete badges — that's
--    why "edit doesn't do anything" from the admin UI.
alter table public.badges enable row level security;

drop policy if exists badges_admin_write on public.badges;
drop policy if exists badges_modify_admin on public.badges;
drop policy if exists badges_select on public.badges;
drop policy if exists badges_select_all on public.badges;

create policy badges_select_all on public.badges
  for select using (true);

create policy badges_modify_admin on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

-- 7) Belt-and-suspenders: SECURITY DEFINER RPCs for admin badge
--    CRUD. The admin page calls these so writes never depend on
--    PostgREST's RLS round-trip — auth is checked inside the
--    function and the caller gets a clean error if they're not
--    staff.
create or replace function public.admin_upsert_badge(
  p_id            text,
  p_name          text,
  p_description   text,
  p_icon          text,
  p_tier          text,
  p_kind          text,
  p_metric_type   text,
  p_threshold     int,
  p_display_order int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  insert into public.badges
    (id, name, description, icon, tier, kind, metric_type, threshold, display_order)
  values
    (p_id, p_name, p_description, p_icon, p_tier, p_kind, p_metric_type, p_threshold, p_display_order)
  on conflict (id) do update set
    name          = excluded.name,
    description   = excluded.description,
    icon          = excluded.icon,
    tier          = excluded.tier,
    kind          = excluded.kind,
    metric_type   = excluded.metric_type,
    threshold     = excluded.threshold,
    display_order = excluded.display_order;
end $$;

create or replace function public.admin_delete_badge(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  delete from public.badges where id = p_id;
end $$;

revoke all on function public.admin_upsert_badge(text,text,text,text,text,text,text,int,int) from public;
revoke all on function public.admin_delete_badge(text) from public;
grant execute on function public.admin_upsert_badge(text,text,text,text,text,text,text,int,int) to authenticated;
grant execute on function public.admin_delete_badge(text) to authenticated;

-- 8) Extend the badge evaluator with two more metrics so admins
--    can build accolades around solved questions and thread
--    upvotes (in addition to the existing reputation, post upvotes,
--    threads, posts).
create or replace function public.evaluate_user_badges(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  v_rep                int;
  v_thread_count       int;
  v_post_count         int;
  v_post_upvotes       int;
  v_thread_upvotes     int;
  v_solved_threads     int;
begin
  if uid is null then return; end if;

  select reputation, thread_count, post_count
    into v_rep, v_thread_count, v_post_count
    from public.profiles
   where id = uid;
  if not found then return; end if;

  select coalesce(sum(upvote_count), 0)::int into v_post_upvotes
    from public.forum_posts where author_id = uid;
  select coalesce(sum(upvote_count), 0)::int into v_thread_upvotes
    from public.forum_threads where author_id = uid;
  select count(*)::int into v_solved_threads
    from public.forum_threads where author_id = uid and is_solved = true;

  for b in
    select id, metric_type, threshold from public.badges
     where metric_type is not null
       and threshold   is not null
       and metric_type <> 'manual'
  loop
    if (b.metric_type = 'reputation'           and v_rep            >= b.threshold)
       or (b.metric_type = 'post_upvotes_total'   and v_post_upvotes   >= b.threshold)
       or (b.metric_type = 'thread_upvotes_total' and v_thread_upvotes >= b.threshold)
       or (b.metric_type = 'thread_count'         and v_thread_count   >= b.threshold)
       or (b.metric_type = 'post_count'           and v_post_count     >= b.threshold)
       or (b.metric_type = 'solved_thread_count'  and v_solved_threads >= b.threshold)
    then
      perform public.award_badge(uid, b.id);
    end if;
  end loop;
end $$;

-- ============================================================
-- migration-forum-badges-editable.sql
--
-- Make badges fully admin-editable (icon, name, description, tier,
-- threshold). Replaces the hardcoded slug-by-slug awards in the
-- upvote triggers with a generic evaluator that loops every badge
-- and awards based on its metric_type + threshold columns.
--
-- After this migration, admins can create new tiers like
-- "Legend at 1000 rep" by inserting a row — no code changes.
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- 1) Add metric_type + threshold columns to badges. Existing rows
--    get backfilled below.
alter table public.badges
  add column if not exists metric_type text,
  add column if not exists threshold   int;

-- Allowed metric values (validation only at app layer for now;
-- could promote to a CHECK constraint later).
--   'reputation'        — profiles.reputation
--   'post_upvotes_total'— sum of forum_posts.upvote_count by author
--   'thread_count'      — profiles.thread_count
--   'post_count'        — profiles.post_count
--   'manual'            — admin-awarded only, never auto

-- 2) Backfill the seeded badges with their metric + threshold.
update public.badges set metric_type = 'reputation',         threshold = 100  where id = 'reputation-100';
update public.badges set metric_type = 'reputation',         threshold = 500  where id = 'reputation-500';
update public.badges set metric_type = 'post_upvotes_total', threshold = 10   where id = 'liked';
update public.badges set metric_type = 'post_upvotes_total', threshold = 50   where id = 'helpful';
update public.badges set metric_type = 'post_upvotes_total', threshold = 250  where id = 'authority';

-- 3) Generic evaluator. Loops every badge with metric+threshold
--    set and awards the ones the user qualifies for. award_badge()
--    is itself idempotent (insert ... on conflict do nothing) so
--    repeat calls are safe and cheap.
create or replace function public.evaluate_user_badges(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  v_rep             int;
  v_thread_count    int;
  v_post_count      int;
  v_post_upvotes    int;
begin
  if uid is null then return; end if;

  select reputation, thread_count, post_count
    into v_rep, v_thread_count, v_post_count
    from public.profiles
   where id = uid;
  if not found then return; end if;

  select coalesce(sum(upvote_count), 0)::int into v_post_upvotes
    from public.forum_posts where author_id = uid;

  for b in
    select id, metric_type, threshold from public.badges
     where metric_type is not null
       and threshold   is not null
       and metric_type <> 'manual'
  loop
    if (b.metric_type = 'reputation'         and v_rep          >= b.threshold)
       or (b.metric_type = 'post_upvotes_total' and v_post_upvotes >= b.threshold)
       or (b.metric_type = 'thread_count'    and v_thread_count >= b.threshold)
       or (b.metric_type = 'post_count'      and v_post_count   >= b.threshold)
    then
      perform public.award_badge(uid, b.id);
    end if;
  end loop;
end $$;

revoke all on function public.evaluate_user_badges(uuid) from public;
grant execute on function public.evaluate_user_badges(uuid) to authenticated;

-- 4) Replace upvote triggers to call the evaluator instead of
--    hardcoding badge slugs. Rep gain still comes from forum_settings.
create or replace function public.on_thread_upvote()
returns trigger language plpgsql as $$
declare
  v_author   uuid;
  v_rep_gain int := public.get_forum_setting('rep_thread_upvote', 2);
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads set upvote_count = upvote_count + 1
     where id = new.thread_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + v_rep_gain
       where id = v_author;
      perform public.evaluate_user_badges(v_author);
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.forum_threads set upvote_count = greatest(upvote_count - 1, 0)
     where id = old.thread_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = greatest(reputation - v_rep_gain, 0)
       where id = v_author;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create or replace function public.on_post_upvote()
returns trigger language plpgsql as $$
declare
  v_author   uuid;
  v_rep_gain int := public.get_forum_setting('rep_post_upvote', 1);
begin
  if (tg_op = 'INSERT') then
    update public.forum_posts set upvote_count = upvote_count + 1
     where id = new.post_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + v_rep_gain
       where id = v_author;
      perform public.evaluate_user_badges(v_author);
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.forum_posts set upvote_count = greatest(upvote_count - 1, 0)
     where id = old.post_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = greatest(reputation - v_rep_gain, 0)
       where id = v_author;
    end if;
    return old;
  end if;
  return null;
end;
$$;

-- 5) RLS on badges — let admins write directly.
alter table public.badges enable row level security;

drop policy if exists badges_select_all on public.badges;
create policy badges_select_all on public.badges
  for select using (true);   -- public read; the badge metadata is
                             -- displayed everywhere a user shows up

drop policy if exists badges_modify_admin on public.badges;
create policy badges_modify_admin on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

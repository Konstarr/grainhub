-- ============================================================
-- migration-forum-rep-settings.sql
--
-- Move hardcoded reputation values and badge thresholds into the
-- existing forum_settings k/v table so admins can tune them
-- live from /admin/forums/reputation.
--
-- Settings keys this migration introduces:
--
--   rep_thread_upvote    — points the thread author gains per upvote
--   rep_post_upvote      — points the post   author gains per upvote
--   rep_accepted_answer  — points awarded when a reply is accepted
--                          (zero today; reserved for future wiring)
--
--   badge_trusted_rep      — rep threshold for "Trusted"      badge
--   badge_respected_rep    — rep threshold for "Respected"    badge
--   badge_liked_upvotes    — total post-upvotes for "Liked"   badge
--   badge_helpful_upvotes  — total post-upvotes for "Helpful" badge
--   badge_authority_upvotes — total post-upvotes for "Authority" badge
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- 1) Seed defaults (matches the values that were hardcoded before)
insert into public.forum_settings (key, value) values
  ('rep_thread_upvote',       '2'),
  ('rep_post_upvote',         '1'),
  ('rep_accepted_answer',     '10'),
  ('badge_trusted_rep',       '100'),
  ('badge_respected_rep',     '500'),
  ('badge_liked_upvotes',     '10'),
  ('badge_helpful_upvotes',   '50'),
  ('badge_authority_upvotes', '250')
on conflict (key) do nothing;

-- 2) Replace the upvote triggers to read from settings.
create or replace function public.on_thread_upvote()
returns trigger language plpgsql as $$
declare
  v_author     uuid;
  v_new_rep    int;
  v_rep_gain   int := public.get_forum_setting('rep_thread_upvote', 2);
  v_t_rep      int := public.get_forum_setting('badge_trusted_rep', 100);
  v_r_rep      int := public.get_forum_setting('badge_respected_rep', 500);
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads set upvote_count = upvote_count + 1
     where id = new.thread_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + v_rep_gain
       where id = v_author
       returning reputation into v_new_rep;
      if v_new_rep >= v_t_rep then perform public.award_badge(v_author, 'reputation-100'); end if;
      if v_new_rep >= v_r_rep then perform public.award_badge(v_author, 'reputation-500'); end if;
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
  v_author    uuid;
  v_total     int;
  v_new_rep   int;
  v_rep_gain  int := public.get_forum_setting('rep_post_upvote', 1);
  v_liked     int := public.get_forum_setting('badge_liked_upvotes', 10);
  v_helpful   int := public.get_forum_setting('badge_helpful_upvotes', 50);
  v_authority int := public.get_forum_setting('badge_authority_upvotes', 250);
  v_t_rep     int := public.get_forum_setting('badge_trusted_rep', 100);
  v_r_rep     int := public.get_forum_setting('badge_respected_rep', 500);
begin
  if (tg_op = 'INSERT') then
    update public.forum_posts set upvote_count = upvote_count + 1
     where id = new.post_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + v_rep_gain
       where id = v_author
       returning reputation into v_new_rep;
      select coalesce(sum(upvote_count),0) into v_total
        from public.forum_posts where author_id = v_author;
      if v_total >= v_liked     then perform public.award_badge(v_author, 'liked');     end if;
      if v_total >= v_helpful   then perform public.award_badge(v_author, 'helpful');   end if;
      if v_total >= v_authority then perform public.award_badge(v_author, 'authority'); end if;
      if v_new_rep >= v_t_rep   then perform public.award_badge(v_author, 'reputation-100'); end if;
      if v_new_rep >= v_r_rep   then perform public.award_badge(v_author, 'reputation-500'); end if;
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

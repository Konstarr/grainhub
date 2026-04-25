-- ============================================================
-- migration-forum-rep-and-self-vote.sql
--
-- 1) Slow down reputation gains. Old values were too generous —
--    a handful of upvotes filled the rep bar quickly. Halve them:
--      thread upvote:  +5  →  +2
--      thread unvote:  -5  →  -2
--      post upvote:    +2  →  +1
--      post unvote:    -2  →  -1
--    Badge thresholds (100 / 500) stay the same so reaching
--    Trusted / Respected just takes more activity.
--
-- 2) Block self-upvotes. Authors shouldn't be able to upvote
--    their own posts/threads. Frontend disables the button, the
--    BEFORE INSERT triggers here are belt-and-suspenders.
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- ── 1) Reputation increments ─────────────────────────────────

create or replace function public.on_thread_upvote()
returns trigger language plpgsql as $$
declare
  v_author uuid;
  v_new_rep int;
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads set upvote_count = upvote_count + 1
     where id = new.thread_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + 2
       where id = v_author
       returning reputation into v_new_rep;
      if v_new_rep >= 100 then perform public.award_badge(v_author, 'reputation-100'); end if;
      if v_new_rep >= 500 then perform public.award_badge(v_author, 'reputation-500'); end if;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.forum_threads set upvote_count = greatest(upvote_count - 1, 0)
     where id = old.thread_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = greatest(reputation - 2, 0)
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
  v_author  uuid;
  v_total   int;
  v_new_rep int;
begin
  if (tg_op = 'INSERT') then
    update public.forum_posts set upvote_count = upvote_count + 1
     where id = new.post_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = reputation + 1
       where id = v_author
       returning reputation into v_new_rep;
      select coalesce(sum(upvote_count),0) into v_total
        from public.forum_posts where author_id = v_author;
      if v_total >= 10  then perform public.award_badge(v_author, 'liked');     end if;
      if v_total >= 50  then perform public.award_badge(v_author, 'helpful');   end if;
      if v_total >= 250 then perform public.award_badge(v_author, 'authority'); end if;
      if v_new_rep >= 100 then perform public.award_badge(v_author, 'reputation-100'); end if;
      if v_new_rep >= 500 then perform public.award_badge(v_author, 'reputation-500'); end if;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.forum_posts set upvote_count = greatest(upvote_count - 1, 0)
     where id = old.post_id
     returning author_id into v_author;
    if v_author is not null then
      update public.profiles set reputation = greatest(reputation - 1, 0)
       where id = v_author;
    end if;
    return old;
  end if;
  return null;
end;
$$;

-- ── 2) No self-upvotes ───────────────────────────────────────

create or replace function public.enforce_no_self_thread_upvote()
returns trigger language plpgsql as $$
declare
  v_author uuid;
begin
  select author_id into v_author
    from public.forum_threads
   where id = new.thread_id;
  if v_author is not null and v_author = new.profile_id then
    raise exception 'self_upvote_not_allowed: you cannot upvote your own thread'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists no_self_thread_upvote_trg on public.thread_upvotes;
create trigger no_self_thread_upvote_trg
  before insert on public.thread_upvotes
  for each row execute function public.enforce_no_self_thread_upvote();

create or replace function public.enforce_no_self_post_upvote()
returns trigger language plpgsql as $$
declare
  v_author uuid;
begin
  select author_id into v_author
    from public.forum_posts
   where id = new.post_id;
  if v_author is not null and v_author = new.profile_id then
    raise exception 'self_upvote_not_allowed: you cannot upvote your own post'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists no_self_post_upvote_trg on public.post_upvotes;
create trigger no_self_post_upvote_trg
  before insert on public.post_upvotes
  for each row execute function public.enforce_no_self_post_upvote();

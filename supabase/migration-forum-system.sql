-- ============================================================
-- GrainHub Forum System Migration
-- Adds: upvotes, reports, reputation, badges, quote references
-- Run this AFTER schema.sql (it references existing tables).
-- Safe to run multiple times (all statements are idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profile additions (reputation, activity counters)
-- ------------------------------------------------------------
alter table public.profiles add column if not exists reputation    int not null default 0;
alter table public.profiles add column if not exists post_count    int not null default 0;
alter table public.profiles add column if not exists thread_count  int not null default 0;
alter table public.profiles add column if not exists joined_at     timestamptz not null default now();

-- ------------------------------------------------------------
-- 2. Thread and post scoring + quote reference
-- ------------------------------------------------------------
alter table public.forum_threads add column if not exists upvote_count  int not null default 0;
alter table public.forum_posts   add column if not exists upvote_count  int not null default 0;
alter table public.forum_posts   add column if not exists quoted_post_id uuid references public.forum_posts(id) on delete set null;

-- ------------------------------------------------------------
-- 3. Upvote tables
-- ------------------------------------------------------------
create table if not exists public.thread_upvotes (
  thread_id  uuid not null references public.forum_threads(id) on delete cascade,
  voter_id   uuid not null references public.profiles(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, voter_id)
);
create index if not exists thread_upvotes_voter_idx on public.thread_upvotes(voter_id);

create table if not exists public.post_upvotes (
  post_id    uuid not null references public.forum_posts(id) on delete cascade,
  voter_id   uuid not null references public.profiles(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, voter_id)
);
create index if not exists post_upvotes_voter_idx on public.post_upvotes(voter_id);

-- ------------------------------------------------------------
-- 4. Reports (threads, posts, profiles)
-- ------------------------------------------------------------
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid references public.profiles(id) on delete set null,
  target_type   text not null check (target_type in ('thread','post','profile')),
  target_id     text not null,
  reason        text not null,
  details       text,
  status        text not null default 'open'
                check (status in ('open','reviewing','resolved','dismissed')),
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid references public.profiles(id)
);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists reports_target_idx on public.reports(target_type, target_id);

-- ------------------------------------------------------------
-- 5. Badges and earned badges
-- ------------------------------------------------------------
create table if not exists public.badges (
  id          text primary key,
  name        text not null,
  description text,
  icon        text,
  tier        text not null default 'bronze'
              check (tier in ('bronze','silver','gold')),
  display_order int not null default 0
);

create table if not exists public.profile_badges (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id   text not null references public.badges(id)   on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);
create index if not exists profile_badges_awarded_idx on public.profile_badges(awarded_at desc);

-- ------------------------------------------------------------
-- 6. Seed initial badge set
-- ------------------------------------------------------------
insert into public.badges (id, name, description, icon, tier, display_order) values
  ('first-post',      'First Post',       'Posted your first reply in any thread.',            '⭐', 'bronze', 1),
  ('first-thread',    'Conversation Starter', 'Started your first thread.',                     '🔥', 'bronze', 2),
  ('liked',           'Liked',            'Received 10 total upvotes across your contributions.', '👍', 'bronze', 3),
  ('helpful',         'Helpful',          'Received 50 total upvotes.',                           '🔧', 'silver', 4),
  ('authority',       'Trade Authority',  'Received 250 total upvotes.',                          '🏛️', 'gold',   5),
  ('prolific',        'Prolific Poster',  'Posted 50 replies.',                                   '📚', 'silver', 6),
  ('pillar',          'Community Pillar', 'Posted 250 replies.',                                  '🏠', 'gold',   7),
  ('accepted-answer', 'Solver',           'One of your replies was marked as the solved answer.', '✅', 'silver', 8),
  ('reputation-100',  'Trusted',          'Reached 100 reputation.',                              '🛡️', 'silver', 9),
  ('reputation-500',  'Respected',        'Reached 500 reputation.',                              '🏅', 'gold',  10)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  tier = excluded.tier,
  display_order = excluded.display_order;

-- ------------------------------------------------------------
-- 7. Triggers: keep counts + reputation in sync
-- ------------------------------------------------------------

-- Award badge helper
create or replace function public.award_badge(p_profile uuid, p_badge text)
returns void language plpgsql as $$
begin
  insert into public.profile_badges (profile_id, badge_id)
  values (p_profile, p_badge)
  on conflict do nothing;
end;
$$;

-- Thread upvote -> bump thread count + author rep (+5)
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
      update public.profiles set reputation = reputation + 5
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
      update public.profiles set reputation = greatest(reputation - 5, 0)
       where id = v_author;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists thread_upvote_trg on public.thread_upvotes;
create trigger thread_upvote_trg
  after insert or delete on public.thread_upvotes
  for each row execute function public.on_thread_upvote();

-- Post upvote -> bump post count + author rep (+2) + badge checks
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
      update public.profiles set reputation = reputation + 2
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
      update public.profiles set reputation = greatest(reputation - 2, 0)
       where id = v_author;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_upvote_trg on public.post_upvotes;
create trigger post_upvote_trg
  after insert or delete on public.post_upvotes
  for each row execute function public.on_post_upvote();

-- Thread created -> thread_count++ + first-thread badge
create or replace function public.on_thread_insert()
returns trigger language plpgsql as $$
declare
  v_count int;
begin
  if new.author_id is not null then
    update public.profiles set thread_count = thread_count + 1
     where id = new.author_id
     returning thread_count into v_count;
    if v_count = 1 then perform public.award_badge(new.author_id, 'first-thread'); end if;
  end if;
  return new;
end;
$$;

drop trigger if exists thread_insert_trg on public.forum_threads;
create trigger thread_insert_trg
  after insert on public.forum_threads
  for each row execute function public.on_thread_insert();

-- Post created -> post_count++ + first-post + prolific/pillar badges
create or replace function public.on_post_insert()
returns trigger language plpgsql as $$
declare
  v_count int;
begin
  if new.author_id is not null then
    update public.profiles set post_count = post_count + 1
     where id = new.author_id
     returning post_count into v_count;
    if v_count = 1   then perform public.award_badge(new.author_id, 'first-post'); end if;
    if v_count = 50  then perform public.award_badge(new.author_id, 'prolific');   end if;
    if v_count = 250 then perform public.award_badge(new.author_id, 'pillar');     end if;
  end if;
  return new;
end;
$$;

drop trigger if exists post_insert_trg on public.forum_posts;
create trigger post_insert_trg
  after insert on public.forum_posts
  for each row execute function public.on_post_insert();

-- Thread solved -> award 'accepted-answer' badge to OP author of solving post
-- (triggered when forum_threads.is_solved flips to true; relies on an accepted_post_id column)
alter table public.forum_threads add column if not exists accepted_post_id uuid
  references public.forum_posts(id) on delete set null;

create or replace function public.on_thread_solved()
returns trigger language plpgsql as $$
declare
  v_solver uuid;
begin
  if new.is_solved = true and (old.is_solved is distinct from true) and new.accepted_post_id is not null then
    select author_id into v_solver from public.forum_posts where id = new.accepted_post_id;
    if v_solver is not null then
      perform public.award_badge(v_solver, 'accepted-answer');
      update public.profiles set reputation = reputation + 15 where id = v_solver;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists thread_solved_trg on public.forum_threads;
create trigger thread_solved_trg
  after update on public.forum_threads
  for each row execute function public.on_thread_solved();

-- ------------------------------------------------------------
-- 8. Row Level Security
-- ------------------------------------------------------------
alter table public.thread_upvotes  enable row level security;
alter table public.post_upvotes    enable row level security;
alter table public.reports         enable row level security;
alter table public.badges          enable row level security;
alter table public.profile_badges  enable row level security;

-- thread_upvotes: anyone reads, auth users can insert/delete their own
drop policy if exists thread_upvotes_select on public.thread_upvotes;
create policy thread_upvotes_select on public.thread_upvotes for select using (true);
drop policy if exists thread_upvotes_insert on public.thread_upvotes;
create policy thread_upvotes_insert on public.thread_upvotes
  for insert with check (auth.uid() = voter_id);
drop policy if exists thread_upvotes_delete on public.thread_upvotes;
create policy thread_upvotes_delete on public.thread_upvotes
  for delete using (auth.uid() = voter_id);

-- post_upvotes: same shape
drop policy if exists post_upvotes_select on public.post_upvotes;
create policy post_upvotes_select on public.post_upvotes for select using (true);
drop policy if exists post_upvotes_insert on public.post_upvotes;
create policy post_upvotes_insert on public.post_upvotes
  for insert with check (auth.uid() = voter_id);
drop policy if exists post_upvotes_delete on public.post_upvotes;
create policy post_upvotes_delete on public.post_upvotes
  for delete using (auth.uid() = voter_id);

-- reports: reporter can read own, staff can read all; auth users can create
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select using (
    auth.uid() = reporter_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
  );
drop policy if exists reports_insert_auth on public.reports;
create policy reports_insert_auth on public.reports
  for insert with check (auth.uid() = reporter_id);
drop policy if exists reports_update_staff on public.reports;
create policy reports_update_staff on public.reports
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin')));

-- badges: public read, admin write
drop policy if exists badges_select on public.badges;
create policy badges_select on public.badges for select using (true);
drop policy if exists badges_admin_write on public.badges;
create policy badges_admin_write on public.badges
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- profile_badges: public read (so profiles show them), system-awarded only
drop policy if exists profile_badges_select on public.profile_badges;
create policy profile_badges_select on public.profile_badges for select using (true);
-- inserts happen via security-definer trigger functions; no direct insert policy needed

-- forum_posts: allow insert by author, update by author (for edits), delete by author/mod
drop policy if exists forum_posts_select on public.forum_posts;
create policy forum_posts_select on public.forum_posts for select using (true);
drop policy if exists forum_posts_insert_auth on public.forum_posts;
create policy forum_posts_insert_auth on public.forum_posts
  for insert with check (auth.uid() = author_id);
drop policy if exists forum_posts_update_own on public.forum_posts;
create policy forum_posts_update_own on public.forum_posts
  for update using (auth.uid() = author_id);
drop policy if exists forum_posts_delete_own on public.forum_posts;
create policy forum_posts_delete_own on public.forum_posts
  for delete using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('moderator','admin'))
  );

-- ------------------------------------------------------------
-- 9. Convenience view: profile_summary (for cheap joins from UI)
-- ------------------------------------------------------------
create or replace view public.profile_summary as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.trade,
  p.location,
  p.role,
  p.reputation,
  p.post_count,
  p.thread_count,
  p.joined_at,
  (select count(*) from public.profile_badges pb where pb.profile_id = p.id) as badge_count
from public.profiles p;

-- ------------------------------------------------------------
-- 10. Thread subscriptions (powers "My Subscriptions" filter)
-- ------------------------------------------------------------
create table if not exists public.thread_subscriptions (
  thread_id  uuid not null references public.forum_threads(id) on delete cascade,
  user_id    uuid not null references public.profiles(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);
create index if not exists thread_subscriptions_user_idx on public.thread_subscriptions(user_id, created_at desc);

alter table public.thread_subscriptions enable row level security;

drop policy if exists thread_subs_select_own on public.thread_subscriptions;
create policy thread_subs_select_own on public.thread_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists thread_subs_insert_own on public.thread_subscriptions;
create policy thread_subs_insert_own on public.thread_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists thread_subs_delete_own on public.thread_subscriptions;
create policy thread_subs_delete_own on public.thread_subscriptions
  for delete using (auth.uid() = user_id);

-- ============================================================
-- DONE. Existing rows: backfill counters (one-time) if needed:
--   update public.profiles p set post_count = (select count(*) from public.forum_posts where author_id = p.id),
--                                 thread_count = (select count(*) from public.forum_threads where author_id = p.id);
-- ============================================================

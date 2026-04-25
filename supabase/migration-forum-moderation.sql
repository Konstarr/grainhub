-- ============================================================
-- migration-forum-moderation.sql
--
-- Two pieces of moderation infrastructure:
--
--   1. blocked_words   — admin-managed list of words/phrases
--                        rejected on thread + post insert.
--   2. Rate-limit triggers — cap how often a single author can
--                            create new threads / new posts.
--
-- Defaults (override by editing the rate-limit triggers):
--   • Max 2 threads / hour per author
--   • Max 30 posts / hour per author
--   • Staff (moderator / admin / owner) bypass both
--
-- Idempotent. Safe to re-run.
-- ============================================================

-- ── 1) blocked_words table ──────────────────────────────
create table if not exists public.blocked_words (
  id         uuid primary key default gen_random_uuid(),
  word       text not null unique,
  added_by   uuid references public.profiles(id) on delete set null,
  added_at   timestamptz not null default now(),
  -- 'profanity' | 'slur' | 'minor' (sexualized minor terms)
  severity   text not null default 'profanity'
             check (severity in ('profanity', 'slur', 'minor'))
);

alter table public.blocked_words enable row level security;

-- SELECT: admins/owners only — keeps the slur list out of the public
-- network surface. Non-admins get the rejection via trigger error.
drop policy if exists blocked_words_select_admin on public.blocked_words;
create policy blocked_words_select_admin on public.blocked_words
  for select using (public.is_admin());

drop policy if exists blocked_words_modify_admin on public.blocked_words;
create policy blocked_words_modify_admin on public.blocked_words
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 2) Word-filter helper + triggers ────────────────────

-- Normalize text the way the client-side filter does: lowercase,
-- strip non-letters, apply leetspeak substitutions. Used by the
-- check_text_for_blocked_words function.
create or replace function public.normalize_for_filter(input text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  if input is null then return ''; end if;
  s := lower(input);
  -- Strip non-letter / non-digit characters (covers spaces,
  -- punctuation, emoji, etc.). The filter relies on substring
  -- match in the normalized string.
  s := regexp_replace(s, '[^a-z0-9]+', '', 'g');
  -- Common leetspeak: digits → letters
  s := translate(s, '01345789', 'oieasbg');
  -- Strip remaining digits
  s := regexp_replace(s, '[0-9]+', '', 'g');
  return s;
end $$;

-- Returns the matched blocked word, or null if clean.
create or replace function public.check_text_for_blocked_words(input text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := public.normalize_for_filter(input);
  hit text;
begin
  if normalized = '' then return null; end if;
  select word into hit
    from public.blocked_words
   where strpos(normalized, public.normalize_for_filter(word)) > 0
   limit 1;
  return hit;
end $$;

revoke all on function public.check_text_for_blocked_words(text) from public;
grant execute on function public.check_text_for_blocked_words(text) to authenticated;

-- Trigger: reject thread inserts whose title or body contains a
-- blocked word. Staff bypass for moderation use cases.
create or replace function public.enforce_thread_word_filter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  hit text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;

  -- Title check
  hit := public.check_text_for_blocked_words(new.title);
  if hit is not null then
    raise exception 'blocked_language: thread title contains language we don''t allow.'
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists thread_word_filter_trg on public.forum_threads;
create trigger thread_word_filter_trg
  before insert on public.forum_threads
  for each row execute function public.enforce_thread_word_filter();

-- Trigger: reject post inserts whose body contains a blocked word.
create or replace function public.enforce_post_word_filter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  hit text;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;

  hit := public.check_text_for_blocked_words(new.body);
  if hit is not null then
    raise exception 'blocked_language: post contains language we don''t allow.'
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists post_word_filter_trg on public.forum_posts;
create trigger post_word_filter_trg
  before insert on public.forum_posts
  for each row execute function public.enforce_post_word_filter();

-- ── 3) Rate limit triggers ──────────────────────────────

-- Threads: max 2 per author per hour. Edit the constant to change.
create or replace function public.enforce_thread_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  caller_role  text;
  max_per_hour constant int := 2;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;

  select count(*) into recent_count
    from public.forum_threads
   where author_id = new.author_id
     and created_at > now() - interval '1 hour';

  if recent_count >= max_per_hour then
    raise exception 'rate_limited_threads: you can create at most % threads per hour. Please wait before posting another.', max_per_hour
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists thread_rate_limit_trg on public.forum_threads;
create trigger thread_rate_limit_trg
  before insert on public.forum_threads
  for each row execute function public.enforce_thread_rate_limit();

-- Posts: max 30 per author per hour. Stops post-spam without
-- breaking normal conversation pace.
create or replace function public.enforce_post_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  caller_role  text;
  max_per_hour constant int := 30;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role in ('moderator', 'admin', 'owner') then
    return new;
  end if;

  select count(*) into recent_count
    from public.forum_posts
   where author_id = new.author_id
     and created_at > now() - interval '1 hour';

  if recent_count >= max_per_hour then
    raise exception 'rate_limited_posts: you can post at most % replies per hour. Please slow down.', max_per_hour
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists post_rate_limit_trg on public.forum_posts;
create trigger post_rate_limit_trg
  before insert on public.forum_posts
  for each row execute function public.enforce_post_rate_limit();

-- ── 4) Seed the blocked_words list ──────────────────────
-- Common profanity. Slurs / zero-tolerance terms are added below.
-- Idempotent via on conflict do nothing (word column is unique).
insert into public.blocked_words (word, severity) values
  ('bitch',       'profanity'),
  ('bitches',     'profanity'),
  ('fuck',        'profanity'),
  ('fucking',     'profanity'),
  ('fucker',      'profanity'),
  ('motherfucker','profanity'),
  ('shit',        'profanity'),
  ('bullshit',    'profanity'),
  ('asshole',     'profanity'),
  ('dickhead',    'profanity'),
  ('douchebag',   'profanity'),
  ('pussy',       'profanity'),
  ('whore',       'profanity'),
  ('slut',        'profanity'),
  ('sluts',       'profanity'),
  ('bastard',     'profanity'),
  ('piss',        'profanity'),
  ('pissed',      'profanity'),
  -- Slurs (no need to enumerate; admin can add via UI). Seeded
  -- here so the initial deploy has the most common targeted ones.
  ('nigger',  'slur'),
  ('nigga',   'slur'),
  ('faggot',  'slur'),
  ('cunt',    'slur'),
  ('tranny',  'slur'),
  ('retard',  'slur'),
  ('chink',   'slur'),
  ('spic',    'slur'),
  ('kike',    'slur'),
  -- Zero tolerance: sexualized minors
  ('loli',  'minor'),
  ('shota', 'minor'),
  ('cp',    'minor')
on conflict (word) do nothing;

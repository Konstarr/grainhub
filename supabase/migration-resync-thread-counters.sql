-- ============================================================
-- migration-resync-thread-counters.sql
--
-- The seed files set hard-coded reply_count values (47, 62, 127, …)
-- for demo threads. Those never reflected reality — real forum_posts
-- only has a handful of rows per thread. This migration resyncs
-- reply_count, last_reply_at, and last_reply_by to match the actual
-- forum_posts table so the UI shows truthful numbers.
--
-- Safe to run repeatedly.
-- ============================================================

-- 1. Recompute reply_count from the actual post count per thread.
--    (Our schema counts every post including the opening one —
--    that's what the bump_thread_on_post trigger does on INSERT.)
update public.forum_threads t
   set reply_count = coalesce(counts.n, 0)
  from (
    select thread_id, count(*)::int as n
      from public.forum_posts
     group by thread_id
  ) counts
 where counts.thread_id = t.id;

-- Threads with zero matching posts need to be zeroed too.
update public.forum_threads t
   set reply_count = 0
 where not exists (
   select 1 from public.forum_posts p where p.thread_id = t.id
 );

-- 2. Resync last_reply_at + last_reply_by from the most recent post.
update public.forum_threads t
   set last_reply_at = latest.created_at,
       last_reply_by = latest.author_id
  from (
    select distinct on (thread_id)
           thread_id, created_at, author_id
      from public.forum_posts
     order by thread_id, created_at desc
  ) latest
 where latest.thread_id = t.id;

-- Threads with no posts: keep last_reply_at at the thread's own
-- created_at so ordering still works; clear last_reply_by.
update public.forum_threads t
   set last_reply_at = coalesce(t.last_reply_at, t.created_at),
       last_reply_by = null
 where not exists (
   select 1 from public.forum_posts p where p.thread_id = t.id
 );

-- ============================================================
-- Verification query — run this to inspect results:
--   select t.title, t.reply_count,
--          (select count(*) from public.forum_posts p where p.thread_id = t.id) as actual_posts,
--          t.last_reply_at
--     from public.forum_threads t
--    order by t.last_reply_at desc
--    limit 20;
-- Both columns should match.
-- ============================================================

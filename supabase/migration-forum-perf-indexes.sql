-- ============================================================
-- migration-forum-perf-indexes.sql
-- Adds covering indexes that the forum + sidebar counter queries
-- repeatedly hit:
--   - forum_threads.category_id (category list page, "X new" counters)
--   - forum_threads.topic_id    (topic detail page, sidebar topic counts)
--   - forum_posts.thread_id     (thread page, last-post resolution)
--   - forum_posts.author_id     (profile activity panel, post counts)
-- All idempotent.
-- ============================================================

create index if not exists idx_forum_threads_category_id
  on public.forum_threads (category_id);

create index if not exists idx_forum_threads_topic_id
  on public.forum_threads (topic_id);

-- Composite for the "newest threads in category" pattern that the
-- category page + sidebar both run.
create index if not exists idx_forum_threads_category_created
  on public.forum_threads (category_id, created_at desc);

create index if not exists idx_forum_posts_thread_id
  on public.forum_posts (thread_id);

create index if not exists idx_forum_posts_author_id
  on public.forum_posts (author_id);

-- last_reply_at is the trending sort key; ordering it server-side
-- without an index forces a full sort on every Forums page load.
create index if not exists idx_forum_threads_last_reply_at
  on public.forum_threads (last_reply_at desc nulls last);

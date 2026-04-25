-- ============================================================
-- migration-forum-lock-enforcement.sql
--
-- When forum_threads.is_locked = true, no further posts may be
-- inserted on that thread. The existing RLS check on forum_posts
-- only verifies authorship, not the parent thread's lock state.
-- This trigger closes that gap.
--
-- Staff (moderator / admin / owner) BYPASS the lock so they can
-- post a "Closed by mods" message or otherwise reply for
-- moderation purposes after a thread is locked.
-- ============================================================

create or replace function public.enforce_thread_lock_on_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  thread_locked boolean;
  caller_role text;
begin
  -- Look up the parent thread's lock state.
  select is_locked into thread_locked
    from public.forum_threads
   where id = NEW.thread_id;

  if thread_locked is null then
    raise exception 'thread_not_found: parent thread does not exist'
      using errcode = 'P0001';
  end if;

  if thread_locked then
    -- Staff bypass — let mods reply on locked threads.
    select role into caller_role
      from public.profiles
     where id = auth.uid();

    if caller_role not in ('moderator', 'admin', 'owner') then
      raise exception 'thread_locked: this thread is locked. New replies are disabled.'
        using errcode = 'P0001';
    end if;
  end if;

  return NEW;
end $$;

drop trigger if exists enforce_thread_lock_on_post_trg on public.forum_posts;
create trigger enforce_thread_lock_on_post_trg
  before insert on public.forum_posts
  for each row execute function public.enforce_thread_lock_on_post();

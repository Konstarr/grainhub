-- ============================================================
-- migration-forum-post-delete.sql
--
-- Soft-delete a forum post from the public thread view. Allowed
-- for either:
--   • the post's own author (their own writing — like X's "delete
--     tweet"), or
--   • any staff member (moderator / admin / owner)
--
-- The original RLS on forum_posts only allowed UPDATE by the
-- author, so the existing softDeletePost() helper failed silently
-- for staff acting on other people's posts. This RPC runs with
-- SECURITY DEFINER and gates the action explicitly inside the
-- function, so we don't have to keep the RLS policy in lock-step
-- with the moderation rules.
--
-- The body is preserved (is_deleted = true). fetchThreadPosts
-- already filters is_deleted = false, so the post drops out of
-- public render immediately. Staff can restore via the existing
-- restorePost() helper on the admin side if needed.
--
-- Idempotent. Safe to re-run.
-- ============================================================

create or replace function public.delete_forum_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_uid    uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select author_id into v_author from public.forum_posts where id = p_post_id;
  if v_author is null then
    raise exception 'Post not found' using errcode = 'P0002';
  end if;

  -- Allowed if you're the author, or you're staff.
  if v_author <> v_uid and not public.is_staff() then
    raise exception 'Not authorized to delete this post' using errcode = '42501';
  end if;

  update public.forum_posts
     set is_deleted = true
   where id = p_post_id;
end $$;

create or replace function public.restore_forum_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.forum_posts set is_deleted = false where id = p_post_id;
end $$;

revoke all on function public.delete_forum_post(uuid)  from public;
revoke all on function public.restore_forum_post(uuid) from public;
grant execute on function public.delete_forum_post(uuid)  to authenticated;
grant execute on function public.restore_forum_post(uuid) to authenticated;

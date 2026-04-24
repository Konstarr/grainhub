/**
 * Forum DB helpers: posts, upvotes, replies/quotes, reports, profile lookups.
 *
 * Every mutation returns { data, error } in the same shape so the UI can
 * handle failures uniformly.
 */
import { supabase } from './supabase.js';

// ------------------------------------------------------------
// THREADS
// ------------------------------------------------------------

/** Fetch a single thread by slug, with author profile joined. */
export async function fetchThreadBySlug(slug) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*, author:profiles(id, username, full_name, avatar_url, reputation, trade)')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/** Increment view count (best-effort; ignore errors). */
export async function incrementThreadViews(threadId) {
  if (!threadId) return;
  await supabase.rpc('noop', {}).catch(() => null);
  // Do a simple update; no optimistic locking needed for a counter.
  const { data: cur } = await supabase
    .from('forum_threads')
    .select('view_count')
    .eq('id', threadId)
    .maybeSingle();
  if (cur) {
    await supabase
      .from('forum_threads')
      .update({ view_count: (cur.view_count || 0) + 1 })
      .eq('id', threadId);
  }
}

// ------------------------------------------------------------
// POSTS (replies within a thread)
// ------------------------------------------------------------

/** Fetch all posts in a thread, oldest first, with author. */
export async function fetchThreadPosts(threadId) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, author:profiles(id, username, full_name, avatar_url, reputation, trade)')
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

/** Create a reply in a thread. quotedPostId is optional. */
export async function createPost({ threadId, authorId, body, quotedPostId = null }) {
  if (!threadId || !authorId || !body) {
    return { data: null, error: new Error('Missing threadId, authorId, or body') };
  }
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: threadId,
      author_id: authorId,
      body,
      quoted_post_id: quotedPostId,
    })
    .select('*, author:profiles(id, username, full_name, avatar_url, reputation, trade)')
    .maybeSingle();
  return { data, error };
}

/** Edit a post (author only; RLS enforces). */
export async function updatePost(postId, body) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ body })
    .eq('id', postId)
    .select()
    .maybeSingle();
  return { data, error };
}

/** Soft delete a post. */
export async function deletePost(postId) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true })
    .eq('id', postId);
  return { data, error };
}

// ------------------------------------------------------------
// UPVOTES
// ------------------------------------------------------------

/** Has the given user upvoted this thread? Returns boolean. */
export async function hasUpvotedThread(threadId, userId) {
  if (!threadId || !userId) return false;
  const { data } = await supabase
    .from('thread_upvotes')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('voter_id', userId)
    .maybeSingle();
  return Boolean(data);
}

/** Fetch the set of post IDs this user has upvoted within the given list. */
export async function fetchUserPostUpvotes(postIds, userId) {
  if (!userId || !postIds || postIds.length === 0) return new Set();
  const { data } = await supabase
    .from('post_upvotes')
    .select('post_id')
    .eq('voter_id', userId)
    .in('post_id', postIds);
  return new Set((data || []).map((r) => r.post_id));
}

/** Toggle a thread upvote. Returns new state { upvoted: boolean }. */
export async function toggleThreadUpvote(threadId, userId) {
  if (!threadId || !userId) return { upvoted: false, error: new Error('Not signed in') };
  const existing = await hasUpvotedThread(threadId, userId);
  if (existing) {
    const { error } = await supabase
      .from('thread_upvotes')
      .delete()
      .eq('thread_id', threadId)
      .eq('voter_id', userId);
    return { upvoted: false, error };
  }
  const { error } = await supabase
    .from('thread_upvotes')
    .insert({ thread_id: threadId, voter_id: userId });
  return { upvoted: true, error };
}

/** Toggle a post upvote. */
export async function togglePostUpvote(postId, userId) {
  if (!postId || !userId) return { upvoted: false, error: new Error('Not signed in') };
  const { data: existing } = await supabase
    .from('post_upvotes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('voter_id', userId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('post_upvotes')
      .delete()
      .eq('post_id', postId)
      .eq('voter_id', userId);
    return { upvoted: false, error };
  }
  const { error } = await supabase
    .from('post_upvotes')
    .insert({ post_id: postId, voter_id: userId });
  return { upvoted: true, error };
}

// ------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------

export async function submitReport({ reporterId, targetType, targetId, reason, details }) {
  if (!reporterId) return { data: null, error: new Error('Must be signed in to report') };
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: String(targetId),
      reason,
      details: details || null,
    });
  return { data, error };
}

// ------------------------------------------------------------
// PROFILES
// ------------------------------------------------------------

export async function fetchProfileByHandle(handle) {
  if (!handle) return { data: null, error: new Error('No handle') };
  const { data, error } = await supabase
    .from('profile_summary')
    .select('*')
    .eq('username', handle)
    .maybeSingle();
  return { data, error };
}

export async function fetchProfileById(id) {
  if (!id) return { data: null, error: new Error('No id') };
  const { data, error } = await supabase
    .from('profile_summary')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

export async function fetchProfileBadges(profileId) {
  if (!profileId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('profile_badges')
    .select('awarded_at, badge:badges(id, name, description, icon, tier, display_order)')
    .eq('profile_id', profileId)
    .order('awarded_at', { ascending: false });
  return { data: data || [], error };
}

export async function fetchRecentThreadsByAuthor(authorId, limit = 10) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('id, slug, title, upvote_count, reply_count, view_count, last_reply_at')
    .eq('author_id', authorId)
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function updateOwnProfile(userId, patch) {
  if (!userId) return { data: null, error: new Error('Not signed in') };
  const clean = { ...patch };
  // Only allow these fields to be updated from the UI
  const allowed = ['username', 'full_name', 'bio', 'avatar_url', 'trade', 'location', 'website'];
  Object.keys(clean).forEach((k) => { if (!allowed.includes(k)) delete clean[k]; });
  const { data, error } = await supabase
    .from('profiles')
    .update(clean)
    .eq('id', userId)
    .select()
    .maybeSingle();
  return { data, error };
}

// ------------------------------------------------------------
// LEADERBOARD
// ------------------------------------------------------------

export async function fetchTopReputation(limit = 10) {
  const { data, error } = await supabase
    .from('profile_summary')
    .select('id, username, full_name, avatar_url, reputation, trade, badge_count')
    .order('reputation', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

/**
 * Forum DB helpers: posts, upvotes, replies/quotes, reports, profile lookups,
 * subscriptions, and live counters.
 *
 * Every mutation returns { data, error } in the same shape so the UI can
 * handle failures uniformly.
 */
import { supabase } from './supabase.js';

// Columns guaranteed to exist in the base schema (pre-migration safe).
// Reputation is enriched via fetchReputations() after the main fetch.
const AUTHOR_COLS_SAFE = 'id, username, full_name, avatar_url, trade, location, reputation, post_count, joined_at, created_at, is_verified';

async function fetchReputations(profileIds) {
  const ids = Array.from(new Set(profileIds.filter(Boolean)));
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, reputation')
    .in('id', ids);
  if (error || !data) return new Map();
  const map = new Map();
  data.forEach((r) => { map.set(r.id, r.reputation || 0); });
  return map;
}

// ------------------------------------------------------------
// THREADS
// ------------------------------------------------------------

export async function fetchThreadBySlug(slug) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`*, author:author_id(${AUTHOR_COLS_SAFE})`)
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return { data, error };
  if (data.author?.id) {
    const reps = await fetchReputations([data.author.id]);
    data.author.reputation = reps.get(data.author.id) || 0;
  }
  return { data, error: null };
}

/**
 * Turn a title into a slug; append a 6-char random suffix so collisions are
 * astronomically unlikely (the DB still enforces uniqueness).
 */
function slugify(title) {
  const base = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'thread';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Create a new thread + its opening post. Both inserts are done in sequence
 * because Supabase JS doesn't support multi-table transactions from the
 * client. The body insert is tried up to twice on slug collision.
 */
export async function createThread({ authorId, categoryId, title, body }) {
  if (!authorId || !categoryId || !title || !body) {
    return { data: null, error: new Error('Missing required fields') };
  }
  let threadRow = null;
  let threadErr = null;
  for (let i = 0; i < 3; i += 1) {
    const slug = slugify(title);
    const { data, error } = await supabase
      .from('forum_threads')
      .insert({
        category_id: categoryId,
        author_id: authorId,
        title: title.trim(),
        slug,
        last_reply_at: new Date().toISOString(),
        last_reply_by: authorId,
      })
      .select('*')
      .maybeSingle();
    if (!error && data) { threadRow = data; threadErr = null; break; }
    threadErr = error;
    // Retry only on unique-violation (slug collision); otherwise bail
    if (!error || (error.code !== '23505' && !/slug/i.test(error.message || ''))) break;
  }
  if (!threadRow) return { data: null, error: threadErr };

  const { data: post, error: postErr } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: threadRow.id,
      author_id: authorId,
      body: body.trim(),
    })
    .select('*')
    .maybeSingle();

  if (postErr) {
    // Clean up the orphaned thread so a retry doesn't leave a dupe
    await supabase.from('forum_threads').delete().eq('id', threadRow.id);
    return { data: null, error: postErr };
  }
  return { data: { thread: threadRow, post }, error: null };
}

export async function incrementThreadViews(threadId) {
  if (!threadId) return;
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
// POSTS
// ------------------------------------------------------------

export async function fetchThreadPosts(threadId) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`*, author:author_id(${AUTHOR_COLS_SAFE})`)
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });
  if (error || !data) return { data: [], error };
  const reps = await fetchReputations(data.map((p) => p.author?.id).filter(Boolean));
  data.forEach((p) => { if (p.author) p.author.reputation = reps.get(p.author.id) || 0; });
  return { data, error: null };
}

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
    .select(`*, author:author_id(${AUTHOR_COLS_SAFE})`)
    .maybeSingle();
  if (!error && data?.author?.id) {
    const reps = await fetchReputations([data.author.id]);
    data.author.reputation = reps.get(data.author.id) || 0;
  }
  return { data, error };
}

/**
 * Edit your own forum post body. The forum_posts_update_own RLS
 * policy allows author-only writes; the forum_posts_touch trigger
 * bumps updated_at automatically so we don't need to set it here.
 * Returns the updated row (with new updated_at) so the UI can
 * render the "Edited" footer immediately.
 */
export async function updatePost(postId, body) {
  if (!postId) return { data: null, error: new Error('Missing post id') };
  if (!body || !body.trim()) return { data: null, error: new Error('Body required') };
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ body: body.trim() })
    .eq('id', postId)
    .select()
    .maybeSingle();
  return { data, error };
}

/**
 * Soft-delete a forum post via the delete_forum_post RPC. The
 * function checks (caller is author OR staff) inside Postgres,
 * so neither the post owner nor moderators have to fight RLS to
 * make this work.
 *
 * Returns { error } — Supabase RPC errors propagate as
 * `error.message` so callers can display them directly.
 */
export async function deletePost(postId) {
  if (!postId) return { error: new Error('Missing postId') };
  const { error } = await supabase.rpc('delete_forum_post', { p_post_id: postId });
  return { error };
}

// ------------------------------------------------------------
// UPVOTES
// ------------------------------------------------------------

export async function hasUpvotedThread(threadId, userId) {
  if (!threadId || !userId) return false;
  const { data } = await supabase
    .from('thread_upvotes')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('voter_id', userId)
    .maybeSingle();
  return !!data;
}

export async function fetchUserPostUpvotes(postIds, userId) {
  if (!userId || !postIds || postIds.length === 0) return new Set();
  const { data } = await supabase
    .from('post_upvotes')
    .select('post_id')
    .in('post_id', postIds)
    .eq('voter_id', userId);
  return new Set((data || []).map((r) => r.post_id));
}

export async function toggleThreadUpvote(threadId, userId) {
  if (!threadId || !userId) return { upvoted: false, error: new Error('Not signed in') };
  const already = await hasUpvotedThread(threadId, userId);
  if (already) {
    const { error } = await supabase
      .from('thread_upvotes')
      .delete()
      .eq('thread_id', threadId)
      .eq('voter_id', userId);
    return { upvoted: false, error };
  } else {
    const { error } = await supabase
      .from('thread_upvotes')
      .insert({ thread_id: threadId, voter_id: userId });
    return { upvoted: !error, error };
  }
}

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
  } else {
    const { error } = await supabase
      .from('post_upvotes')
      .insert({ post_id: postId, voter_id: userId });
    return { upvoted: !error, error };
  }
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

async function fetchProfileRaw(filterCol, filterVal) {
  const { data: summary } = await supabase
    .from('profile_summary')
    .select('*')
    .eq(filterCol, filterVal)
    .maybeSingle();
  if (summary) return summary;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq(filterCol, filterVal)
    .maybeSingle();
  if (!profile) return profile;

  const [threadsR, postsR, badgesR] = await Promise.all([
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('author_id', profile.id),
    supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('author_id', profile.id),
    supabase.from('profile_badges').select('badge_id', { count: 'exact', head: true }).eq('profile_id', profile.id).then((r) => r, () => ({ count: 0 })),
  ]);
  return {
    ...profile,
    reputation: profile.reputation || 0,
    thread_count: threadsR.count || 0,
    post_count: postsR.count || 0,
    badge_count: badgesR.count || 0,
    joined_at: profile.joined_at || profile.created_at,
  };
}

export async function fetchProfileByHandle(handle) {
  if (!handle) return { data: null, error: new Error('No handle') };
  try {
    const data = await fetchProfileRaw('username', handle);
    return { data: data || null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function fetchProfileById(id) {
  if (!id) return { data: null, error: new Error('No id') };
  try {
    const data = await fetchProfileRaw('id', id);
    return { data: data || null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function fetchProfileBadges(profileId) {
  if (!profileId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('profile_badges')
    .select('awarded_at, badge:badges(id, name, description, icon, tier, display_order)')
    .eq('profile_id', profileId)
    .order('awarded_at', { ascending: false });
  if (error) return { data: [], error: null };
  return { data: data || [], error: null };
}

/**
 * Fetch the most recently-active forum threads along with:
 *   - the profile of whoever posted last (for "last replied by" badge)
 *   - a short snippet of that last post's body (for preview)
 *
 * Two round-trips (threads + latest posts) — can't do a per-group MAX embed in
 * PostgREST from the client. The second query pulls *all* posts for the
 * returned thread set and we take the first one per thread client-side.
 */
export async function fetchRecentThreadsWithLastPost(limit = 50) {
  const { data: threads, error } = await supabase
    .from('forum_threads')
    .select(`*, last_author:last_reply_by(${AUTHOR_COLS_SAFE})`)
    // Pinned threads always sort to the top, then by most recent activity.
    .order('is_pinned',     { ascending: false })
    .order('last_reply_at', { ascending: false })
    .limit(limit);

  if (error || !threads || threads.length === 0) {
    return { data: threads || [], error };
  }

  const threadIds = threads.map((t) => t.id);
  // Pull enough posts that every thread likely has its latest captured.
  // 400 covers typical index pages even for chatty threads.
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('thread_id, body, created_at, author_id')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: false })
    .limit(400);

  const latestByThread = new Map();
  (posts || []).forEach((p) => {
    // Keep only the first (= most recent, since we ordered DESC) per thread.
    if (!latestByThread.has(p.thread_id)) latestByThread.set(p.thread_id, p);
  });

  // Also need the display name of OP authors in case a thread has zero replies
  // and last_reply_by falls back to the thread author. Pull those profiles too
  // so we always have a "last author" to show.
  const missingAuthorIds = threads
    .filter((t) => !t.last_author)
    .map((t) => t.author_id)
    .filter(Boolean);
  let authorLookup = new Map();
  if (missingAuthorIds.length > 0) {
    const { data: authors } = await supabase
      .from('profiles')
      .select(AUTHOR_COLS_SAFE)
      .in('id', Array.from(new Set(missingAuthorIds)));
    (authors || []).forEach((a) => authorLookup.set(a.id, a));
  }

  const enriched = threads.map((t) => {
    const lastPost = latestByThread.get(t.id) || null;
    const lastAuthor = t.last_author || authorLookup.get(t.author_id) || null;
    return { ...t, last_post: lastPost, last_author: lastAuthor };
  });

  return { data: enriched, error: null };
}

export async function fetchRecentThreadsByAuthor(authorId, limit = 10) {
  let { data, error } = await supabase
    .from('forum_threads')
    .select('id, slug, title, upvote_count, reply_count, view_count, last_reply_at')
    .eq('author_id', authorId)
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  if (error) {
    const fb = await supabase
      .from('forum_threads')
      .select('id, slug, title, reply_count, view_count, last_reply_at')
      .eq('author_id', authorId)
      .order('last_reply_at', { ascending: false })
      .limit(limit);
    data = (fb.data || []).map((r) => ({ ...r, upvote_count: 0 }));
    error = null;
  }
  return { data: data || [], error };
}

export async function updateOwnProfile(userId, patch) {
  if (!userId) return { data: null, error: new Error('Not signed in') };
  const clean = { ...patch };
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
  if (error) {
    const fb = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, trade')
      .limit(limit);
    return { data: (fb.data || []).map((p) => ({ ...p, reputation: 0, badge_count: 0 })), error: null };
  }
  return { data: data || [], error };
}

// ------------------------------------------------------------
// SUBSCRIPTIONS
// ------------------------------------------------------------

export async function fetchMySubscribedThreadIds(userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from('thread_subscriptions')
    .select('thread_id')
    .eq('user_id', userId);
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.thread_id));
}

export async function fetchMySubscribedThreads(userId, limit = 50) {
  if (!userId) return { data: [], error: null };
  const { data: subs, error: subErr } = await supabase
    .from('thread_subscriptions')
    .select('thread_id')
    .eq('user_id', userId);
  if (subErr || !subs || subs.length === 0) return { data: [], error: null };
  const ids = subs.map((r) => r.thread_id);
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .in('id', ids)
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function isSubscribed(threadId, userId) {
  if (!threadId || !userId) return false;
  const { data } = await supabase
    .from('thread_subscriptions')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function toggleSubscription(threadId, userId) {
  if (!threadId || !userId) return { subscribed: false, error: new Error('Not signed in') };
  const already = await isSubscribed(threadId, userId);
  if (already) {
    const { error } = await supabase
      .from('thread_subscriptions')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId);
    return { subscribed: false, error };
  } else {
    const { error } = await supabase
      .from('thread_subscriptions')
      .insert({ thread_id: threadId, user_id: userId });
    return { subscribed: !error, error };
  }
}

// ------------------------------------------------------------
// MY POSTS
// ------------------------------------------------------------

export async function fetchMyPostThreads(userId, limit = 50) {
  if (!userId) return { data: [], error: null };
  const { data: authored } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('author_id', userId)
    .order('last_reply_at', { ascending: false })
    .limit(limit);
  const { data: postedInIds } = await supabase
    .from('forum_posts')
    .select('thread_id')
    .eq('author_id', userId)
    .limit(500);
  const ids = Array.from(new Set((postedInIds || []).map((r) => r.thread_id)));
  let postedIn = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .in('id', ids)
      .order('last_reply_at', { ascending: false })
      .limit(limit);
    postedIn = data || [];
  }
  const seen = new Set();
  const merged = [];
  [...(authored || []), ...postedIn].forEach((t) => {
    if (seen.has(t.id)) return;
    seen.add(t.id);
    merged.push(t);
  });
  merged.sort((a, b) => new Date(b.last_reply_at || 0) - new Date(a.last_reply_at || 0));
  return { data: merged.slice(0, limit), error: null };
}

// ------------------------------------------------------------
// LIVE COUNTERS
// ------------------------------------------------------------

export async function fetchForumCounters() {
  const [tr, pr, mr, vr] = await Promise.all([
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
    supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    // view_count lives on each thread; pull just that column and sum client-side.
    supabase.from('forum_threads').select('view_count'),
  ]);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count: postsToday } = await supabase
    .from('forum_posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since.toISOString());
  const viewsTotal = (vr.data || []).reduce((sum, row) => sum + (row.view_count || 0), 0);
  return {
    threadsTotal: tr.count || 0,
    postsTotal: pr.count || 0,
    membersTotal: mr.count || 0,
    postsToday: postsToday || 0,
    viewsTotal,
  };
}

// Per-category counters + unread-thread tallies.
// Map<categoryId, { threads, posts, newCount }>.
// newCount counts threads in that category whose last activity is
// after the user's per-thread visit (or within 30d if never visited).
// A markAllReadAt baseline overrides everything older than itself.
const NEW_FALLBACK_DAYS = 30;

/**
 * Search forum_threads by title (and optionally first-post body).
 * Returns rows shaped for mapThreadRow + RecentActivity. Uses ilike
 * so partial words match; SQL %20%-escapes itself via supabase-js.
 */
export async function searchForumThreads(q, { limit = 50 } = {}) {
  const term = (q || '').trim();
  if (!term) return { data: [], error: null };
  const escaped = term.replace(/[%_]/g, (c) => '\\' + c);
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .ilike('title', `%${escaped}%`)
    .order('last_reply_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function fetchCategoryCounters(threadVisits = {}, markAllReadAt = null) {
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, category_id, reply_count, created_at, last_reply_at');

  const fallbackCutoff = Date.now() - NEW_FALLBACK_DAYS * 24 * 60 * 60 * 1000;
  const baselineMs = markAllReadAt ? new Date(markAllReadAt).getTime() : 0;
  const byCat = new Map();
  (threads || []).forEach((t) => {
    if (!t.category_id) return;
    const entry = byCat.get(t.category_id) || { threads: 0, posts: 0, newCount: 0 };
    entry.threads += 1;
    entry.posts += (t.reply_count || 0) + 1;

    const lastActivityIso = t.last_reply_at || t.created_at;
    const lastActivityMs = lastActivityIso ? new Date(lastActivityIso).getTime() : 0;
    if (baselineMs && lastActivityMs <= baselineMs) {
      // Anything older than the user's "Mark all read" click is read.
      byCat.set(t.category_id, entry);
      byCat.set(t.category_id, entry);
      return;
    }
    const recordedIso = threadVisits[t.id];
    const cutoffMs = recordedIso ? new Date(recordedIso).getTime() : fallbackCutoff;
    if (lastActivityMs > cutoffMs) entry.newCount += 1;

    byCat.set(t.category_id, entry);
  });
  return byCat;
}

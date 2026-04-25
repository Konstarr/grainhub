/**
 * Forum admin DB helpers — used only by /admin/forums* surfaces.
 *
 * Every mutation returns { data, error } for a consistent UI.
 * RLS lets staff (mod / admin / owner) read/write across forum_threads,
 * forum_posts, and reports; the helpers here pre-shape the queries
 * with the joins admin pages need.
 */
import { supabase } from './supabase.js';

/* ── Threads ────────────────────────────────────────────── */

/**
 * Paginated list of threads with author + category for the
 * admin threads table. Filters: search (title), state ('all'|'locked'|
 * 'pinned'|'solved'), category id, sort ('newest'|'reports').
 */
export async function listForumThreadsForAdmin({
  search = '',
  state  = 'all',
  categoryId = null,
  sort   = 'newest',
  limit  = 50,
  offset = 0,
} = {}) {
  let q = supabase
    .from('forum_threads')
    .select(
      'id, category_id, slug, title, is_pinned, is_locked, is_solved, ' +
      'view_count, reply_count, last_reply_at, created_at, ' +
      'author:author_id (id, username, full_name, avatar_url, role)',
      { count: 'exact' },
    );

  if (search.trim()) q = q.ilike('title', `%${search.trim()}%`);
  if (categoryId)   q = q.eq('category_id', categoryId);
  if (state === 'locked') q = q.eq('is_locked', true);
  if (state === 'pinned') q = q.eq('is_pinned', true);
  if (state === 'solved') q = q.eq('is_solved', true);

  if (sort === 'newest') q = q.order('created_at', { ascending: false });
  if (sort === 'last_reply') q = q.order('last_reply_at', { ascending: false, nullsFirst: false });

  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  return { data: data || [], error, count: count || 0 };
}

export async function setThreadLocked(threadId, locked) {
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_locked: locked })
    .eq('id', threadId);
  return { error };
}

export async function setThreadPinned(threadId, pinned) {
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_pinned: pinned })
    .eq('id', threadId);
  return { error };
}

export async function setThreadSolved(threadId, solved) {
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_solved: solved })
    .eq('id', threadId);
  return { error };
}

/**
 * Hard-delete is rare for forum threads. Prefer locking + author
 * delete. Admin "delete" here removes the thread row; cascade on
 * forum_posts handles cleanup.
 */
export async function deleteThread(threadId) {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId);
  return { error };
}

/* ── Posts ──────────────────────────────────────────────── */

/**
 * Soft-delete a post (sets is_deleted=true). Body stays in the DB
 * so we can audit if needed; UI hides deleted posts from the
 * public thread page.
 */
export async function softDeletePost(postId) {
  const { error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true })
    .eq('id', postId);
  return { error };
}

export async function restorePost(postId) {
  const { error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: false })
    .eq('id', postId);
  return { error };
}

/* ── Reports ────────────────────────────────────────────── */

/**
 * Moderation queue. Returns reports with reporter info and a
 * pre-fetched snippet of the targeted content (thread title or
 * post body) so the admin can triage without clicking through.
 *
 * Filter `status`: 'open' | 'reviewing' | 'resolved' | 'dismissed' |
 * 'all' (default 'open').
 */
export async function listForumReports({ status = 'open', limit = 100 } = {}) {
  let q = supabase
    .from('reports')
    .select(
      'id, target_type, target_id, reason, details, status, ' +
      'created_at, resolved_at, ' +
      'reporter:reporter_id (id, username, full_name, avatar_url), ' +
      'resolver:resolved_by (id, username, full_name)',
    )
    .in('target_type', ['thread', 'post'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status !== 'all') q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return { data: [], error };

  // Hydrate the targets in parallel so each row shows a snippet.
  const threadIds = (data || []).filter((r) => r.target_type === 'thread').map((r) => r.target_id);
  const postIds   = (data || []).filter((r) => r.target_type === 'post').map((r) => r.target_id);

  const [{ data: threads }, { data: posts }] = await Promise.all([
    threadIds.length
      ? supabase.from('forum_threads')
          .select('id, slug, title, is_locked, author:author_id(username, full_name)')
          .in('id', threadIds)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('forum_posts')
          .select('id, thread_id, body, is_deleted, ' +
                  'author:author_id(username, full_name), ' +
                  'thread:thread_id(slug, title)')
          .in('id', postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const threadMap = Object.fromEntries((threads || []).map((t) => [t.id, t]));
  const postMap   = Object.fromEntries((posts   || []).map((p) => [p.id, p]));

  const enriched = (data || []).map((r) => ({
    ...r,
    target: r.target_type === 'thread' ? threadMap[r.target_id] : postMap[r.target_id],
  }));

  return { data: enriched, error: null };
}

export async function setReportStatus(reportId, status, resolverId) {
  const patch = { status };
  if (status === 'resolved' || status === 'dismissed') {
    patch.resolved_at = new Date().toISOString();
    if (resolverId) patch.resolved_by = resolverId;
  }
  const { error } = await supabase
    .from('reports')
    .update(patch)
    .eq('id', reportId);
  return { error };
}

/* ── Blocked words (admin-managed filter list) ─────────── */

/**
 * List of currently-blocked words. Admin-only via RLS.
 * Sorted alphabetically. Returns severity so the UI can group
 * (profanity / slur / minor).
 */
export async function listBlockedWords() {
  const { data, error } = await supabase
    .from('blocked_words')
    .select('id, word, severity, added_at, added_by')
    .order('word', { ascending: true });
  return { data: data || [], error };
}

/**
 * Add a word to the blocklist. Lowercased + trimmed before insert.
 * The unique constraint on `word` makes this idempotent (re-adding
 * an existing word returns a duplicate-key error which we surface
 * as "already on the list").
 */
export async function addBlockedWord(word, severity = 'profanity') {
  const cleaned = (word || '').trim().toLowerCase();
  if (!cleaned) return { error: new Error('Word required') };
  if (cleaned.length > 80) return { error: new Error('Word too long (max 80 chars)') };
  const { error } = await supabase
    .from('blocked_words')
    .insert({ word: cleaned, severity });
  if (error && error.code === '23505') {
    return { error: new Error('That word is already on the list.') };
  }
  return { error };
}

export async function removeBlockedWord(id) {
  if (!id) return { error: new Error('Missing id') };
  const { error } = await supabase
    .from('blocked_words')
    .delete()
    .eq('id', id);
  return { error };
}

/* ── Forum settings (rate limits) ──────────────────────── */

export async function fetchForumSettings() {
  const { data, error } = await supabase
    .from('forum_settings')
    .select('key, value, updated_at');
  if (error) return { data: {}, error };
  const map = {};
  (data || []).forEach((r) => { map[r.key] = r.value; });
  return { data: map, error: null };
}

export async function updateForumSetting(key, value) {
  const { error } = await supabase.rpc('update_forum_setting', {
    key_in: key,
    value_in: String(value),
  });
  return { error };
}

/* ── Moderation log + filter violations ────────────────── */

export async function listModerationLog({ limit = 100, action = null } = {}) {
  let q = supabase
    .from('moderation_log')
    .select(
      'id, action, target_type, target_id, summary, details, created_at, ' +
      'actor:actor_id (id, username, full_name, avatar_url)',
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (action) q = q.eq('action', action);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function listFilterViolations({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('filter_violations')
    .select(
      'id, target_type, attempted_text, matched_word, created_at, ' +
      'user:user_id (id, username, full_name, avatar_url)',
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

/**
 * Called from public submit handlers when the server returns a
 * "blocked_language" error so admins can see what was attempted.
 * Fire-and-forget — failures here shouldn't surface to the user.
 */
export async function logFilterViolation(targetType, attemptedText) {
  if (!attemptedText || !attemptedText.trim()) return;
  const { error } = await supabase.rpc('log_filter_violation', {
    target_type_in: targetType,
    attempted_text_in: attemptedText,
  });
  return { error };
}

/* ── Badges (admin CRUD) ───────────────────────────────── */

export async function listBadges() {
  // Column is named display_order in migration-forum-system.sql
  // (not "order" — that would be a SQL reserved word).
  const { data, error } = await supabase
    .from('badges')
    .select('id, name, description, icon, tier, kind, metric_type, threshold, display_order')
    .order('display_order', { ascending: true });
  return { data: data || [], error };
}

/**
 * Create or update a badge. Prefers the admin_upsert_badge
 * SECURITY DEFINER RPC (which enforces is_admin() inside Postgres
 * and bypasses RLS), but falls back to a direct table upsert if
 * the RPC isn't deployed yet — that way the admin page works
 * even when the latest migration hasn't been re-run.
 *
 * Logs each attempt to the console so write failures are
 * diagnosable without server-side access.
 */
export async function upsertBadge(badge) {
  if (!badge || !badge.id || !badge.id.trim()) {
    return { error: new Error('Badge id required') };
  }
  const orderRaw = badge.display_order ?? badge.order;
  const cleaned = {
    id:            badge.id.trim().toLowerCase(),
    name:          (badge.name || '').trim(),
    description:   badge.description || '',
    icon:          badge.icon || '🏷',
    tier:          badge.tier || 'bronze',
    kind:          badge.kind || 'accolade',
    metric_type:   badge.metric_type || null,
    threshold:     badge.threshold == null || badge.threshold === '' ? null : Number(badge.threshold),
    display_order: orderRaw == null || orderRaw === '' ? 99 : Number(orderRaw),
  };

  console.log('[upsertBadge] calling admin_upsert_badge', cleaned);
  const rpcRes = await supabase.rpc('admin_upsert_badge', {
    p_id:            cleaned.id,
    p_name:          cleaned.name,
    p_description:   cleaned.description,
    p_icon:          cleaned.icon,
    p_tier:          cleaned.tier,
    p_kind:          cleaned.kind,
    p_metric_type:   cleaned.metric_type,
    p_threshold:     cleaned.threshold,
    p_display_order: cleaned.display_order,
  });
  console.log('[upsertBadge] rpc response', rpcRes);

  // PGRST202 = function not found. Migration probably hasn't run.
  // Fall back to a direct upsert so the page still works.
  if (rpcRes.error && (rpcRes.error.code === 'PGRST202' || /could not find the function/i.test(rpcRes.error.message || ''))) {
    console.warn('[upsertBadge] RPC missing — falling back to direct upsert. Run migration-forum-badges-kind.sql to enable the SECURITY DEFINER path.');
    const fallback = await supabase.from('badges').upsert(cleaned, { onConflict: 'id' });
    console.log('[upsertBadge] direct upsert response', fallback);
    return { error: fallback.error };
  }

  return { error: rpcRes.error };
}

export async function deleteBadge(id) {
  if (!id) return { error: new Error('Id required') };
  console.log('[deleteBadge] calling admin_delete_badge', id);
  const rpcRes = await supabase.rpc('admin_delete_badge', { p_id: id });
  console.log('[deleteBadge] rpc response', rpcRes);

  if (rpcRes.error && (rpcRes.error.code === 'PGRST202' || /could not find the function/i.test(rpcRes.error.message || ''))) {
    console.warn('[deleteBadge] RPC missing — falling back to direct delete.');
    const fallback = await supabase.from('badges').delete().eq('id', id);
    console.log('[deleteBadge] direct delete response', fallback);
    return { error: fallback.error };
  }
  return { error: rpcRes.error };
}

/* ── Forum-wide stats (for dashboard landing) ─────────── */

/**
 * Headline counters for the Forums admin landing page. Six counts
 * batched in parallel: total threads, total posts, threads in
 * the last 7 days, posts in the last 7 days, open reports,
 * reviewing reports.
 */
export async function fetchForumAdminStats() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalThreads },
    { count: totalPosts },
    { count: threads7d },
    { count: posts7d },
    { count: openReports },
    { count: reviewingReports },
  ] = await Promise.all([
    supabase.from('forum_threads').select('id', { head: true, count: 'exact' }),
    supabase.from('forum_posts').select('id', { head: true, count: 'exact' }).eq('is_deleted', false),
    supabase.from('forum_threads').select('id', { head: true, count: 'exact' }).gte('created_at', since7d),
    supabase.from('forum_posts').select('id', { head: true, count: 'exact' })
      .gte('created_at', since7d).eq('is_deleted', false),
    supabase.from('reports').select('id', { head: true, count: 'exact' })
      .eq('status', 'open').in('target_type', ['thread', 'post']),
    supabase.from('reports').select('id', { head: true, count: 'exact' })
      .eq('status', 'reviewing').in('target_type', ['thread', 'post']),
  ]);

  return {
    totalThreads: totalThreads || 0,
    totalPosts:   totalPosts   || 0,
    threads7d:    threads7d    || 0,
    posts7d:      posts7d      || 0,
    openReports:  openReports  || 0,
    reviewingReports: reviewingReports || 0,
  };
}

// Per-user, per-category & per-thread "last visited" tracking.
// localStorage. Per-browser is fine for a "have I seen this?" cue.

const KEY = 'gh:forumLastVisits';
const THREAD_KEY = 'gh:forumThreadVisits';
const MAX_TRACKED = 500;

function readMap(key) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (_) { return {}; }
}

function writeMap(key, map) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(map)); } catch (_) {}
}

/* ── Categories ────────────────────────────────────────── */

export function getForumLastVisits() {
  return readMap(KEY);
}

export function getForumLastVisit(categoryId) {
  if (!categoryId) return null;
  return readMap(KEY)[categoryId] || null;
}

export function markCategoryVisited(categoryId, when = new Date()) {
  if (!categoryId) return;
  const map = readMap(KEY);
  map[categoryId] = (when instanceof Date ? when : new Date(when)).toISOString();
  writeMap(KEY, map);
}

export function clearForumLastVisits() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch (_) {}
}

/* ── Threads ───────────────────────────────────────────── */

export function getForumThreadVisits() {
  return readMap(THREAD_KEY);
}

export function getForumThreadVisit(threadId) {
  if (!threadId) return null;
  return readMap(THREAD_KEY)[threadId] || null;
}

// Caps the map at MAX_TRACKED entries (oldest first).
export function markThreadVisited(threadId, when = new Date()) {
  if (!threadId) return;
  const map = readMap(THREAD_KEY);
  map[threadId] = (when instanceof Date ? when : new Date(when)).toISOString();
  const entries = Object.entries(map);
  if (entries.length > MAX_TRACKED) {
    entries.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());
    writeMap(THREAD_KEY, Object.fromEntries(entries.slice(entries.length - MAX_TRACKED)));
    return;
  }
  writeMap(THREAD_KEY, map);
}

// No prior visit → only "new" within `freshnessDays`.
// A global "Mark all read" baseline trumps the freshness window:
// anything before that baseline is treated as read regardless.
export function isThreadUnread(threadId, lastReplyAt, lastVisits, freshnessDays = 30) {
  if (!threadId || !lastReplyAt) return false;
  const replyMs = new Date(lastReplyAt).getTime();
  if (Number.isNaN(replyMs)) return false;
  const baselineMs = getMarkAllReadAtMs();
  if (baselineMs && replyMs <= baselineMs) return false;
  const recordedIso = lastVisits ? lastVisits[threadId] : getForumThreadVisit(threadId);
  if (recordedIso) return replyMs > new Date(recordedIso).getTime();
  return replyMs > Date.now() - freshnessDays * 24 * 60 * 60 * 1000;
}

/* ── Mark all read baseline ────────────────────────────── */

const MARK_ALL_KEY = 'gh:forumMarkAllReadAt';

export function setForumMarkAllReadAt(when = new Date()) {
  if (typeof window === 'undefined') return;
  const iso = (when instanceof Date ? when : new Date(when)).toISOString();
  try { window.localStorage.setItem(MARK_ALL_KEY, iso); } catch (_) {}
}

export function getForumMarkAllReadAt() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(MARK_ALL_KEY) || null; } catch (_) { return null; }
}

function getMarkAllReadAtMs() {
  const iso = getForumMarkAllReadAt();
  if (!iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

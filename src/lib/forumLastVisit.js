/**
 * Per-user, per-category "last visited" tracker for the forum
 * "X new" badges. Stored in localStorage so we don't pay round-trips
 * on every render — accuracy is per-browser, which matches what
 * users intuitively expect from a "have I seen this?" indicator.
 *
 * Shape: { [categoryId]: ISOString }
 */
const KEY = 'gh:forumLastVisits';

function readMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) { return {}; }
}

function writeMap(map) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(map)); } catch (_) { /* quota / disabled */ }
}

/**
 * Read the full map of last-visit timestamps. Used by Forums.jsx
 * to compute "new since" counts for every category in one batch.
 */
export function getForumLastVisits() {
  return readMap();
}

/**
 * Get the ISOString for one category, or null if the user has never
 * been there. Null is treated as "everything is new" — but we cap
 * the displayed count to avoid plastering 9999+ on a fresh visit;
 * the live counter only counts threads from the last 30 days when
 * there's no prior visit recorded.
 */
export function getForumLastVisit(categoryId) {
  if (!categoryId) return null;
  return readMap()[categoryId] || null;
}

/**
 * Mark a category as visited. Called from ForumCategory.jsx (when
 * the user actually opens the category page) so the badge clears
 * the next time they return to /forums. We deliberately do NOT
 * mark visited on the forum index — visiting the index shouldn't
 * silence the badges; reading the category should.
 */
export function markCategoryVisited(categoryId, when = new Date()) {
  if (!categoryId) return;
  const map = readMap();
  map[categoryId] = (when instanceof Date ? when : new Date(when)).toISOString();
  writeMap(map);
}

/** Wipe all forum-visit memory — used by an admin "clear" affordance. */
export function clearForumLastVisits() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch (_) {}
}

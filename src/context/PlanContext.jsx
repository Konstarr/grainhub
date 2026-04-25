import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Plan-changes context. Holds the user's *staged* (uncommitted)
 * subscription changes — what they want their plan to look like
 * once they hit Apply. Not a shopping cart: this is the same UX
 * pattern Substack / Discord Nitro / Patreon use, where the user
 * picks a new plan and confirms once.
 *
 * Each pending change is one of:
 *
 *   { type: 'membership',  id: 'pro' }
 *   { type: 'pack',        id: 'recruiter', tierId: 'growth' }
 *   { type: 'sponsor',     id: 'gold' }
 *   { type: 'alacarte',    id: 'email-blast' }
 *
 * Rules enforced as changes are added:
 *   - Only ONE membership change at a time (replaces existing).
 *   - Only ONE pack change per pack-id at a time (replaces tier).
 *   - Only ONE sponsor change at a time.
 *   - À la carte one-offs dedupe by id.
 *
 * Persisted to localStorage so a refresh doesn't lose what the user
 * was about to commit. When Stripe is wired in, the pending changes
 * become the line-items of a Checkout Session — same shape, just
 * routed through Stripe instead of straight to the RPC.
 */

const PlanContext = createContext(null);
const STORAGE_KEY = 'gh:plan-changes-v1';
const LEGACY_KEY  = 'gh:cart-v1';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // One-time migration from the old cart key. Read, write under
    // the new name, drop the old. Safe because the shape is identical.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
      return parsed;
    }
    return [];
  } catch (_) { return []; }
}
function saveToStorage(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) { /* ignore */ }
}

export function PlanProvider({ children }) {
  const [pendingChanges, setPendingChanges] = useState(loadFromStorage);

  useEffect(() => { saveToStorage(pendingChanges); }, [pendingChanges]);

  const addChange = useCallback((next) => {
    setPendingChanges((prev) => {
      if (next.type === 'membership') {
        return [...prev.filter((i) => i.type !== 'membership'), next];
      }
      if (next.type === 'pack') {
        return [...prev.filter((i) => !(i.type === 'pack' && i.id === next.id)), next];
      }
      if (next.type === 'sponsor') {
        return [...prev.filter((i) => i.type !== 'sponsor'), next];
      }
      if (next.type === 'alacarte') {
        if (prev.some((i) => i.type === 'alacarte' && i.id === next.id)) return prev;
        return [...prev, next];
      }
      return prev;
    });
  }, []);

  const removeChange = useCallback((predicate) => {
    setPendingChanges((prev) => prev.filter((i) => !predicate(i)));
  }, []);

  const discard = useCallback(() => setPendingChanges([]), []);

  const has = useCallback(
    (predicate) => pendingChanges.some(predicate),
    [pendingChanges],
  );

  const value = useMemo(
    () => ({
      pendingChanges,
      addChange,
      removeChange,
      discard,
      has,
      count: pendingChanges.length,
    }),
    [pendingChanges, addChange, removeChange, discard, has],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanChanges() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    // Soft-fail: return a no-op so a missing provider can't crash
    // pages during HMR. In production PlanProvider always wraps.
    return {
      pendingChanges: [],
      addChange: () => null,
      removeChange: () => null,
      discard: () => null,
      has: () => false,
      count: 0,
    };
  }
  return ctx;
}

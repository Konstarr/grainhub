import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Subscription cart. Holds the items a user has tentatively selected
 * before they confirm. Items are one of:
 *
 *   { type: 'membership',  id: 'pro' }
 *   { type: 'pack',        id: 'recruiter', tierId: 'growth' }
 *   { type: 'sponsor',     id: 'gold' }
 *   { type: 'alacarte',    id: 'email-blast' }
 *
 * Rules enforced as items are added:
 *   - Only ONE membership in the cart at a time (replaces existing).
 *   - Only ONE pack per pack-id at a time (replaces existing tier).
 *   - Only ONE sponsor tier at a time.
 *   - Multiple à la carte items allowed (they're one-offs).
 *
 * Persisted to localStorage so a refresh doesn't blow the cart away.
 */

const CartContext = createContext(null);
const STORAGE_KEY = 'gh:cart-v1';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}
function saveToStorage(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) { /* ignore */ }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadFromStorage);

  useEffect(() => { saveToStorage(items); }, [items]);

  const addItem = useCallback((next) => {
    setItems((prev) => {
      // Membership: replace any existing
      if (next.type === 'membership') {
        return [...prev.filter((i) => i.type !== 'membership'), next];
      }
      // Pack: replace any existing pack with the same id
      if (next.type === 'pack') {
        return [...prev.filter((i) => !(i.type === 'pack' && i.id === next.id)), next];
      }
      // Sponsor: replace any existing sponsor
      if (next.type === 'sponsor') {
        return [...prev.filter((i) => i.type !== 'sponsor'), next];
      }
      // À la carte: dedupe by id (single instance of each)
      if (next.type === 'alacarte') {
        if (prev.some((i) => i.type === 'alacarte' && i.id === next.id)) return prev;
        return [...prev, next];
      }
      return prev;
    });
  }, []);

  const removeItem = useCallback((predicate) => {
    setItems((prev) => prev.filter((i) => !predicate(i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback((predicate) => items.some(predicate), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, clear, has, count: items.length }),
    [items, addItem, removeItem, clear, has]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // Soft-fail: return a no-op cart so a missing provider can't crash
    // pages during HMR. In production CartProvider always wraps.
    return { items: [], addItem: () => null, removeItem: () => null, clear: () => null, has: () => false, count: 0 };
  }
  return ctx;
}

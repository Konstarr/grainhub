import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Generic hook: fetch a list of rows from a Supabase table.
 *
 * Usage:
 *   const { data, loading, error } = useSupabaseList('jobs', {
 *     select: '*',
 *     filter: (q) => q.eq('is_approved', true),
 *     order:  { column: 'posted_at', ascending: false },
 *     limit:  50,
 *   });
 */
export function useSupabaseList(table, opts = {}) {
  const { select = '*', filter, order, limit } = opts;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        let q = supabase.from(table).select(select);
        if (filter) q = filter(q);
        if (order) q = q.order(order.column, { ascending: Boolean(order.ascending) });
        if (limit) q = q.limit(limit);
        const { data: rows, error: err } = await q;
        if (cancelled) return;
        if (err) {
          setError(err);
          setData([]);
        } else {
          setError(null);
          setData(rows || []);
        }
      } catch (e) {
        if (cancelled === false) {
          setError(e);
          setData([]);
        }
      } finally {
        if (cancelled === false) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, select, JSON.stringify(order), limit]);

  return { data, loading, error };
}

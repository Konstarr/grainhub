import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import CountUp from './CountUp.jsx';

/**
 * A full-bleed stat band that sits directly under the sponsor
 * marquee. Big numbers on a dark brown background make the
 * homepage feel "alive" from the very first scroll tick.
 */
export default function StatsStrip() {
  const [stats, setStats] = useState({
    members: 0,
    communities: 0,
    posts: 0,
    suppliers: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 4 fast count queries in parallel. Using head: true + count:
      // 'estimated' keeps these cheap even on big tables.
      const [m, c, p, s] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('communities').select('id', { count: 'exact', head: true }).eq('is_public', true),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
        supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      ]);
      if (cancelled) return;
      setStats({
        members:     m.count || 0,
        communities: c.count || 0,
        posts:       p.count || 0,
        suppliers:   s.count || 0,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const items = [
    { label: 'Members',     value: stats.members,     sub: 'woodworkers & shops' },
    { label: 'Communities', value: stats.communities, sub: 'active groups' },
    { label: 'Posts',       value: stats.posts,       sub: 'in the forums' },
    { label: 'Suppliers',   value: stats.suppliers,   sub: 'verified & searchable' },
  ];

  return (
    <section className="stats-strip">
      <div className="stats-strip-inner">
        {items.map((it) => (
          <div key={it.label} className="stats-cell">
            <div className="stats-value">
              {/* CountUp animates from 0 → live value once the strip
                  scrolls into view AND the data has loaded. */}
              <CountUp value={it.value} duration={1600} />
            </div>
            <div className="stats-label">{it.label}</div>
            <div className="stats-sub">{it.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

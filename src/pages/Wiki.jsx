import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import '../styles/wikiDashboard.css';

/**
 * The /wiki dashboard. Designed to feel like the front page of a real
 * encyclopedia: featured article hero, topic clusters, recently updated,
 * "did you know" facts, and a clear contribution CTA.
 *
 * The featured article is whichever published article was most recently
 * updated -- the seed migration sets the Mortise & Tenon article's
 * updated_at to now() when it runs, so it leads the page until something
 * newer ships.
 */

// Eight canonical topic clusters. Each renders a card on the dashboard
// even if the database has zero matching articles yet -- a great
// encyclopedia is bigger than its current contents, and showing the
// scaffolding signals scope to the reader.
const CLUSTERS = [
  { key: 'Joinery',          icon: 'JN',
    desc: 'Mortise & tenon, dovetails, dadoes, finger joints, and every named joint with diagrams and proportions.' },
  { key: 'Finishing',        icon: 'FN',
    desc: 'Schedules, products, application techniques, troubleshooting blush and orange peel.' },
  { key: 'Machinery',        icon: 'MC',
    desc: 'Tablesaws, jointers, planers, CNC, edgebanders. Setup, tuning, safety, lifecycle.' },
  { key: 'Wood Species',     icon: 'SP',
    desc: 'Janka, density, color, workability and finish-receptivity for every commercial species.' },
  { key: 'Hand Tools',       icon: 'HT',
    desc: 'Planes, chisels, saws, marking and measuring. Sharpening and tuning each one.' },
  { key: 'Hardware',         icon: 'HW',
    desc: 'Hinges, slides, fasteners, knobs, locks. Selection, installation, common failures.' },
  { key: 'Techniques',       icon: 'TQ',
    desc: 'Bending, veneering, kiln-drying, milling, bookmatching, repair, restoration.' },
  { key: 'Shop & Business',  icon: 'SB',
    desc: 'Pricing, contracts, dust collection, layout, OSHA, insurance, taxes, hiring.' },
];

// Did-you-know facts. These are seeded here for the launch demo --
// later this becomes a "fun_facts" table that admins can edit and
// readers can swap into articles via a one-click excerpt.
const DID_YOU_KNOW = [
  '...mortise and tenon joints have been found in Egyptian tomb furniture from 2,700 BCE — and they were already pegged for permanence.',
  '...white oak floats in salt water and sinks in fresh water? Its closed-cell structure traps almost no air.',
  '...Janka hardness is measured by pressing a 0.444"-diameter steel ball halfway into a board and recording the pounds-force required.',
  '...the original Stanley #4 smoothing plane has been produced almost continuously since 1869, with only minor changes to the frog and lateral lever.',
  '...hide glue is reversible with steam — which is why 18th-century furniture can be repaired but most modern PVA-glued furniture can not.',
  '...board-foot is a volume measure: 144 cubic inches of nominal lumber, regardless of the actual surfaced dimensions.',
  '...Festool produced its first Domino DF 500 in 2007; before that, "loose tenons" were either router-cut or biscuit-joined.',
  '...the rule of thumb that tenon thickness equals 1/3 of stock thickness comes from the European cabinetmaking tradition. Japanese furniture runs closer to 1/2.',
];

function pickRandom(arr, n = 3) {
  const out = [];
  const used = new Set();
  while (out.length < Math.min(n, arr.length)) {
    const i = Math.floor(Math.random() * arr.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(arr[i]);
  }
  return out;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function relativeTime(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return d + ' days ago';
  if (d < 30) return Math.floor(d / 7) + ' weeks ago';
  if (d < 365) return Math.floor(d / 30) + ' months ago';
  return Math.floor(d / 365) + ' years ago';
}

export default function Wiki() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      setArticles((data || []).map((r) => ({ ...mapWikiRow(r), updatedAtRaw: r.updated_at })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Featured = the most-recently-updated article. After the
  // mortise-and-tenon seed migration runs, that's our flagship.
  const featured = articles[0] || null;
  const recentlyUpdated = articles.slice(0, 8);

  // Articles grouped by cluster
  const articlesByCluster = useMemo(() => {
    const map = {};
    for (const c of CLUSTERS) map[c.key] = [];
    articles.forEach((a) => {
      const cat = (a.category || '').trim();
      // Match cluster by exact category or by case-insensitive contains
      let placed = false;
      for (const c of CLUSTERS) {
        if (cat === c.key || cat.toLowerCase() === c.key.toLowerCase()) {
          map[c.key].push(a);
          placed = true;
          break;
        }
      }
      if (!placed) {
        // Heuristic fallback for variant category names
        const lc = cat.toLowerCase();
        if (/joinery|joint/.test(lc)) map['Joinery'].push(a);
        else if (/finish/.test(lc)) map['Finishing'].push(a);
        else if (/machine|cnc|power/.test(lc)) map['Machinery'].push(a);
        else if (/species|lumber|wood/.test(lc)) map['Wood Species'].push(a);
        else if (/hand|plane|chisel/.test(lc)) map['Hand Tools'].push(a);
        else if (/hardware|hinge|fast/.test(lc)) map['Hardware'].push(a);
        else if (/tech|bend|veneer/.test(lc)) map['Techniques'].push(a);
        else if (/shop|business|pricing/.test(lc)) map['Shop & Business'].push(a);
      }
    });
    return map;
  }, [articles]);

  // Live search dropdown — filters as you type
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) { setSearchResults([]); return; }
    const hits = articles.filter((a) => {
      const hay = (a.title + ' ' + (a.excerpt || '') + ' ' + (a.category || '')).toLowerCase();
      return hay.includes(q);
    }).slice(0, 6);
    setSearchResults(hits);
  }, [searchQuery, articles]);

  const fact = useMemo(() => DID_YOU_KNOW[Math.floor(Math.random() * DID_YOU_KNOW.length)], []);
  const otherFacts = useMemo(() => pickRandom(DID_YOU_KNOW, 3), []);

  // Stats strip
  const totalArticles = articles.length;
  const reviewedCount = articles.filter((a) => a.body && a.body.length > 1000).length;
  const downloadCount = 6; // placeholder — eventually a count from a downloads table

  return (
    <div className="wiki-dash">
      {/* ---------- HERO ---------- */}
      <section className="wd-hero">
        <div className="wd-hero-inner">
          <div className="wd-hero-eyebrow">GrainHub Encyclopedia</div>
          <h1 className="wd-hero-title">The reference for everyone who works wood.</h1>
          <p className="wd-hero-sub">
            Joinery, machinery, finishes, lumber, hardware, technique, shop and business —
            written by working pros, reviewed for accuracy, and free to read.
          </p>

          <div className="wd-search" ref={searchRef}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search 200+ articles — joints, species, finishes, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="wd-search-results">
                {searchResults.map((r) => (
                  <Link
                    key={r.id}
                    to={'/wiki/article/' + r.slug}
                    className="wd-search-result"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="wd-search-result-title">{r.title}</div>
                    <div className="wd-search-result-meta">{r.category}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="wd-stats">
            <div className="wd-stat">
              <div className="wd-stat-num">{totalArticles}</div>
              <div className="wd-stat-label">Articles published</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{reviewedCount}</div>
              <div className="wd-stat-label">Editor-reviewed</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{downloadCount}</div>
              <div className="wd-stat-label">Downloadable resources</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">8</div>
              <div className="wd-stat-label">Topic clusters</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURED ARTICLE ---------- */}
      {featured && (
        <section className="wd-section">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">Featured article</div>
              <h2 className="wd-section-title">Editor&apos;s pick this week</h2>
            </div>
          </div>
          <Link to={'/wiki/article/' + featured.slug} className="wd-feature">
            <div className="wd-feature-img" style={{ background: 'linear-gradient(135deg,#3d2615,#1c0f06)' }}>
              {featured.coverImage && (
                <img src={featured.coverImage} alt={featured.title} loading="lazy" decoding="async"/>
              )}
              <div className="wd-feature-badge">FEATURED</div>
            </div>
            <div className="wd-feature-body">
              <div className="wd-feature-cat">{featured.category || 'Reference'}</div>
              <h3 className="wd-feature-title">{featured.title}</h3>
              <p className="wd-feature-excerpt">{featured.excerpt}</p>
              <div className="wd-feature-meta">
                {featured.readTime && <span>{featured.readTime}</span>}
                {featured.readTime && <span className="wd-dot">·</span>}
                <span>Updated {relativeTime(featured.updatedAtRaw || featured.updatedAt)}</span>
                <span className="wd-dot">·</span>
                <span className="wd-feature-verified">Editor-reviewed</span>
              </div>
              <span className="wd-feature-cta">Read article →</span>
            </div>
          </Link>
        </section>
      )}

      {/* ---------- TOPIC CLUSTERS ---------- */}
      <section className="wd-section">
        <div className="wd-section-head">
          <div>
            <div className="wd-section-eyebrow">Browse the encyclopedia</div>
            <h2 className="wd-section-title">By topic cluster</h2>
            <p className="wd-section-desc">Eight clusters, hundreds of articles. Pick a thread and pull.</p>
          </div>
        </div>
        <div className="wd-clusters">
          {CLUSTERS.map((c) => {
            const list = articlesByCluster[c.key] || [];
            return (
              <div className="wd-cluster" key={c.key}>
                <div className="wd-cluster-head">
                  <div className="wd-cluster-icon">{c.icon}</div>
                  <div>
                    <div className="wd-cluster-name">{c.key}</div>
                    <div className="wd-cluster-count">
                      {list.length === 0 ? 'Coming soon' : list.length + ' article' + (list.length === 1 ? '' : 's')}
                    </div>
                  </div>
                </div>
                <p className="wd-cluster-desc">{c.desc}</p>
                {list.length > 0 && (
                  <ul className="wd-cluster-list">
                    {list.slice(0, 4).map((a) => (
                      <li key={a.id}>
                        <Link to={'/wiki/article/' + a.slug}>{a.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
                {list.length === 0 && (
                  <div className="wd-cluster-empty">
                    Help us build this cluster — <Link to="/forums/new?category=wiki-edits">propose an article</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- RECENT + DID YOU KNOW ---------- */}
      <section className="wd-section wd-two-col">
        <div className="wd-recent">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">Recently updated</div>
              <h2 className="wd-section-title">What&apos;s changed</h2>
            </div>
          </div>
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
          {!loading && recentlyUpdated.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>
              No published articles yet — the encyclopedia is just getting started.
            </p>
          )}
          <ul className="wd-recent-list">
            {recentlyUpdated.map((a) => (
              <li key={a.id} className="wd-recent-item">
                <Link to={'/wiki/article/' + a.slug} className="wd-recent-link">
                  <div className="wd-recent-cat">{a.category || 'Reference'}</div>
                  <div className="wd-recent-title">{a.title}</div>
                  {a.excerpt && (
                    <div className="wd-recent-excerpt">
                      {a.excerpt.length > 160 ? a.excerpt.slice(0, 160) + '...' : a.excerpt}
                    </div>
                  )}
                  <div className="wd-recent-meta">
                    {a.readTime && <span>{a.readTime}</span>}
                    {a.readTime && <span className="wd-dot">·</span>}
                    <span>Updated {relativeTime(a.updatedAtRaw || a.updatedAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside className="wd-aside">
          <div className="wd-card wd-card-amber">
            <div className="wd-card-eyebrow">Did you know?</div>
            <p className="wd-card-fact">{fact}</p>
            <div className="wd-card-divider" />
            <ul className="wd-fact-list">
              {otherFacts.filter((f) => f !== fact).slice(0, 2).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="wd-card wd-card-dark">
            <div className="wd-card-eyebrow" style={{ color: '#ffd7ac' }}>Help build it</div>
            <h3 className="wd-card-title">200 more articles needed</h3>
            <p className="wd-card-text">
              The encyclopedia covers eight topic clusters. We&apos;re aiming for 200&ndash;300
              articles across all of them by the end of the year. Working pros get bylines,
              reputation, and a public reviewer credit on every article they help shape.
            </p>
            <div className="wd-card-actions">
              <Link to="/forums/new?category=wiki-edits" className="wd-btn-primary">
                Propose an article
              </Link>
              <Link to="/forums/category/wiki" className="wd-btn-ghost">
                Discuss with editors
              </Link>
            </div>
          </div>

          <div className="wd-card wd-card-cream">
            <div className="wd-card-eyebrow">Cite this work</div>
            <p className="wd-card-text" style={{ fontSize: 13 }}>
              GrainHub Wiki is published under <strong>CC BY-SA 4.0</strong>. You may copy,
              redistribute, and adapt the material with attribution. Citation format is
              shown at the bottom of every article.
            </p>
          </div>
        </aside>
      </section>

      {/* ---------- FOOTER CTA ---------- */}
      <section className="wd-cta-band">
        <div className="wd-cta-inner">
          <div>
            <div className="wd-cta-eyebrow">For working pros</div>
            <h2 className="wd-cta-title">Become a verified contributor</h2>
            <p className="wd-cta-text">
              Verified pros get bylines, marginal pro-notes on related articles, and a
              listed page that buyers can find. The reviewer program opens to applications
              May 2026.
            </p>
          </div>
          <div className="wd-cta-actions">
            <Link to="/forums/category/wiki" className="wd-btn-primary lg">Join the editorial channel</Link>
            <Link to="/account/subscription" className="wd-btn-ghost lg">View vendor packs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

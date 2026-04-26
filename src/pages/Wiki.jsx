import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import { CLUSTERS, TOTAL_SUBTOPICS } from '../data/wikiTaxonomy.js';
import '../styles/wikiDashboard.css';

const DID_YOU_KNOW = [
  'Mortise and tenon joints have been found in Egyptian tomb furniture from 2,700 BCE.',
  'White oak floats in salt water and sinks in fresh water? Its closed-cell structure traps almost no air.',
  'Janka hardness is measured by pressing a 0.444-inch steel ball halfway into a board.',
  'The Stanley #4 smoothing plane has been produced almost continuously since 1869.',
  'Hide glue is reversible with steam - antique furniture can be repaired but PVA-glued furniture often cannot.',
  'Board-foot is a volume measure: 144 cubic inches of nominal lumber.',
  'Festool released its first Domino DF 500 in 2007; before that, "loose tenons" meant router-cut or biscuits.',
  'European tradition runs tenon thickness at 1/3 stock; Japanese furniture runs closer to 1/2.',
  'Sitka spruce - guitar tops and historic aircraft propellers - grows in a narrow strip along the Pacific Northwest.',
  'A wine barrel uses 32 staves of oak, hand-shaped and toasted over an open fire to give wine its vanilla notes.',
];

function pickRandom(arr, n = 3) {
  const out = [];
  const used = new Set();
  while (out.length < Math.min(n, arr.length)) {
    const i = Math.floor(Math.random() * arr.length);
    if (used.has(i)) continue;
    used.add(i); out.push(arr[i]);
  }
  return out;
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

  const featuredArticles = articles.slice(0, 3);
  const recentlyUpdated = articles.slice(0, 6);

  const articlesByCluster = useMemo(() => {
    const map = {};
    for (const c of CLUSTERS) map[c.key] = [];
    articles.forEach((a) => {
      const cat = (a.category || '').trim();
      let placed = false;
      for (const c of CLUSTERS) {
        if (cat === c.key || cat.toLowerCase() === c.key.toLowerCase()) {
          map[c.key].push(a); placed = true; break;
        }
      }
      if (!placed) {
        const lc = cat.toLowerCase();
        if (/joinery|joint/.test(lc)) map['Joinery'].push(a);
        else if (/finish/.test(lc)) map['Finishing'].push(a);
        else if (/cnc|digital/.test(lc)) map['CNC & Digital'].push(a);
        else if (/cabinet|millwork/.test(lc)) map['Cabinetmaking & Millwork'].push(a);
        else if (/furniture/.test(lc)) map['Furniture Making'].push(a);
        else if (/boat|marine/.test(lc)) map['Boat Building & Marine'].push(a);
        else if (/luthier|guitar|violin|instrument/.test(lc)) map['Lutherie & Instruments'].push(a);
        else if (/turn|carve|cooper|timber frame/.test(lc)) map['Specialty Disciplines'].push(a);
        else if (/lumber|timber|sawmill|dryin|kiln/.test(lc)) map['Timber & Milling'].push(a);
        else if (/species|wood/.test(lc)) map['Wood Species'].push(a);
        else if (/machine|stationary/.test(lc)) map['Stationary Machinery'].push(a);
        else if (/power tool|router|drill|sander/.test(lc)) map['Power Tools'].push(a);
        else if (/hand|plane|chisel|saw/.test(lc)) map['Hand Tools'].push(a);
        else if (/hardware|hinge|fast|glue|adhesive/.test(lc)) map['Hardware & Adhesives'].push(a);
        else if (/tech|bend|veneer/.test(lc)) map['Techniques'].push(a);
        else if (/history|tradition|shaker|maker/.test(lc)) map['History & Schools'].push(a);
        else if (/manufacturer|brand|industry|supplier/.test(lc)) map['Industry & Brands'].push(a);
        else if (/shop|business|pricing/.test(lc)) map['Shop & Business'].push(a);
      }
    });
    return map;
  }, [articles]);

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

  const totalArticles = articles.length;
  const reviewedCount = articles.filter((a) => a.body && a.body.length > 1000).length;

  return (
    <div className="wiki-dash">
      <section className="wd-hero">
        <div className="wd-hero-inner">
          <div className="wd-hero-eyebrow">Millwork.io Encyclopedia</div>
          <h1 className="wd-hero-title">The reference for everyone who works wood.</h1>
          <p className="wd-hero-sub">
            From standing tree to finished piece - {CLUSTERS.length} fields, {TOTAL_SUBTOPICS} sub-topics,
            written by working pros and free to read.
          </p>

          <div className="wd-search" ref={searchRef}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search the encyclopedia - species, joints, finishes, tools, brands..."
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
              <div className="wd-stat-label">Articles</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{CLUSTERS.length}</div>
              <div className="wd-stat-label">Major fields</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{TOTAL_SUBTOPICS}</div>
              <div className="wd-stat-label">Sub-topics</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-num">{reviewedCount}</div>
              <div className="wd-stat-label">Reviewed</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ROW */}
      {featuredArticles.length > 0 && (
        <section className="wd-section">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">Featured this week</div>
              <h2 className="wd-section-title">Editor&apos;s picks</h2>
            </div>
          </div>
          <div className="wd-featured-row">
            {featuredArticles.map((a, i) => (
              <Link
                key={a.id}
                to={'/wiki/article/' + a.slug}
                className={'wd-feat-card' + (i === 0 ? ' lead' : '')}
              >
                <div className="wd-feat-img" style={{ background: 'linear-gradient(135deg,#3d2615,#1c0f06)' }}>
                  {a.coverImage && <img src={a.coverImage} alt={a.title} loading="lazy" decoding="async"/>}
                  {i === 0 && <div className="wd-feat-badge">FEATURED</div>}
                </div>
                <div className="wd-feat-body">
                  <div className="wd-feat-cat">{a.category || 'Reference'}</div>
                  <h3 className="wd-feat-title">{a.title}</h3>
                  {a.excerpt && (
                    <p className="wd-feat-excerpt">
                      {a.excerpt.length > 140 ? a.excerpt.slice(0, 140) + '...' : a.excerpt}
                    </p>
                  )}
                  <div className="wd-feat-meta">
                    {a.readTime && <span>{a.readTime}</span>}
                    {a.readTime && <span className="wd-dot">.</span>}
                    <span>Updated {relativeTime(a.updatedAtRaw || a.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* COMPACT CLUSTER GRID — click any card to open the cluster sub-page */}
      <section className="wd-section">
        <div className="wd-section-head">
          <div>
            <div className="wd-section-eyebrow">The library</div>
            <h2 className="wd-section-title">Browse the encyclopedia</h2>
            <p className="wd-section-desc">
              {CLUSTERS.length} fields, {TOTAL_SUBTOPICS} sub-topics. Click any field to drill into its sub-topics and articles.
            </p>
          </div>
        </div>

        <div className="wd-grid">
          {CLUSTERS.map((c) => {
            const list = articlesByCluster[c.key] || [];
            return (
              <Link
                to={'/wiki/cluster/' + c.slug}
                className="wd-card-cluster"
                key={c.key}
                style={{ '--accent': c.accent }}
              >
                <div className="wd-card-cluster-head">
                  <span className="wd-card-cluster-icon">{c.icon}</span>
                  <div className="wd-card-cluster-id">
                    <div className="wd-card-cluster-name">{c.key}</div>
                    <div className="wd-card-cluster-meta">
                      {list.length} {list.length === 1 ? 'article' : 'articles'} . {c.subtopics.length} sub-topics
                    </div>
                  </div>
                </div>
                <p className="wd-card-cluster-desc">{c.desc}</p>
                <div className="wd-card-cluster-cta">
                  Explore {c.key} <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT + ASIDE */}
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
              No published articles yet - the encyclopedia is just getting started.
            </p>
          )}
          <ul className="wd-recent-list">
            {recentlyUpdated.map((a) => (
              <li key={a.id} className="wd-recent-item">
                <Link to={'/wiki/article/' + a.slug} className="wd-recent-link">
                  <div className="wd-recent-cat">{a.category || 'Reference'}</div>
                  <div className="wd-recent-title">{a.title}</div>
                  <div className="wd-recent-meta">
                    {a.readTime && <span>{a.readTime}</span>}
                    {a.readTime && <span className="wd-dot">.</span>}
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
            <h3 className="wd-card-title">Articles needed in every field</h3>
            <p className="wd-card-text">
              Working pros get bylines, reputation, and a public reviewer credit on every
              article they help shape.
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
        </aside>
      </section>

      <section className="wd-cta-band">
        <div className="wd-cta-inner">
          <div>
            <div className="wd-cta-eyebrow">For working pros</div>
            <h2 className="wd-cta-title">Become a verified contributor</h2>
            <p className="wd-cta-text">
              Verified pros get bylines, marginal pro-notes on related articles, and a
              listed page that buyers can find. Reviewer program opens May 2026.
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

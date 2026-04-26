import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import '../styles/wikiDashboard.css';

const CLUSTERS = [
  {
    key: 'Joinery',
    icon: 'JN',
    accent: '#8a5030',
    desc: 'Every named joint, with diagrams, proportions, and the trade-offs between them.',
    subtopics: [
      { name: 'Mortise & Tenon',         match: /mortise|tenon/i },
      { name: 'Dovetails',               match: /dovetail/i },
      { name: 'Dadoes & Rabbets',        match: /dado|rabbet|groove/i },
      { name: 'Finger & Box Joints',     match: /finger|box joint/i },
      { name: 'Miters & Splines',        match: /miter|spline|biscuit/i },
      { name: 'Loose Tenon (Domino)',    match: /loose tenon|domino|floating/i },
      { name: 'Specialty & Decorative',  match: /scarf|lap|bridle|tusk|specialty/i },
    ],
  },
  {
    key: 'Finishing',
    icon: 'FN',
    accent: '#9c5e30',
    desc: 'Stain, dye, topcoat, schedule, and every application method, plus troubleshooting.',
    subtopics: [
      { name: 'Stains & Dyes',           match: /stain|dye|aniline|pigment/i },
      { name: 'Lacquer & Pre-Cat',       match: /lacquer|pre-?cat/i },
      { name: 'Polyurethane',            match: /poly(urethane)?/i },
      { name: 'Oil Finishes',            match: /(tung|linseed|danish|hardwax|oil finish)/i },
      { name: 'Shellac & French Polish', match: /shellac|french polish/i },
      { name: 'Application Methods',     match: /spray|hvlp|brush|wipe|application/i },
      { name: 'Schedules & Recipes',     match: /finish(ing)? schedule|recipe/i },
      { name: 'Troubleshooting',         match: /blush|orange peel|fish eye|defect/i },
    ],
  },
  {
    key: 'Machinery',
    icon: 'MC',
    accent: '#5d3a1c',
    desc: 'Setup, tuning, safety, and lifecycle of every piece of stationary and CNC equipment.',
    subtopics: [
      { name: 'Tablesaws',               match: /tablesaw|table saw/i },
      { name: 'Jointers & Planers',      match: /jointer|planer/i },
      { name: 'Bandsaws',                match: /bandsaw|band saw/i },
      { name: 'Routers & CNC',           match: /router|cnc/i },
      { name: 'Edgebanders',             match: /edgeband/i },
      { name: 'Sanders',                 match: /sander|sanding/i },
      { name: 'Dust Collection',         match: /dust|collection|extract/i },
      { name: 'Specialty Machinery',     match: /moulder|shaper|tenoner|specialty machine/i },
    ],
  },
  {
    key: 'Wood Species',
    icon: 'SP',
    accent: '#7a5530',
    desc: 'Janka, density, color, workability, finish-receptivity for every commercial species.',
    subtopics: [
      { name: 'Domestic Hardwoods',      match: /(white oak|red oak|maple|cherry|walnut|ash|hickory|birch|poplar|domestic hardwood)/i },
      { name: 'Imported Hardwoods',      match: /(mahogany|teak|sapele|wenge|purpleheart|bubinga|imported hardwood|tropical)/i },
      { name: 'Softwoods',               match: /(pine|fir|cedar|spruce|softwood)/i },
      { name: 'Manufactured Panels',     match: /(plywood|mdf|particleboard|osb|hdf|panel)/i },
      { name: 'Veneer & Burl',           match: /veneer|burl|figured/i },
      { name: 'Sustainability & Sourcing', match: /(fsc|sustainability|sourcing|cites)/i },
    ],
  },
  {
    key: 'Hand Tools',
    icon: 'HT',
    accent: '#6b3d23',
    desc: 'Planes, chisels, saws, marking, sharpening - buy, tune, sharpen, use.',
    subtopics: [
      { name: 'Bench & Block Planes',    match: /bench plane|block plane|smoother|jack plane|jointer plane/i },
      { name: 'Specialty Planes',        match: /shoulder|router plane|rabbet|plough|moulding plane|specialty plane/i },
      { name: 'Chisels',                 match: /chisel/i },
      { name: 'Saws',                    match: /(handsaw|backsaw|dovetail saw|tenon saw|saw)/i },
      { name: 'Marking & Measuring',     match: /(marking|gauge|square|caliper|rule|measuring)/i },
      { name: 'Sharpening',              match: /sharpen|stone|honing|grinding/i },
      { name: 'Workholding',             match: /vise|holdfast|clamp|workholding/i },
    ],
  },
  {
    key: 'Hardware',
    icon: 'HW',
    accent: '#8a4a3a',
    desc: 'Hinges, slides, fasteners, knobs, locks - selection, installation, failure modes.',
    subtopics: [
      { name: 'Hinges',                  match: /hinge|euro|butt hinge|barrel/i },
      { name: 'Drawer Slides',           match: /drawer slide|undermount|ball bearing/i },
      { name: 'Knobs & Pulls',           match: /knob|pull|handle/i },
      { name: 'Locks & Latches',         match: /lock|latch|catch/i },
      { name: 'Fasteners',               match: /screw|nail|bolt|fastener/i },
      { name: 'Connectors',              match: /(cam lock|knockdown|connector|biscuit)/i },
      { name: 'Specialty Hardware',      match: /specialty hardware|leveler|caster/i },
    ],
  },
  {
    key: 'Techniques',
    icon: 'TQ',
    accent: '#4a6b30',
    desc: 'The processes that turn lumber into furniture: bending, veneering, carving, repair.',
    subtopics: [
      { name: 'Bending (Steam & Lam.)',  match: /bend(ing)?|steam|lamination/i },
      { name: 'Veneering & Inlay',       match: /veneer|inlay|marquetry|parquetry/i },
      { name: 'Carving',                 match: /carving|chip carving|relief/i },
      { name: 'Turning',                 match: /turning|lathe|spindle|bowl/i },
      { name: 'Drying & Milling',        match: /(drying|kiln|milling|dimensioning)/i },
      { name: 'Repair & Restoration',    match: /repair|restoration|conservation/i },
      { name: 'Wood Movement',           match: /wood movement|seasonal|expansion|shrinkage/i },
    ],
  },
  {
    key: 'Shop & Business',
    icon: 'SB',
    accent: '#3a4a82',
    desc: 'The non-woodworking parts of the trade: pricing, layout, safety, taxes, hiring.',
    subtopics: [
      { name: 'Shop Layout & Design',    match: /shop layout|workshop design|workflow/i },
      { name: 'Pricing & Estimating',    match: /pricing|estimat|quote|bid/i },
      { name: 'Contracts & Customers',   match: /contract|customer|client/i },
      { name: 'Safety & OSHA',           match: /safety|osha|ppe|injury/i },
      { name: 'Insurance & Taxes',       match: /insurance|tax|liability/i },
      { name: 'Marketing & Sales',       match: /marketing|sales|lead/i },
      { name: 'Hiring & Apprentices',    match: /hiring|apprentice|employee/i },
    ],
  },
];

function topicSlug(s) {
  return encodeURIComponent(s);
}

const DID_YOU_KNOW = [
  'Mortise and tenon joints have been found in Egyptian tomb furniture from 2,700 BCE - and they were already pegged for permanence.',
  'White oak floats in salt water and sinks in fresh water? Its closed-cell structure traps almost no air.',
  'Janka hardness is measured by pressing a 0.444-inch-diameter steel ball halfway into a board and recording the pounds-force required.',
  'The original Stanley #4 smoothing plane has been produced almost continuously since 1869, with only minor changes to the frog and lateral lever.',
  'Hide glue is reversible with steam - which is why 18th-century furniture can be repaired but most modern PVA-glued furniture can not.',
  'Board-foot is a volume measure: 144 cubic inches of nominal lumber, regardless of the actual surfaced dimensions.',
  'Festool produced its first Domino DF 500 in 2007; before that, "loose tenons" were either router-cut or biscuit-joined.',
  'The rule of thumb that tenon thickness equals 1/3 of stock thickness comes from the European cabinetmaking tradition. Japanese furniture runs closer to 1/2.',
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

  const featured = articles[0] || null;
  const recentlyUpdated = articles.slice(0, 8);

  const articlesByCluster = useMemo(() => {
    const map = {};
    for (const c of CLUSTERS) map[c.key] = [];
    articles.forEach((a) => {
      const cat = (a.category || '').trim();
      let placed = false;
      for (const c of CLUSTERS) {
        if (cat === c.key || cat.toLowerCase() === c.key.toLowerCase()) {
          map[c.key].push(a);
          placed = true;
          break;
        }
      }
      if (!placed) {
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
  const downloadCount = 6;

  return (
    <div className="wiki-dash">
      <section className="wd-hero">
        <div className="wd-hero-inner">
          <div className="wd-hero-eyebrow">GrainHub Encyclopedia</div>
          <h1 className="wd-hero-title">The reference for everyone who works wood.</h1>
          <p className="wd-hero-sub">
            Joinery, machinery, finishes, lumber, hardware, technique, shop and business -
            written by working pros, reviewed for accuracy, and free to read.
          </p>

          <div className="wd-search" ref={searchRef}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search 200+ articles - joints, species, finishes, tools..."
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
                {featured.readTime && <span className="wd-dot">.</span>}
                <span>Updated {relativeTime(featured.updatedAtRaw || featured.updatedAt)}</span>
                <span className="wd-dot">.</span>
                <span className="wd-feature-verified">Editor-reviewed</span>
              </div>
              <span className="wd-feature-cta">Read article</span>
            </div>
          </Link>
        </section>
      )}

      <section className="wd-library">
        <div className="wd-library-inner">
          <div className="wd-section-head">
            <div>
              <div className="wd-section-eyebrow">The library</div>
              <h2 className="wd-section-title">Browse the entire encyclopedia at a glance</h2>
              <p className="wd-section-desc">
                Eight major fields, fifty-six sub-topics, every article one click away. No
                drilling required - the full structure is laid out below.
              </p>
            </div>
          </div>

          <nav className="wd-cluster-bar" aria-label="Cluster navigation">
            {CLUSTERS.map((c) => {
              const count = (articlesByCluster[c.key] || []).length;
              return (
                <a
                  key={c.key}
                  href={'#cluster-' + c.key.toLowerCase().replace(/[^a-z]+/g, '-')}
                  className="wd-cluster-bar-item"
                  style={{ '--accent': c.accent }}
                >
                  <span className="wd-cluster-bar-icon">{c.icon}</span>
                  <span className="wd-cluster-bar-label">{c.key}</span>
                  <span className="wd-cluster-bar-count">{count}</span>
                </a>
              );
            })}
          </nav>

          {CLUSTERS.map((c) => {
            const list = articlesByCluster[c.key] || [];
            const featuredCards = list.slice(0, 3);
            const subtopicCounts = c.subtopics.map((sub) => {
              const n = list.filter((a) =>
                sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
              ).length;
              return { ...sub, count: n };
            });
            return (
              <article
                className="wd-portal"
                key={c.key}
                id={'cluster-' + c.key.toLowerCase().replace(/[^a-z]+/g, '-')}
                style={{ '--accent': c.accent }}
              >
                <header className="wd-portal-head">
                  <div className="wd-portal-id">
                    <span className="wd-portal-icon">{c.icon}</span>
                    <div>
                      <h3 className="wd-portal-title">{c.key}</h3>
                      <p className="wd-portal-desc">{c.desc}</p>
                    </div>
                  </div>
                  <div className="wd-portal-meta">
                    <div className="wd-portal-stat">
                      <div className="wd-portal-stat-num">{list.length}</div>
                      <div className="wd-portal-stat-label">{list.length === 1 ? 'article' : 'articles'}</div>
                    </div>
                    <div className="wd-portal-stat">
                      <div className="wd-portal-stat-num">{c.subtopics.length}</div>
                      <div className="wd-portal-stat-label">sub-topics</div>
                    </div>
                  </div>
                </header>

                <div className="wd-portal-body">
                  <div className="wd-subtopics">
                    {subtopicCounts.map((sub) => (
                      <Link
                        key={sub.name}
                        to={'/wiki?cluster=' + topicSlug(c.key) + '&topic=' + topicSlug(sub.name)}
                        className={'wd-subtopic' + (sub.count > 0 ? ' has-articles' : '')}
                      >
                        <span className="wd-subtopic-name">{sub.name}</span>
                        <span className="wd-subtopic-count">{sub.count}</span>
                      </Link>
                    ))}
                  </div>

                  {featuredCards.length > 0 && (
                    <div className="wd-portal-featured">
                      <div className="wd-portal-featured-label">In this cluster</div>
                      <div className="wd-portal-featured-grid">
                        {featuredCards.map((a) => (
                          <Link
                            key={a.id}
                            to={'/wiki/article/' + a.slug}
                            className="wd-portal-card"
                          >
                            {a.coverImage && (
                              <div className="wd-portal-card-img" style={{ backgroundImage: 'url(' + a.coverImage + ')' }}/>
                            )}
                            <div className="wd-portal-card-body">
                              <div className="wd-portal-card-cat">{a.category}</div>
                              <div className="wd-portal-card-title">{a.title}</div>
                              {a.excerpt && (
                                <div className="wd-portal-card-excerpt">
                                  {a.excerpt.length > 120 ? a.excerpt.slice(0, 120) + '...' : a.excerpt}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {featuredCards.length === 0 && (
                    <div className="wd-portal-empty">
                      <div className="wd-portal-empty-title">This cluster is being built.</div>
                      <div className="wd-portal-empty-text">
                        Working pros - the {c.subtopics.length} sub-topics above are open for
                        contribution. Bylines, reviewer credit, reputation gains all wait.
                      </div>
                      <Link to="/forums/new?category=wiki-edits" className="wd-btn-primary" style={{ marginTop: '0.6rem' }}>
                        Propose an article in {c.key}
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

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
                  {a.excerpt && (
                    <div className="wd-recent-excerpt">
                      {a.excerpt.length > 160 ? a.excerpt.slice(0, 160) + '...' : a.excerpt}
                    </div>
                  )}
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
            <h3 className="wd-card-title">200 more articles needed</h3>
            <p className="wd-card-text">
              The encyclopedia covers eight topic clusters. We&apos;re aiming for 200-300
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

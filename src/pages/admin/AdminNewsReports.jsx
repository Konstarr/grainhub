import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { supabase } from '../../lib/supabase.js';
import { listNewsArticles } from '../../lib/adminDb.js';

/**
 * /admin/news/reports — content performance dashboard.
 *
 * Three data sources (all server-side, admin-only):
 *   - news_views_by_day(days)     → daily view events for the chart
 *   - news_views_by_category()    → lifetime views grouped by category
 *   - listNewsArticles()          → the article table for the Top-10
 *                                   list + stats cards
 *
 * Everything renders in pure SVG / CSS — no chart-library dependency.
 */
export default function AdminNewsReports() {
  const [windowDays, setWindowDays] = useState(30);
  const [daily,     setDaily]     = useState([]);       // [{day, views}]
  const [byCat,     setByCat]     = useState([]);       // [{category, articles, views}]
  const [articles,  setArticles]  = useState([]);       // full article list
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const [a, b, c] = await Promise.all([
        supabase.rpc('news_views_by_day',      { days: windowDays }),
        supabase.rpc('news_views_by_category', {}),
        listNewsArticles({ search: '' }),
      ]);
      if (cancelled) return;
      if (a.error || b.error || c.error) {
        setErr(
          'Could not load analytics — make sure migration-news-analytics.sql ' +
          'has been run. (' + (a.error?.message || b.error?.message || c.error?.message) + ')'
        );
      }
      setDaily   ((a.data || []).map((r) => ({ day: r.day, views: Number(r.views || 0) })));
      setByCat   ((b.data || []).map((r) => ({ ...r, articles: Number(r.articles || 0), views: Number(r.views || 0) })));
      setArticles(c.data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [windowDays]);

  // Top-level stats
  const stats = useMemo(() => {
    const totalArticles = articles.length;
    const published     = articles.filter((r) => r.is_published).length;
    const totalViews    = articles.reduce((s, r) => s + (Number(r.view_count) || 0), 0);
    const avgViews      = published > 0 ? totalViews / published : 0;
    const viewsInWindow = daily.reduce((s, r) => s + r.views, 0);
    const bestDay       = daily.reduce((best, r) => (r.views > (best?.views ?? -1) ? r : best), null);
    return { totalArticles, published, totalViews, avgViews, viewsInWindow, bestDay };
  }, [articles, daily]);

  // Top 10 most-viewed articles
  const topArticles = useMemo(() => {
    return [...articles]
      .filter((r) => r.is_published)
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10);
  }, [articles]);

  return (
    <AdminLayout
      title="News reports"
      subtitle={loading ? 'Loading…' : `${fmtNum(stats.totalViews)} total lifetime views · ${fmtNum(stats.viewsInWindow)} in the last ${windowDays} days`}
      actions={
        <>
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="adm-btn"
            style={{ paddingRight: 24 }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Link to="/admin/news" className="adm-btn">← Back to articles</Link>
        </>
      }
    >
      {err && <div className="adm-error" style={{ marginBottom: 16 }}>{err}</div>}

      {/* ───── Stat cards ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label={`Views · last ${windowDays}d`} value={fmtNum(stats.viewsInWindow)} accent="#2D6A4F" />
        <StatCard label="Lifetime views"                 value={fmtNum(stats.totalViews)} />
        <StatCard label="Avg views / article"           value={fmtNum(Math.round(stats.avgViews))} accent="#1B4332" />
        <StatCard
          label="Best day"
          value={stats.bestDay?.views ? fmtNum(stats.bestDay.views) : '—'}
          sub={stats.bestDay?.day ? fmtShortDate(stats.bestDay.day) : ''}
          accent="#8B5E08"
        />
      </div>

      {/* ───── Daily views line chart ───── */}
      <div className="adm-card" style={{ padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div style={sectionTitleStyle}>
          <span>Views over time</span>
          <span style={mutedStyle}>last {windowDays} days · daily</span>
        </div>
        {daily.length === 0 ? (
          <div style={{ padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
            No view data yet for this window.
          </div>
        ) : (
          <LineChart data={daily} />
        )}
      </div>

      {/* ───── By category + Top articles side by side ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={sectionTitleStyle}>
            <span>Views by category</span>
            <span style={mutedStyle}>lifetime</span>
          </div>
          {byCat.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
              No category data yet.
            </div>
          ) : (
            <CategoryBars rows={byCat} />
          )}
        </div>

        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={sectionTitleStyle}>
            <span>Top articles</span>
            <span style={mutedStyle}>by lifetime views</span>
          </div>
          {topArticles.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
              No published articles yet.
            </div>
          ) : (
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
              {topArticles.map((r, idx) => (
                <li key={r.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '22px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: idx < topArticles.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'var(--wood-warm)', fontSize: 13 }}>
                    {idx + 1}
                  </span>
                  <Link
                    to={'/admin/news/' + r.id}
                    style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={r.title}
                  >
                    {r.title}
                  </Link>
                  <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtNum(r.view_count || 0)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

/* ═════════════════ Helpers ═════════════════ */

function fmtNum(n) { return Number(n || 0).toLocaleString(); }
function fmtShortDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  marginBottom: 10,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const mutedStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.2,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="adm-card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 24,
        fontWeight: 700,
        color: accent || 'var(--text-primary)',
        marginTop: 2,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ─── SVG line chart ────────────────────────────────────────── */
function LineChart({ data }) {
  const W = 800;
  const H = 220;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 28;

  const max = Math.max(1, ...data.map((d) => d.views));
  // nice round max for the y-axis (1, 2, 5, 10, 20, 50, 100...)
  const niceMax = niceCeil(max);
  const xStep = data.length > 1 ? (W - padL - padR) / (data.length - 1) : 0;
  const yScale = (v) => padT + (H - padT - padB) * (1 - v / niceMax);

  const points = data.map((d, i) => ({ x: padL + i * xStep, y: yScale(d.views), ...d }));
  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
  const areaD = points.length
    ? 'M' + points[0].x + ' ' + (H - padB) + ' L' +
      points.map((p) => p.x + ' ' + p.y).join(' L') +
      ' L' + points[points.length - 1].x + ' ' + (H - padB) + ' Z'
    : '';

  // Y-axis gridlines at 0, 25%, 50%, 75%, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  // X-axis labels — show start, middle, end (or every N for longer spans)
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2D6A4F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y ticks */}
        {ticks.map((t, i) => {
          const y = yScale(t);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E8DFCB" strokeWidth="1" />
              <text x={padL - 6} y={y + 3} fontSize="10" textAnchor="end" fill="#9A8070">{t}</text>
            </g>
          );
        })}

        {/* x labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text
              key={d.day}
              x={padL + i * xStep}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              fill="#9A8070"
            >
              {fmtShortDate(d.day)}
            </text>
          ) : null
        )}

        {/* filled area */}
        {areaD && <path d={areaD} fill="url(#viewsAreaGrad)" />}

        {/* line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#1F4534"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* dots */}
        {points.map((p) => (
          <circle key={p.day} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#1F4534" strokeWidth="1.5">
            <title>{fmtShortDate(p.day)}: {p.views} views</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function niceCeil(n) {
  if (n <= 1) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const frac = n / mag;
  let nice;
  if      (frac <= 1)  nice = 1;
  else if (frac <= 2)  nice = 2;
  else if (frac <= 5)  nice = 5;
  else                 nice = 10;
  return nice * mag;
}

/* ─── Horizontal category bars ──────────────────────────────── */
function CategoryBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map((r) => {
        const pct = Math.round((r.views / max) * 100);
        return (
          <div key={r.category}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              fontSize: 12,
              marginBottom: 4,
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.category}</span>
              <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {fmtNum(r.views)} views · {fmtNum(r.articles)} article{r.articles === 1 ? '' : 's'}
              </span>
            </div>
            <div style={{
              height: 8,
              background: '#F0E5CF',
              borderRadius: 999,
              overflow: 'hidden',
            }}>
              <div style={{
                width: pct + '%',
                height: '100%',
                background: 'linear-gradient(90deg, #2D5A3D 0%, #2D6A4F 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

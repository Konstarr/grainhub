import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listNewsArticles, deleteNewsArticle, updateNewsArticle } from '../../lib/adminDb.js';

/**
 * /admin/news — list view of all news articles with:
 *   - top-of-page stats (total, published, drafts, total views, top article)
 *   - columns for Title / Author / Status / Category / Views / Created / Updated / Actions
 *   - column sorting, search by title, inline publish toggle + delete
 */

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  const now = Date.now();
  const diff = now - dt.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / (60 * 60 * 1000)));
    return hours + 'h ago';
  }
  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return days + 'd ago';
  }
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString();
}

export default function AdminNews() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [sort, setSort] = useState({ col: 'created_at', dir: 'desc' });

  const load = async (q) => {
    setLoading(true);
    setError(null);
    const { data, error } = await listNewsArticles({ search: q || '' });
    if (error) setError(error.message || 'Failed to load articles');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleTogglePublished = async (row) => {
    setBusyId(row.id);
    const { data, error } = await updateNewsArticle(row.id, { is_published: !row.is_published });
    if (error) {
      alert('Could not update: ' + (error.message || 'unknown'));
    } else if (data) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...data } : r)));
    }
    setBusyId(null);
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete "' + row.title + '"? This cannot be undone.')) return;
    setBusyId(row.id);
    const { error } = await deleteNewsArticle(row.id);
    if (error) {
      alert('Could not delete: ' + (error.message || 'unknown'));
    } else {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
    setBusyId(null);
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const published = rows.filter((r) => r.is_published).length;
    const drafts = rows.filter((r) => !r.is_published).length;
    const totalViews = rows.reduce((s, r) => s + (Number(r.view_count) || 0), 0);
    const top = rows.reduce(
      (best, r) => ((r.view_count || 0) > (best.view_count || 0) ? r : best),
      { view_count: -1, title: null },
    );
    const topArticle = top && top.title ? top : null;
    return { total, published, drafts, totalViews, topArticle };
  }, [rows]);

  const sortedRows = useMemo(() => {
    const cmp = (a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      const ak = a[sort.col];
      const bk = b[sort.col];
      if (sort.col === 'author') {
        const an = (a.author?.full_name || a.author?.username || '').toLowerCase();
        const bn = (b.author?.full_name || b.author?.username || '').toLowerCase();
        return an < bn ? -1 * dir : an > bn ? 1 * dir : 0;
      }
      if (sort.col === 'view_count') return ((a.view_count || 0) - (b.view_count || 0)) * dir;
      if (sort.col === 'title') return String(ak || '').localeCompare(String(bk || '')) * dir;
      // dates
      const av = ak ? new Date(ak).getTime() : 0;
      const bv = bk ? new Date(bk).getTime() : 0;
      return (av - bv) * dir;
    };
    return [...rows].sort(cmp);
  }, [rows, sort]);

  const toggleSort = (col) => {
    setSort((s) => (s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' }));
  };

  const sortArrow = (col) => (sort.col !== col ? '' : sort.dir === 'asc' ? ' ↑' : ' ↓');

  return (
    <AdminLayout
      title="News articles"
      subtitle={loading ? 'Loading…' : `${stats.total} total · ${stats.published} published · ${stats.drafts} draft`}
      actions={
        <>
          <Link to="/admin/news/reports" className="adm-btn">
            📊 Reports
          </Link>
          <Link to="/admin/news/new" className="adm-btn primary">
            + New article
          </Link>
        </>
      }
    >
      {/* ---------- Stats strip ---------- */}
      <div className="adm-stat-strip" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        <StatCard label="Total articles" value={fmtNum(stats.total)} />
        <StatCard label="Published"      value={fmtNum(stats.published)} accent="#2D5016" />
        <StatCard label="Drafts"         value={fmtNum(stats.drafts)} accent="#8B5E08" />
        <StatCard label="Total views"    value={fmtNum(stats.totalViews)} accent="#A0522D" />
      </div>

      {stats.topArticle && (
        <div className="adm-card" style={{
          padding: '0.85rem 1.1rem',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderLeft: '3px solid var(--wood-warm)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Top article
          </span>
          <Link
            to={'/admin/news/' + stats.topArticle.id}
            style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            {stats.topArticle.title}
          </Link>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            {fmtNum(stats.topArticle.view_count)} views
          </span>
        </div>
      )}

      {/* ---------- Search ---------- */}
      <div className="adm-card" style={{ padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div className="adm-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
            <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >×</button>
          )}
        </div>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ---------- Table ---------- */}
      <div className="adm-card" style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading articles…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No articles yet.</strong>
            <div style={{ marginTop: 6 }}>
              <Link to="/admin/news/new" className="adm-btn primary" style={{ textDecoration: 'none' }}>
                + Write your first article
              </Link>
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <Th col="title"        sort={sort} onClick={toggleSort}>Title</Th>
                <Th col="author"       sort={sort} onClick={toggleSort} width={140}>Author</Th>
                <Th col="is_published" sort={sort} onClick={toggleSort} width={100}>Status</Th>
                <Th col="category"     sort={sort} onClick={toggleSort} width={110}>Category</Th>
                <Th col="view_count"   sort={sort} onClick={toggleSort} width={80}  align="right">Views</Th>
                <Th col="created_at"   sort={sort} onClick={toggleSort} width={110}>Created</Th>
                <Th col="updated_at"   sort={sort} onClick={toggleSort} width={110}>Updated</Th>
                <th style={{ width: 220, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => {
                const authorName = r.author?.full_name || r.author?.username || '—';
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-row-title">
                        <strong>{r.title}</strong>
                        <span>{r.slug}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {authorName}
                    </td>
                    <td>
                      <span className={'adm-pill ' + (r.is_published ? 'pub' : 'draft')}>
                        {r.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.category || '—'}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {fmtNum(r.view_count)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{fmtDate(r.created_at)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{fmtDate(r.updated_at || r.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => handleTogglePublished(r)}
                          disabled={busyId === r.id}
                        >
                          {r.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => navigate('/admin/news/' + r.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn danger"
                          onClick={() => handleDelete(r)}
                          disabled={busyId === r.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, accent }) {
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
    </div>
  );
}

function Th({ col, sort, onClick, children, width, align = 'left' }) {
  const active = sort.col === col;
  return (
    <th
      onClick={() => onClick(col)}
      style={{
        width,
        textAlign: align,
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? 'var(--text-primary)' : undefined,
      }}
    >
      {children}
      {active && (sort.dir === 'asc' ? ' ↑' : ' ↓')}
    </th>
  );
}

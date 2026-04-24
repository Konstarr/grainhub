import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listNewsArticles, deleteNewsArticle, updateNewsArticle } from '../../lib/adminDb.js';

/**
 * /admin/news — list view of all news articles with inline publish toggle,
 * quick delete, and a "New article" button. Search filters by title.
 */
export default function AdminNews() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

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

  const counts = useMemo(() => ({
    total: rows.length,
    published: rows.filter((r) => r.is_published).length,
    drafts: rows.filter((r) => !r.is_published).length,
  }), [rows]);

  return (
    <AdminLayout
      title="News articles"
      subtitle={loading ? 'Loading…' : `${counts.total} total · ${counts.published} published · ${counts.drafts} draft`}
      actions={
        <>
          <Link to="/admin/news/new" className="adm-btn primary">
            + New article
          </Link>
        </>
      }
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

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
                <th>Title</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 140 }}>Category</th>
                <th style={{ width: 140 }}>Updated</th>
                <th style={{ width: 260, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dt = r.published_at || r.created_at;
                const when = dt ? new Date(dt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-row-title">
                        <strong>{r.title}</strong>
                        <span>{r.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className={'adm-pill ' + (r.is_published ? 'pub' : 'draft')}>
                        {r.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.category || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{when}</td>
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

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listWikiArticles, deleteWikiArticle, updateWikiArticle, createWikiArticle } from '../../lib/adminDb.js';
import { CLUSTERS } from '../../data/wikiTaxonomy.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminWiki() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    const { data, error } = await listWikiArticles({ search, category: categoryFilter, limit: 500 });
    if (error) setErr(error.message || 'Failed to load articles');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* initial */ }, []);
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  const togglePublished = async (row) => {
    setBusyId(row.id);
    const { data, error } = await updateWikiArticle(row.id, {
      is_published: !row.is_published,
      published_at: !row.is_published ? new Date().toISOString() : null,
    });
    setBusyId(null);
    if (error) { alert('Could not update: ' + (error.message || 'unknown')); return; }
    if (data) setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...data } : r)));
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setBusyId(row.id);
    const { error } = await deleteWikiArticle(row.id);
    setBusyId(null);
    if (error) { alert('Delete failed: ' + (error.message || 'unknown')); return; }
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  };

  const handleNew = async () => {
    const title = window.prompt('New article title:');
    if (!title || !title.trim()) return;
    const slug = title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    const { data, error } = await createWikiArticle({
      title: title.trim(),
      slug: slug + '-' + Math.random().toString(36).slice(2, 6),
      category: CLUSTERS[0].key,
      excerpt: '',
      body: '',
      is_published: false,
    });
    if (error) { alert('Create failed: ' + (error.message || 'unknown')); return; }
    if (data?.id) navigate('/admin/wiki/' + data.id);
  };

  const counts = useMemo(() => ({
    total: rows.length,
    published: rows.filter((r) => r.is_published).length,
    drafts: rows.filter((r) => !r.is_published).length,
    totalViews: rows.reduce((a, r) => a + (r.view_count || 0), 0),
  }), [rows]);

  return (
    <AdminLayout
      title="Wiki articles"
      subtitle={loading
        ? 'Loading…'
        : `${counts.total} articles · ${counts.published} published · ${counts.drafts} drafts · ${counts.totalViews.toLocaleString()} total views`}
      actions={(
        <button type="button" className="claim-btn primary" onClick={handleNew}>
          + New article
        </button>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <KpiTile label="Articles" value={counts.total} />
        <KpiTile label="Published" value={counts.published} accent="green" />
        <KpiTile label="Drafts" value={counts.drafts} accent="amber" />
        <KpiTile label="Total views" value={counts.totalViews} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search title, slug, category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 320px', minWidth: 240, padding: 9, border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: 9, border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }}
        >
          <option value="">All fields</option>
          {[...CLUSTERS].sort((a, b) => a.key.localeCompare(b.key)).map((c) => (
            <option key={c.key} value={c.key}>{c.key}</option>
          ))}
        </select>
      </div>

      {err && <div className="claim-error" style={{ marginBottom: 16 }}>{err}</div>}

      {loading && rows.length === 0 ? (
        <div style={{ padding: 32, color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 32, color: 'var(--text-muted)', textAlign: 'center', background: '#FFF8EE', border: '1px dashed var(--border-light)', borderRadius: 10 }}>
          No articles match these filters.
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title / Slug</th>
                <th style={{ width: 180 }}>Field</th>
                <th style={{ width: 90 }}>Status</th>
                <th style={{ width: 80, textAlign: 'right' }}>Views</th>
                <th style={{ width: 110 }}>Updated</th>
                <th style={{ width: 240, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{r.slug}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.category || '—'}</td>
                  <td>
                    <span className={'adm-pill ' + (r.is_published ? 'adm-pill-green' : 'adm-pill-amber')}>
                      {r.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {(r.view_count || 0).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button type="button" className="claim-btn ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                        disabled={busyId === r.id}
                        onClick={() => togglePublished(r)}>
                        {r.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link to={'/admin/wiki/' + r.id} className="claim-btn primary" style={{ padding: '5px 10px', fontSize: 12 }}>
                        Edit
                      </Link>
                      <button type="button" className="claim-btn ghost" style={{ padding: '5px 10px', fontSize: 12, color: '#9B2222' }}
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

function KpiTile({ label, value, accent }) {
  const palette = accent === 'green' ? { bg: '#DDEFD3', fg: '#2E6F2E' }
                : accent === 'amber' ? { bg: '#F5EAD6', fg: '#2D5A3D' }
                : { bg: '#fff', fg: '#1c1c1c' };
  return (
    <div style={{
      background: palette.bg, color: palette.fg,
      border: '1px solid var(--border-light, #DDE5D8)',
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {(value || 0).toLocaleString()}
      </div>
    </div>
  );
}

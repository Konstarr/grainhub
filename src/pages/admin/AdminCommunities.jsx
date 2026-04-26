import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { adminListCommunities } from '../../lib/communityAdminDb.js';

/** /admin/communities — site-wide list of every community, search + open. */
export default function AdminCommunities() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const load = async (q) => {
    setLoading(true); setError(null);
    const { data, error } = await adminListCommunities({ search: q || '' });
    if (error) setError(error.message || 'Failed to load communities');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <AdminLayout
      title="Communities"
      subtitle={loading ? 'Loading...' : `${rows.length} ${rows.length === 1 ? 'community' : 'communities'}`}
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div className="adm-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
            <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, slug, or description..."
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

      <div className="adm-card" style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading communities...</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No communities match.</strong>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Community</th>
                <th style={{ width: 100 }}>Members</th>
                <th style={{ width: 100 }}>Visibility</th>
                <th style={{ width: 130 }}>Created</th>
                <th style={{ width: 200, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="adm-row-title">
                      <strong>
                        <Link to={'/c/' + r.slug} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                          {r.name}
                        </Link>
                      </strong>
                      <span>/{r.slug}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.member_count || 0}</td>
                  <td>
                    <span className={'adm-pill ' + (r.is_public ? 'pub' : 'draft')}>
                      {r.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{fmtDate(r.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="adm-btn primary"
                      onClick={() => navigate('/admin/communities/' + r.id)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listProfiles } from '../../lib/adminDb.js';

/**
 * /admin/users — searchable list of all profiles. Clicking a row opens
 * the per-user edit page with all permission / sponsor controls.
 */
export default function AdminUsers() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'individual' | 'business'
  const [error, setError] = useState(null);

  const load = async (q, type) => {
    setLoading(true);
    setError(null);
    const { data, error } = await listProfiles({ search: q || '', accountType: type || null });
    if (error) setError(error.message || 'Failed to load users');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load('', ''); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search, typeFilter), 250);
    return () => clearTimeout(t);
  }, [search, typeFilter]);

  const counts = {
    individual: rows.filter((r) => r.account_type === 'individual').length,
    business:   rows.filter((r) => r.account_type === 'business').length,
  };

  return (
    <AdminLayout
      title="Users"
      subtitle={loading
        ? 'Loading…'
        : `${rows.length} shown · ${counts.individual} individual · ${counts.business} business`}
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="adm-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, username or company…"
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
          <div style={{ display: 'inline-flex', gap: 0, border: '1px solid var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            {[
              { key: '',           label: 'All' },
              { key: 'individual', label: 'Individuals' },
              { key: 'business',   label: 'Businesses' },
            ].map((t) => (
              <button
                key={t.key || 'all'}
                type="button"
                onClick={() => setTypeFilter(t.key)}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 500,
                  background: typeFilter === t.key ? 'var(--wood-warm)' : 'var(--white)',
                  color: typeFilter === t.key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card" style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading users…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No users found.</strong>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th style={{ width: 110 }}>Type</th>
                <th style={{ width: 110 }}>Role</th>
                <th style={{ width: 140 }}>Sponsor</th>
                <th style={{ width: 160 }}>Flags</th>
                <th style={{ width: 130 }}>Joined</th>
                <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const initials = (p.full_name || p.username || '??')
                  .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users/' + p.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: p.avatar_url ? 'url(' + p.avatar_url + ') center/cover no-repeat' : 'linear-gradient(135deg, #4A2A12, #A0642B)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, letterSpacing: '0.5px', flexShrink: 0,
                        }}>
                          {!p.avatar_url && initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.account_type === 'business'
                              ? (p.business_name || p.full_name || p.username)
                              : (p.full_name || p.username)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            @{p.username} {p.trade ? '· ' + p.trade : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="adm-pill"
                        style={{
                          textTransform: 'capitalize',
                          background: p.account_type === 'business' ? '#E6F1FB' : 'var(--wood-cream, #FBF6EC)',
                          color:      p.account_type === 'business' ? '#185FA5' : 'var(--text-secondary)',
                          border:     '1px solid ' + (p.account_type === 'business' ? '#BFDCEF' : 'var(--border)'),
                        }}
                      >
                        {p.account_type || 'individual'}
                      </span>
                    </td>
                    <td>
                      <span className={'adm-pill ' + (p.role === 'owner' || p.role === 'admin' ? 'pub' : 'draft')}
                            style={{ textTransform: 'capitalize' }}>
                        {p.role}
                      </span>
                    </td>
                    <td>
                      {p.sponsor_tier
                        ? <span className="adm-pill pub" style={{ textTransform: 'capitalize' }}>{p.sponsor_tier}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>—</span>}
                    </td>
                    <td style={{ fontSize: 11.5 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.is_verified   && <span className="adm-pill pub">Verified</span>}
                        {p.is_suspended  && <span className="adm-pill draft" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>Suspended</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <Link to={'/admin/users/' + p.id} className="adm-btn">Edit</Link>
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

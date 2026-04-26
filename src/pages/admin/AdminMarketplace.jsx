import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  adminListListings,
  adminToggleListingApproval,
  adminDeleteListing,
} from '../../lib/marketplaceAdminDb.js';

/**
 * /admin/listings — admin index of every marketplace listing across the
 * platform, with status filter, search, and per-row Edit / Unpublish
 * (or Approve) / Delete. Mods and admins both see this.
 */
const STATUS_TABS = [
  { value: 'all',     label: 'All' },
  { value: 'live',    label: 'Live' },
  { value: 'sold',    label: 'Sold' },
  { value: 'pending', label: 'Unpublished' },
];

export default function AdminMarketplace() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async (q, s) => {
    setLoading(true);
    setError(null);
    const { data, error } = await adminListListings({ search: q || '', status: s || 'all' });
    if (error) setError(error.message || 'Failed to load listings');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load('', status); /* eslint-disable-next-line */ }, [status]);
  useEffect(() => {
    const t = setTimeout(() => load(search, status), 250);
    return () => clearTimeout(t);
  }, [search, status]);

  const handleToggleApproved = async (row) => {
    setBusyId(row.id);
    const { data, error } = await adminToggleListingApproval(row.id, !row.is_approved);
    if (error) {
      alert('Could not update: ' + (error.message || 'unknown'));
    } else if (data) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...data } : r)));
    }
    setBusyId(null);
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete "' + row.title + '"? This permanently removes it for everyone.')) return;
    setBusyId(row.id);
    const { error } = await adminDeleteListing(row.id);
    if (error) {
      alert('Could not delete: ' + (error.message || 'unknown'));
    } else {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
    setBusyId(null);
  };

  const counts = useMemo(() => ({
    total: rows.length,
    live:  rows.filter((r) => r.is_approved && !r.is_sold).length,
    sold:  rows.filter((r) => r.is_sold).length,
    pend:  rows.filter((r) => !r.is_approved).length,
  }), [rows]);

  const fmtPrice = (r) => {
    if (r.price == null) return '—';
    const sym = r.currency === 'EUR' ? '€' : r.currency === 'GBP' ? '£' : '$';
    return sym + Number(r.price).toLocaleString();
  };
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <AdminLayout
      title="Marketplace listings"
      subtitle={loading
        ? 'Loading…'
        : `${counts.total} shown · ${counts.live} live · ${counts.sold} sold · ${counts.pend} unpublished`}
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setStatus(t.value)}
              className={'adm-btn' + (status === t.value ? ' primary' : '')}
              style={{ fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="adm-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
            <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, description, or location…"
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
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading listings…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No listings match.</strong>
            <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
              Try a different status tab or clear the search.
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th style={{ width: 140 }}>Seller</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 130 }}>Category</th>
                <th style={{ width: 110 }}>Price</th>
                <th style={{ width: 110 }}>Posted</th>
                <th style={{ width: 280, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sellerName = r.seller?.business_name || r.seller?.full_name || r.seller?.username || '—';
                const statusLabel = r.is_sold
                  ? { label: 'Sold', cls: 'draft' }
                  : (r.is_approved ? { label: 'Live', cls: 'pub' } : { label: 'Unpublished', cls: 'draft' });
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-row-title">
                        <strong>
                          <Link to={'/marketplace/listing/' + r.slug} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                            {r.title}
                          </Link>
                        </strong>
                        <span>{r.slug}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {r.seller?.username
                        ? <Link to={'/admin/users/' + r.seller_id} style={{ color: 'inherit' }}>{sellerName}</Link>
                        : sellerName}
                    </td>
                    <td>
                      <span className={'adm-pill ' + statusLabel.cls}>{statusLabel.label}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {r.category || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtPrice(r)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{fmtDate(r.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => handleToggleApproved(r)}
                          disabled={busyId === r.id}
                          title={r.is_approved ? 'Hide from public marketplace' : 'Re-publish to public marketplace'}
                        >
                          {r.is_approved ? 'Unpublish' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => navigate('/admin/listings/' + r.id)}
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

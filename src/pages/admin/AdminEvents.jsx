import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listEvents, deleteEvent, updateEvent } from '../../lib/adminDb.js';

/**
 * /admin/events — list of all events. Publish/unpublish toggles the
 * is_approved flag so the event shows up on the public /events page.
 */
export default function AdminEvents() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async (q) => {
    setLoading(true);
    setError(null);
    const { data, error } = await listEvents({ search: q || '' });
    if (error) setError(error.message || 'Failed to load events');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggleApproved = async (row) => {
    setBusyId(row.id);
    const { data, error } = await updateEvent(row.id, { is_approved: !row.is_approved });
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
    const { error } = await deleteEvent(row.id);
    if (error) {
      alert('Could not delete: ' + (error.message || 'unknown'));
    } else {
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    }
    setBusyId(null);
  };

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      total: rows.length,
      approved: rows.filter((r) => r.is_approved).length,
      drafts: rows.filter((r) => !r.is_approved).length,
      upcoming: rows.filter((r) => new Date(r.start_date).getTime() >= now).length,
    };
  }, [rows]);

  return (
    <AdminLayout
      title="Events"
      subtitle={loading
        ? 'Loading…'
        : `${counts.total} total · ${counts.upcoming} upcoming · ${counts.approved} approved · ${counts.drafts} draft`}
      actions={<Link to="/admin/events/new" className="adm-btn primary">+ New event</Link>}
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
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

      <div className="adm-card" style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading events…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No events yet.</strong>
            <div style={{ marginTop: 6 }}>
              <Link to="/admin/events/new" className="adm-btn primary" style={{ textDecoration: 'none' }}>
                + Create your first event
              </Link>
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 120 }}>Type</th>
                <th style={{ width: 160 }}>When</th>
                <th style={{ width: 140 }}>Where</th>
                <th style={{ width: 240, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const start = r.start_date ? new Date(r.start_date) : null;
                const end = r.end_date ? new Date(r.end_date) : null;
                const fmt = (d) => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                const when = start ? (end && start.toDateString() !== end.toDateString() ? fmt(start) + ' → ' + fmt(end) : fmt(start)) : '—';
                const where = r.is_online ? 'Online' : (r.location || r.venue_name || '—');
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-row-title">
                        <strong>{r.title}</strong>
                        <span>{r.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className={'adm-pill ' + (r.is_approved ? 'pub' : 'draft')}>
                        {r.is_approved ? 'Approved' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {r.event_type || '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{when}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{where}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => handleToggleApproved(r)}
                          disabled={busyId === r.id}
                        >
                          {r.is_approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="adm-btn"
                          onClick={() => navigate('/admin/events/' + r.id)}
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

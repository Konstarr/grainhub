import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { listJobs, deleteJob, updateJob } from '../../lib/adminDb.js';

/**
 * /admin/jobs — all jobs with quick approve/unapprove + fill/unfill toggles.
 * Approved + not-filled jobs are the ones that appear on the public /jobs page.
 */
export default function AdminJobs() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async (q) => {
    setLoading(true);
    setError(null);
    const { data, error } = await listJobs({ search: q || '' });
    if (error) setError(error.message || 'Failed to load jobs');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const toggle = async (row, field) => {
    setBusyId(row.id);
    const { data, error } = await updateJob(row.id, { [field]: !row[field] });
    if (error) alert('Could not update: ' + (error.message || 'unknown'));
    else if (data) setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, ...data } : r));
    setBusyId(null);
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete "' + row.title + '"? This cannot be undone.')) return;
    setBusyId(row.id);
    const { error } = await deleteJob(row.id);
    if (error) alert('Could not delete: ' + (error.message || 'unknown'));
    else setRows((rs) => rs.filter((r) => r.id !== row.id));
    setBusyId(null);
  };

  const counts = useMemo(() => ({
    total: rows.length,
    approved: rows.filter((r) => r.is_approved).length,
    drafts: rows.filter((r) => !r.is_approved).length,
    filled: rows.filter((r) => r.is_filled).length,
  }), [rows]);

  return (
    <AdminLayout
      title="Jobs"
      subtitle={loading
        ? 'Loading…'
        : `${counts.total} total · ${counts.approved} approved · ${counts.drafts} draft · ${counts.filled} filled`}
      actions={<Link to="/admin/jobs/new" className="adm-btn primary">+ Post a job</Link>}
    >
      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div className="adm-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
            <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, company or location…"
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
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading jobs…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            <strong>No jobs yet.</strong>
            <div style={{ marginTop: 6 }}>
              <Link to="/admin/jobs/new" className="adm-btn primary" style={{ textDecoration: 'none' }}>+ Post the first job</Link>
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title / Company</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 120 }}>Type</th>
                <th style={{ width: 150 }}>Location</th>
                <th style={{ width: 130 }}>Posted</th>
                <th style={{ width: 260, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const posted = r.posted_at
                  ? new Date(r.posted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="adm-row-title">
                        <strong>{r.title}</strong>
                        <span>{r.company}</span>
                      </div>
                    </td>
                    <td>
                      {r.is_filled ? (
                        <span className="adm-pill draft">Filled</span>
                      ) : (
                        <span className={'adm-pill ' + (r.is_approved ? 'pub' : 'draft')}>
                          {r.is_approved ? 'Approved' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {(r.employment_type || '—').replace('-', ' ')}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.location || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{posted}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button type="button" className="adm-btn" onClick={() => toggle(r, 'is_approved')} disabled={busyId === r.id}>
                          {r.is_approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button type="button" className="adm-btn" onClick={() => toggle(r, 'is_filled')} disabled={busyId === r.id}>
                          {r.is_filled ? 'Mark open' : 'Mark filled'}
                        </button>
                        <button type="button" className="adm-btn" onClick={() => navigate('/admin/jobs/' + r.id)}>
                          Edit
                        </button>
                        <button type="button" className="adm-btn danger" onClick={() => handleDelete(r)} disabled={busyId === r.id}>
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

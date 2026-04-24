import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listConnectionsAdmin,
  adminForceConnect,
  adminUpdateConnection,
  adminDeleteConnection,
  searchProfiles,
} from '../../lib/adminDb.js';

function initials(p) {
  const name = p?.business_name || p?.full_name || p?.username || '??';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
function displayName(p) { return p?.business_name || p?.full_name || p?.username || 'Unknown'; }

const STATUSES = [
  { value: '',          label: 'All statuses' },
  { value: 'pending',   label: 'Pending' },
  { value: 'accepted',  label: 'Accepted' },
  { value: 'declined',  label: 'Declined' },
];

export default function AdminConnections() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await listConnectionsAdmin({ search, status: statusFilter });
    if (error) setErr(error.message || 'Failed to load connections');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search, statusFilter]);

  const setStatus = async (row, next) => {
    setBusyId(row.id);
    const patch = { status: next };
    if (next === 'pending')  { patch.responded_at = null; patch.declined_at = null; }
    if (next === 'accepted') { patch.responded_at = new Date().toISOString(); patch.declined_at = null; }
    if (next === 'declined') { patch.responded_at = new Date().toISOString(); patch.declined_at = new Date().toISOString(); }
    const { error } = await adminUpdateConnection(row.id, patch);
    if (error) alert('Update failed: ' + (error.message || 'unknown'));
    setBusyId(null);
    load();
  };

  const deleteRow = async (row) => {
    if (!confirm('Delete this connection? The related conversation + messages stay, but either user could reconnect.')) return;
    setBusyId(row.id);
    const { error } = await adminDeleteConnection(row.id);
    if (error) alert('Delete failed: ' + (error.message || 'unknown'));
    setBusyId(null);
    load();
  };

  const counts = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    accepted: rows.filter((r) => r.status === 'accepted').length,
    declined: rows.filter((r) => r.status === 'declined').length,
  }), [rows]);

  return (
    <AdminLayout
      title="Connections"
      subtitle={loading
        ? 'Loading…'
        : `${counts.total} shown · ${counts.accepted} accepted · ${counts.pending} pending · ${counts.declined} declined`}
      actions={
        <button type="button" className="adm-btn primary" onClick={() => setShowCreate(true)}>
          + Force connect
        </button>
      }
    >
      {err && <div className="adm-error" style={{ marginBottom: 12 }}>{err}</div>}

      <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="adm-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <input
              type="text"
              placeholder="Search by username or name…"
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
          <select
            className="adm-select"
            style={{ maxWidth: 170 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading connections…</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty" style={{ margin: '1rem' }}>
            No connections match.
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th style={{ width: 40 }}></th>
                <th>Addressee</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 140 }}>Created</th>
                <th style={{ width: 280, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <PersonCell person={r.requester} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>→</td>
                  <td>
                    <PersonCell person={r.addressee} />
                  </td>
                  <td>
                    <span
                      className="adm-pill"
                      style={{
                        textTransform: 'capitalize',
                        background: r.status === 'accepted' ? '#EAF5E1' : r.status === 'declined' ? '#fef2f2' : 'var(--wood-cream, #FBF6EC)',
                        color:      r.status === 'accepted' ? '#3B6E28' : r.status === 'declined' ? '#991b1b' : 'var(--text-secondary)',
                        border: '1px solid ' + (r.status === 'declined' ? '#fecaca' : 'var(--border)'),
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <select
                        className="adm-select"
                        style={{ maxWidth: 140, padding: '3px 8px', fontSize: 12 }}
                        value={r.status}
                        disabled={busyId === r.id}
                        onChange={(e) => setStatus(r, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                      </select>
                      <button
                        type="button"
                        className="adm-btn danger"
                        onClick={() => deleteRow(r)}
                        disabled={busyId === r.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <ForceConnectModal
          onCancel={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load(); }}
        />
      )}
    </AdminLayout>
  );
}

function PersonCell({ person }) {
  if (!person) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: person.avatar_url ? 'url(' + person.avatar_url + ') center/cover no-repeat' : 'linear-gradient(135deg, #4A2A12, #A0642B)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 11, flexShrink: 0,
      }}>
        {!person.avatar_url && initials(person)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName(person)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{person.username}</div>
      </div>
    </div>
  );
}

function ForceConnectModal({ onCancel, onSaved }) {
  const [personA, setPersonA] = useState(null);
  const [personB, setPersonB] = useState(null);
  const [status, setStatus] = useState('accepted');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSave = async () => {
    if (!personA || !personB) { setErr('Pick two users.'); return; }
    if (personA.id === personB.id) { setErr('Pick two different users.'); return; }
    setSaving(true);
    setErr(null);
    const { error } = await adminForceConnect(personA.id, personB.id, status);
    setSaving(false);
    if (error) { setErr(error.message || 'Failed to create'); return; }
    onSaved();
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: 14, width: '100%', maxWidth: 560,
          border: '1px solid var(--border)', padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20 }}>Force connection</h2>
          <button type="button" className="adm-btn" onClick={onCancel}>×</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Overrides any existing edge between these two users. Accepting also creates the conversation.
        </div>

        {err && <div className="adm-error" style={{ marginBottom: 12 }}>{err}</div>}

        <PersonPicker label="Requester" value={personA} onChange={setPersonA} />
        <PersonPicker label="Addressee" value={personB} onChange={setPersonB} />

        <div className="adm-field" style={{ marginTop: 12 }}>
          <label className="adm-label">Status</label>
          <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="accepted">Accepted (opens chat immediately)</option>
            <option value="pending">Pending (addressee must accept)</option>
            <option value="declined">Declined (30-day cooldown set)</option>
          </select>
        </div>

        <div className="adm-footer">
          <div />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="adm-btn" onClick={onCancel}>Cancel</button>
            <button
              className="adm-btn primary"
              onClick={handleSave}
              disabled={saving || !personA || !personB}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonPicker({ label, value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim() || value) { setResults([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await searchProfiles(query);
      if (!cancelled) setResults(data || []);
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, value]);

  return (
    <div className="adm-field" style={{ marginBottom: 10 }}>
      <label className="adm-label">{label}</label>
      {value ? (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '0.5rem 0.7rem', background: 'var(--wood-cream, #FBF6EC)',
          border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <PersonCell person={value} />
          <button
            type="button"
            onClick={() => { onChange(null); setQuery(''); }}
            style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
          >×</button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="adm-input"
            placeholder="Search by username, name, or company…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 10, marginTop: 4, zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: 260, overflowY: 'auto',
            }}>
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p); setQuery(''); setOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.5rem 0.75rem', background: 'transparent', border: 0,
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--wood-cream, #FBF6EC)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <PersonCell person={p} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

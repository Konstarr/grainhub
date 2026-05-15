import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { fetchAllSuppliersAdmin } from '../../lib/supplierClaimsDb.js';

export default function AdminSuppliers() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [kind, setKind]       = useState('all'); // 'all' | 'vendor' | 'manufacturer'
  const [claimed, setClaimed] = useState('all'); // 'all' | 'claimed' | 'unclaimed'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchAllSuppliersAdmin({ limit: 500 });
      if (!cancelled) { setRows(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (term && !(r.name?.toLowerCase().includes(term) || r.slug?.toLowerCase().includes(term))) return false;
      if (kind !== 'all' && (r.kind || 'vendor') !== kind) return false;
      if (claimed === 'claimed'   && !r.claimed_by) return false;
      if (claimed === 'unclaimed' &&  r.claimed_by) return false;
      return true;
    });
  }, [rows, q, kind, claimed]);

  const counts = useMemo(() => ({
    total:       rows.length,
    vendor:      rows.filter((r) => (r.kind || 'vendor') === 'vendor').length,
    manufacturer:rows.filter((r) => r.kind === 'manufacturer').length,
    claimed:     rows.filter((r) => r.claimed_by).length,
    unclaimed:   rows.filter((r) => !r.claimed_by).length,
  }), [rows]);

  return (
    <AdminLayout
      title="Suppliers"
      subtitle={loading ? 'Loading…' : `${filtered.length} of ${rows.length} listing${rows.length === 1 ? '' : 's'}`}
      actions={(
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/admin/suppliers/new?kind=manufacturer" className="claim-btn primary">
            + Add manufacturer
          </Link>
          <Link to="/admin/suppliers/new?kind=vendor" className="claim-btn ghost">
            + Add supplier
          </Link>
          <Link to="/admin/supplier-claims" className="claim-btn ghost">
            Pending claims →
          </Link>
        </div>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatTile label="Total" value={counts.total} />
        <StatTile label="Vendors" value={counts.vendor} />
        <StatTile label="Manufacturers" value={counts.manufacturer} />
        <StatTile label="Claimed" value={counts.claimed} accent="green" />
        <StatTile label="Unclaimed" value={counts.unclaimed} accent="amber" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or slug…"
          style={{ flex: '1 1 320px', minWidth: 240, padding: 9, border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }}
        />
        <Pillbar
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all',          label: `All (${counts.total})` },
            { value: 'vendor',       label: `Vendors (${counts.vendor})` },
            { value: 'manufacturer', label: `Manufacturers (${counts.manufacturer})` },
          ]}
        />
        <Pillbar
          value={claimed}
          onChange={setClaimed}
          options={[
            { value: 'all',       label: 'Any' },
            { value: 'claimed',   label: `Claimed (${counts.claimed})` },
            { value: 'unclaimed', label: `Unclaimed (${counts.unclaimed})` },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', background: '#FFF8EE', border: '1px dashed var(--border-light)', borderRadius: 10 }}>
          No suppliers match these filters.
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kind</th>
                <th>Category</th>
                <th>Status</th>
                <th>Rating</th>
                <th style={{ textAlign: 'right' }}>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{s.slug}</div>
                  </td>
                  <td>
                    <span className={'adm-pill ' + (s.kind === 'manufacturer' ? 'adm-pill-blue' : 'adm-pill-brown')}>
                      {s.kind || 'vendor'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.category || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {s.is_verified && <span className="adm-pill adm-pill-green">✓ Verified</span>}
                      {s.claimed_by ? (
                        <span className="adm-pill adm-pill-green">Claimed</span>
                      ) : (
                        <span className="adm-pill adm-pill-amber">Unclaimed</span>
                      )}
                      {!s.is_approved && <span className="adm-pill adm-pill-red">Hidden</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {s.rating ? <>{Number(s.rating).toFixed(1)}★ <span style={{ color: 'var(--text-muted)' }}>({s.review_count})</span></> : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                    {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/suppliers/${s.id}`} className="claim-btn ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
                      Edit →
                    </Link>
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

function StatTile({ label, value, accent }) {
  const palette = accent === 'green' ? { bg: '#DDEFD3', fg: '#2E6F2E' }
                : accent === 'amber' ? { bg: '#F5EAD6', fg: '#4B5563' }
                : { bg: '#fff', fg: '#1c1c1c' };
  return (
    <div style={{
      background: palette.bg,
      color: palette.fg,
      border: '1px solid var(--border-light)',
      borderRadius: 10,
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{value.toLocaleString()}</div>
    </div>
  );
}

function Pillbar({ value, onChange, options }) {
  return (
    <div style={{ display: 'inline-flex', background: '#F5EAD6', borderRadius: 8, padding: 3, gap: 2 }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            padding: '6px 12px',
            border: 0,
            borderRadius: 6,
            background: value === o.value ? '#fff' : 'transparent',
            color: value === o.value ? '#1B3A2E' : '#4B5563',
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
            font: 'inherit',
            fontFamily: 'inherit',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

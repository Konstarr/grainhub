import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllSuppliersAdmin } from '../../lib/supplierClaimsDb.js';

export default function AdminSuppliers() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchAllSuppliersAdmin({ limit: 500 });
      if (!cancelled) { setRows(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = q.trim()
    ? rows.filter((r) =>
        r.name?.toLowerCase().includes(q.toLowerCase()) ||
        r.slug?.toLowerCase().includes(q.toLowerCase()))
    : rows;

  return (
    <div className="admin-page">
      <h1>Suppliers</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>
        Edit any supplier listing. Owners (claimed_by) can self-edit a subset of fields;
        admins can edit anything including name, slug, and verification.
      </p>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or slug…"
        style={{ width: '100%', maxWidth: 420, padding: 8, marginBottom: 12, border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'inherit' }}
      />

      {loading ? <div>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/admin/suppliers/${s.id}`}
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid var(--border-light)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  /{s.slug} &middot; {s.category || 'uncategorized'}
                  {s.is_verified && ' · ✓ verified'}
                  {s.claimed_by ? ' · claimed' : ' · unclaimed'}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {s.rating ? `${Number(s.rating).toFixed(1)}★ (${s.review_count})` : '—'}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 24, color: 'var(--text-muted)' }}>No suppliers match.</div>
          )}
        </div>
      )}
    </div>
  );
}

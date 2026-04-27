import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  fetchPendingSupplierClaims,
  approveSupplierClaim,
  rejectSupplierClaim,
} from '../../lib/supplierClaimsDb.js';

export default function AdminSupplierClaims() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [err, setErr]         = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    const { data, error } = await fetchPendingSupplierClaims({ limit: 200 });
    if (error) setErr(error.message || 'Could not load claims.');
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onApprove = async (id) => {
    setBusyId(id);
    const { error } = await approveSupplierClaim(id);
    setBusyId(null);
    if (error) { alert(error.message || 'Approve failed.'); return; }
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const onReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional, shown to claimant):', '');
    if (reason === null) return;
    setBusyId(id);
    const { error } = await rejectSupplierClaim(id, reason);
    setBusyId(null);
    if (error) { alert(error.message || 'Reject failed.'); return; }
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <AdminLayout
      title="Supplier claims"
      subtitle="Pending business-ownership claims. Email-domain matches auto-approve; everything else lands here."
      actions={(
        <Link to="/admin/suppliers" className="claim-btn ghost">All suppliers</Link>
      )}
    >
      {loading && <div>Loading…</div>}
      {err && <div className="comm-chat-err">{err}</div>}
      {!loading && rows.length === 0 && (
        <div style={{ padding: 24, color: 'var(--text-muted)' }}>No pending claims. 🎉</div>
      )}

      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((c) => (
            <div key={c.id} className="claim-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {c.supplier?.name || '—'}
                  {c.supplier?.slug && (
                    <Link
                      to={`/suppliers/${c.supplier.slug}`}
                      style={{ marginLeft: 8, fontWeight: 400, fontSize: 12 }}
                    >
                      view profile →
                    </Link>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Website: {c.supplier?.website || '—'}
                </div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  <strong>Claimant:</strong> {c.claimant?.full_name || c.claimant?.username || '—'}
                  {c.claim_email && <> &middot; <code>{c.claim_email}</code></>}
                </div>
                {c.evidence && (
                  <div style={{ fontSize: 13, marginTop: 6, padding: '6px 10px', background: 'var(--surface-muted, #f6f1e6)', borderRadius: 6 }}>
                    {c.evidence}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Submitted {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  className="claim-btn ghost"
                  disabled={busyId === c.id}
                  onClick={() => onReject(c.id)}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="claim-btn primary"
                  disabled={busyId === c.id}
                  onClick={() => onApprove(c.id)}
                >
                  {busyId === c.id ? '…' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

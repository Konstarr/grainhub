import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listMarketplacePackLimits,
  adminUpsertMarketplacePackLimit,
  adminDeleteMarketplacePackLimit,
} from '../../lib/marketplaceAdminDb.js';

/**
 * /admin/marketplace-settings — admin-editable monthly post limits per
 * vendor pack tier. Powers the marketplace_eligibility() RPC enforcement
 * server-side. Set monthly_post_limit to blank for unlimited.
 *
 * Pack tier slugs follow the pattern `vendor:<tier>` matching pricing.js
 * (vendor:starter, vendor:growth, vendor:scale, vendor:enterprise).
 * Admins can add new tiers by typing a new slug — useful when a future
 * pricing.js change introduces a tier this table doesn't know about yet.
 */
export default function AdminMarketplaceSettings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // New-row form fields
  const [newSlug, setNewSlug]   = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newOrder, setNewOrder] = useState('50');

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await listMarketplacePackLimits();
    if (error) setErr(error.message || 'Failed to load settings');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveRow = async (row, patch) => {
    setBusyId(row.pack_tier_slug);
    const { error } = await adminUpsertMarketplacePackLimit({
      packTierSlug: row.pack_tier_slug,
      packLabel:    patch.pack_label    ?? row.pack_label,
      monthlyLimit: patch.monthly_post_limit !== undefined
        ? patch.monthly_post_limit
        : row.monthly_post_limit,
      sortOrder: patch.sort_order ?? row.sort_order,
      isActive:  patch.is_active  ?? row.is_active,
    });
    setBusyId(null);
    if (error) { alert(error.message || 'Could not save'); return; }
    await load();
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete the "' + row.pack_label + '" tier?')) return;
    setBusyId(row.pack_tier_slug);
    const { error } = await adminDeleteMarketplacePackLimit(row.pack_tier_slug);
    setBusyId(null);
    if (error) { alert(error.message || 'Could not delete'); return; }
    await load();
  };

  const handleAdd = async (e) => {
    e?.preventDefault?.();
    if (!newSlug.trim()) { alert('Pack tier slug is required (e.g. vendor:starter)'); return; }
    const limit = newLimit === '' ? null : Number(newLimit);
    if (newLimit !== '' && (!Number.isFinite(limit) || limit < 0)) {
      alert('Monthly limit must be a non-negative number, or blank for unlimited.');
      return;
    }
    setBusyId('__new__');
    const { error } = await adminUpsertMarketplacePackLimit({
      packTierSlug: newSlug.trim(),
      packLabel:    newLabel.trim() || newSlug.trim(),
      monthlyLimit: limit,
      sortOrder:    Number(newOrder) || 0,
      isActive:     true,
    });
    setBusyId(null);
    if (error) { alert(error.message || 'Could not save'); return; }
    setNewSlug('');
    setNewLabel('');
    setNewLimit('');
    setNewOrder('50');
    await load();
  };

  return (
    <AdminLayout
      title="Marketplace listing limits"
      subtitle="Monthly post caps per vendor pack tier. Leave the limit blank for unlimited."
    >
      <div className="adm-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
          These caps are enforced server-side every time a vendor tries to publish a listing.
          Pack tier slugs follow <code>vendor:&lt;tier&gt;</code> — they should match the tier
          IDs in <code>src/lib/pricing.js</code>. Limits reset on the first of each calendar month.
        </div>

        {err && <div className="adm-error" style={{ marginBottom: 16 }}>{err}</div>}

        {loading ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading limits…</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Pack tier slug</th>
                <th>Display label</th>
                <th style={{ width: 140 }}>Monthly limit</th>
                <th style={{ width: 90 }}>Sort</th>
                <th style={{ width: 90 }}>Active</th>
                <th style={{ width: 180, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <PackLimitRow
                  key={r.pack_tier_slug}
                  row={r}
                  busy={busyId === r.pack_tier_slug}
                  onSave={(patch) => handleSaveRow(r, patch)}
                  onDelete={() => handleDelete(r)}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No pack limits configured. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="adm-card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Add or update a tier</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pack tier slug</div>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="vendor:starter"
              style={inputStyle}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Display label</div>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Vendor Starter"
              style={inputStyle}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Monthly post limit (blank = unlimited)</div>
            <input
              type="number"
              min="0"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="3"
              style={inputStyle}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Sort order</div>
            <input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              style={inputStyle}
            />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="submit" className="adm-btn primary" disabled={busyId === '__new__'}>
              {busyId === '__new__' ? 'Saving…' : 'Save tier'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}


function PackLimitRow({ row, busy, onSave, onDelete }) {
  const [label, setLabel] = useState(row.pack_label);
  const [limit, setLimit] = useState(row.monthly_post_limit == null ? '' : String(row.monthly_post_limit));
  const [order, setOrder] = useState(String(row.sort_order ?? 0));
  const [active, setActive] = useState(!!row.is_active);

  const dirty =
    label !== row.pack_label ||
    String(row.monthly_post_limit ?? '') !== String(limit) ||
    String(row.sort_order ?? 0) !== order ||
    active !== !!row.is_active;

  const save = () => {
    const limitVal = limit === '' ? null : Number(limit);
    if (limit !== '' && (!Number.isFinite(limitVal) || limitVal < 0)) {
      alert('Monthly limit must be a non-negative number, or blank for unlimited.');
      return;
    }
    onSave({
      pack_label: label,
      monthly_post_limit: limitVal,
      sort_order: Number(order) || 0,
      is_active: active,
    });
  };

  return (
    <tr>
      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.pack_tier_slug}</td>
      <td>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={inputStyle}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="∞"
          style={inputStyle}
        />
      </td>
      <td>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={inputStyle}
        />
      </td>
      <td>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span style={{ fontSize: 13 }}>{active ? 'Active' : 'Off'}</span>
        </label>
      </td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <button
            type="button"
            className="adm-btn primary"
            onClick={save}
            disabled={!dirty || busy}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            className="adm-btn danger"
            onClick={onDelete}
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.4rem 0.55rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
};

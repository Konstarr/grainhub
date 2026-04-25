import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listBadges,
  upsertBadge,
  deleteBadge,
} from '../../lib/forumAdminDb.js';

const METRIC_OPTIONS = [
  { value: 'reputation',         label: 'Reputation total' },
  { value: 'post_upvotes_total', label: 'Total post upvotes' },
  { value: 'thread_count',       label: 'Threads created' },
  { value: 'post_count',         label: 'Posts written' },
  { value: 'manual',             label: 'Manual award only' },
];

const TIER_OPTIONS = ['bronze', 'silver', 'gold', 'platinum'];

const EMPTY = {
  id: '',
  name: '',
  description: '',
  icon: '🏷',
  tier: 'bronze',
  metric_type: 'reputation',
  threshold: 100,
  order: 50,
};

/**
 * /admin/forums/badges — full CRUD on the badges table.
 *
 * Editing happens inline. The "evaluate_user_badges" SQL function
 * loops every badge with a metric_type + threshold and awards
 * matches on each upvote, so any new row here starts being awarded
 * immediately — no code changes needed.
 */
export default function AdminForumBadges() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState(null);
  const [okMsg, setOkMsg]   = useState(null);
  const [editing, setEditing] = useState(null); // null | EMPTY | row

  const reload = async () => {
    setLoading(true);
    const { data, error } = await listBadges();
    setRows(data);
    setErr(error?.message || null);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleSave = async (badge) => {
    setBusy(true); setErr(null);
    const { error } = await upsertBadge(badge);
    setBusy(false);
    if (error) {
      setErr(error.message || 'Save failed.');
      return;
    }
    setOkMsg('Saved.');
    setTimeout(() => setOkMsg(null), 2500);
    setEditing(null);
    reload();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete the "${id}" badge? Existing awards stay on user profiles.`)) return;
    setBusy(true);
    const { error } = await deleteBadge(id);
    setBusy(false);
    if (error) {
      setErr(error.message || 'Delete failed.');
      return;
    }
    reload();
  };

  return (
    <AdminLayout
      title="Badges"
      subtitle="Create new tiers, change icons, tune unlock thresholds. Awards happen automatically on the next upvote."
      actions={
        <>
          <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12, marginRight: 6 }}>
            ← Back to forum mod.
          </Link>
          <button
            type="button"
            className="cart-btn primary"
            onClick={() => setEditing({ ...EMPTY })}
            style={{ padding: '6px 14px', fontSize: 12.5 }}
          >
            + New badge
          </button>
        </>
      }
    >
      {err && <div className="cart-err" style={{ marginBottom: '1rem' }}>{err}</div>}
      {okMsg && <div className="cart-ok" style={{ marginBottom: '1rem' }}>{okMsg}</div>}

      {editing && (
        <BadgeForm
          badge={editing}
          isNew={!rows.find((r) => r.id === editing.id)}
          busy={busy}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          background: 'var(--white)',
          border: '1px dashed var(--border)',
          borderRadius: 10,
        }}>
          No badges yet. Click "+ New badge" to create one.
        </div>
      ) : (
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{
                background: '#FDFBF5',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                <th style={th}>Icon</th>
                <th style={th}>Name</th>
                <th style={th}>ID</th>
                <th style={th}>Tier</th>
                <th style={th}>Awarded when</th>
                <th style={{ ...th, width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ ...td, fontSize: 22, textAlign: 'center', width: 50 }}>{r.icon || '🏷'}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                    {r.description && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.id}
                  </td>
                  <td style={td}><TierPill tier={r.tier} /></td>
                  <td style={td}>
                    {r.metric_type === 'manual'
                      ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>manually awarded</span>
                      : r.metric_type && r.threshold != null
                        ? <span>{r.threshold} <span style={{ color: 'var(--text-muted)' }}>{metricLabel(r.metric_type)}</span></span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={td}>
                    <button type="button" onClick={() => setEditing(r)} style={btn}>Edit</button>
                    <button type="button" onClick={() => handleDelete(r.id)} style={{ ...btn, ...btnDanger }}>Delete</button>
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

function BadgeForm({ badge, isNew, busy, onSave, onCancel }) {
  const [form, setForm] = useState({ ...badge });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={submit} style={{
      background: 'var(--white)',
      border: '1px solid var(--wood-warm)',
      borderRadius: 12,
      padding: '1.1rem 1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15,
        color: 'var(--text-primary)', marginBottom: '0.85rem',
      }}>
        {isNew ? 'New badge' : `Edit "${badge.id}"`}
      </div>

      <div style={formGrid}>
        <Field label="Icon (emoji)">
          <input
            type="text"
            value={form.icon || ''}
            onChange={set('icon')}
            maxLength={4}
            style={{ ...inputStyle, fontSize: 22, textAlign: 'center', width: 70 }}
            disabled={busy}
          />
        </Field>
        <Field label="Display name" full>
          <input
            type="text"
            value={form.name || ''}
            onChange={set('name')}
            maxLength={50}
            style={inputStyle}
            disabled={busy}
            required
          />
        </Field>
        <Field label="ID (lowercase, dashes)">
          <input
            type="text"
            value={form.id || ''}
            onChange={set('id')}
            maxLength={40}
            pattern="[a-z0-9-]+"
            style={{ ...inputStyle, fontFamily: 'monospace' }}
            disabled={busy || !isNew}
            required
          />
        </Field>
        <Field label="Tier">
          <select value={form.tier} onChange={set('tier')} style={inputStyle} disabled={busy}>
            {TIER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Sort order (lower = first)">
          <input
            type="number"
            value={form.order ?? 50}
            onChange={set('order')}
            min="0"
            max="999"
            style={inputStyle}
            disabled={busy}
          />
        </Field>
      </div>

      <Field label="Description" full>
        <textarea
          value={form.description || ''}
          onChange={set('description')}
          rows={2}
          maxLength={300}
          style={{ ...inputStyle, fontFamily: 'inherit' }}
          disabled={busy}
          placeholder="Shown on hover and in the badge tooltip"
        />
      </Field>

      <div style={{
        marginTop: '0.85rem',
        padding: '0.75rem 1rem',
        background: '#FDFBF5',
        borderRadius: 8,
        border: '1px solid var(--border-light)',
      }}>
        <div style={{
          fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11,
          letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: 6,
        }}>Award rule</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span>When user reaches</span>
            <input
              type="number"
              value={form.threshold ?? ''}
              onChange={set('threshold')}
              min="0"
              max="1000000"
              style={{ ...inputStyle, width: 110 }}
              disabled={busy || form.metric_type === 'manual'}
              placeholder="threshold"
            />
            <span>of</span>
            <select value={form.metric_type || ''} onChange={set('metric_type')} style={inputStyle} disabled={busy}>
              {METRIC_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
        </div>
        {form.metric_type === 'manual' && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Manual badges aren't auto-awarded. Threshold is ignored.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          className="cart-btn ghost"
          onClick={onCancel}
          disabled={busy}
          style={{ padding: '0.5rem 1rem', fontSize: 13.5 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cart-btn primary"
          disabled={busy}
          style={{ padding: '0.5rem 1.1rem', fontSize: 13.5 }}
        >
          {busy ? 'Saving…' : isNew ? 'Create badge' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, full }) {
  return (
    <label style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      gridColumn: full ? '1 / -1' : 'auto',
    }}>
      <span style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: 11,
        fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>{label}</span>
      {children}
    </label>
  );
}

function TierPill({ tier }) {
  const palette = {
    bronze:   { bg: '#F5E0D0', fg: '#8B4316' },
    silver:   { bg: '#E5E5E5', fg: '#555' },
    gold:     { bg: '#FDF1C9', fg: '#8B6914' },
    platinum: { bg: '#E0E2E5', fg: '#444' },
  };
  const c = palette[tier] || palette.bronze;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, sans-serif',
    }}>{tier || '—'}</span>
  );
}

function metricLabel(metric) {
  const m = METRIC_OPTIONS.find((x) => x.value === metric);
  return m ? m.label.toLowerCase() : metric;
}

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginBottom: '0.75rem',
};
const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--white)',
};
const th = { textAlign: 'left', padding: '0.65rem 0.85rem' };
const td = { padding: '0.65rem 0.85rem', verticalAlign: 'middle' };
const btn = {
  padding: '4px 10px',
  fontSize: 12,
  fontFamily: 'inherit',
  fontWeight: 600,
  background: '#fff',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  cursor: 'pointer',
  marginRight: 4,
};
const btnDanger = {
  background: '#fef2f2',
  color: '#991b1b',
  borderColor: '#fecaca',
};

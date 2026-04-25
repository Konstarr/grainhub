import { useEffect, useState } from 'react';
import CoverImageUploader from './CoverImageUploader.jsx';
import {
  listSponsorMediaByOwner,
  createSponsorMedia,
  updateSponsorMedia,
  deleteSponsorMedia,
  slotsForTier,
} from '../../lib/adminDb.js';

/**
 * SponsorMediaEditor
 *
 * Inline panel inside AdminUserEdit — lets staff (and eventually the
 * sponsor themselves) manage every ad asset attached to a user profile.
 *
 * Behaviour:
 *   • Only slots allowed by the profile's `sponsor_tier` are shown.
 *   • New uploads are auto-tagged with the owner's id + current tier.
 *   • Approve / pause / delete and per-slot size hints match the old
 *     standalone Sponsors admin.
 */
const SLOT_META = {
  marquee:     { label: 'Homepage marquee', sizeHint: '240×80 · transparent PNG or SVG ideal' },
  leaderboard: { label: 'Leaderboard banner', sizeHint: '970×90 or 728×90 · JPG / PNG' },
  sidebar:     { label: 'Sidebar card',       sizeHint: '300×250 or 300×600 · JPG / PNG' },
  hero:        { label: 'Featured hero',      sizeHint: '1200×400 · JPG / PNG' },
};

export default function SponsorMediaEditor({ ownerId, tier }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [editing, setEditing] = useState(null); // row or 'new:slot'

  const allowedSlots = slotsForTier(tier);

  const load = async () => {
    if (!ownerId) return;
    setLoading(true);
    setErr(null);
    const { data, error } = await listSponsorMediaByOwner(ownerId);
    if (error) setErr(error.message || 'Failed to load');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [ownerId]);

  if (!tier) {
    return (
      <div className="adm-empty" style={{ marginTop: 8 }}>
        Assign a sponsor tier above to enable ad placements. Media uploads unlock automatically based on tier.
      </div>
    );
  }

  if (!ownerId) {
    return <div className="adm-empty" style={{ marginTop: 8 }}>Save the profile first to attach media.</div>;
  }

  const startNew = (slot) => {
    setEditing({
      owner_id: ownerId,
      slot,
      tier,
      name: '',
      image_url: '',
      click_url: '',
      alt_text: '',
      is_approved: true,
      is_active: true,
      sort_order: 0,
    });
  };

  const handleSave = async (form) => {
    // Owner is always force-tagged. Tier and slot use whatever the
    // form provides — admins can override the profile's sponsor_tier
    // here when they need to file a row in a different bucket
    // (e.g. platinum sponsor with a gold-tier multi-grid ad).
    const payload = {
      ...form,
      owner_id: ownerId,
      tier: form.tier || tier,
      slot: form.slot,
    };
    if (form.id) {
      const patch = { ...payload };
      delete patch.id;
      delete patch.created_at;
      delete patch.updated_at;
      const { error } = await updateSponsorMedia(form.id, patch);
      if (error) { alert('Save failed: ' + (error.message || 'unknown')); return; }
    } else {
      const { error } = await createSponsorMedia(payload);
      if (error) { alert('Create failed: ' + (error.message || 'unknown')); return; }
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    const { error } = await deleteSponsorMedia(id);
    if (error) { alert('Delete failed: ' + (error.message || 'unknown')); return; }
    load();
  };

  const toggle = async (row, field) => {
    const { error } = await updateSponsorMedia(row.id, { [field]: !row[field] });
    if (error) { alert(error.message || 'Failed'); return; }
    load();
  };

  const bySlot = {};
  rows.forEach((r) => { (bySlot[r.slot] = bySlot[r.slot] || []).push(r); });

  return (
    <div>
      {err && <div className="adm-error" style={{ marginBottom: 10 }}>{err}</div>}
      {loading && rows.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0.4rem 0' }}>Loading…</div>
      )}

      <div style={{
        fontSize: 12, color: 'var(--text-muted)',
        padding: '0.6rem 0.8rem', background: 'var(--wood-cream, #FBF6EC)',
        border: '1px solid var(--border)', borderRadius: 8, marginBottom: 12,
      }}>
        <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} tier unlocks:
        </strong>{' '}
        {allowedSlots.map((s) => SLOT_META[s]?.label).join(' · ') || 'no slots'}.
      </div>

      {allowedSlots.map((slot) => (
        <div
          key={slot}
          style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '0.9rem 1rem', marginBottom: 10, background: 'var(--white)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{SLOT_META[slot]?.label || slot}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                Recommended: {SLOT_META[slot]?.sizeHint || 'any size'}
              </div>
            </div>
            <button type="button" className="adm-btn" onClick={() => startNew(slot)}>+ Add asset</button>
          </div>

          {(bySlot[slot] || []).length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0.75rem 0 0.25rem' }}>
              No assets yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 10 }}>
              {(bySlot[slot] || []).map((a) => (
                <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--white)' }}>
                  <div style={{ height: 90, background: 'linear-gradient(135deg, #F1E4CC, #E6D5B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                    {a.image_url
                      ? <img src={a.image_url} alt={a.alt_text || a.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      : <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>No image</div>}
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem' }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.name || 'Untitled'}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      <span className={'adm-pill ' + (a.is_approved ? 'pub' : 'draft')}>{a.is_approved ? 'Approved' : 'Pending'}</span>
                      <span className={'adm-pill ' + (a.is_active ? 'pub' : 'draft')}>{a.is_active ? 'Active' : 'Paused'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      <button className="adm-btn" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => setEditing(a)}>Edit</button>
                      <button className="adm-btn" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => toggle(a, 'is_approved')}>{a.is_approved ? 'Unapprove' : 'Approve'}</button>
                      <button className="adm-btn" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => toggle(a, 'is_active')}>{a.is_active ? 'Pause' : 'Resume'}</button>
                      <button className="adm-btn danger" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => handleDelete(a.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {editing && (
        <SponsorMediaModal
          row={editing}
          tier={tier}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function SponsorMediaModal({ row, tier, onCancel, onSave }) {
  const [form, setForm] = useState({ ...row, tier: row.tier || tier });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const slotMeta = SLOT_META[form.slot] || {};
  const TIER_OPTIONS = ['silver', 'gold', 'platinum'];
  const SLOT_OPTIONS = ['marquee', 'sidebar', 'leaderboard', 'hero'];

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
          maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18 }}>
            {form.id ? 'Edit asset' : 'New asset'} — {slotMeta.label || form.slot}
          </h2>
          <button type="button" className="adm-btn" onClick={onCancel}>×</button>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
          Tier: <strong style={{ textTransform: 'capitalize' }}>{tier}</strong> · Recommended size: {slotMeta.sizeHint || 'any'}
        </div>

        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Name</label>
            <input type="text" className="adm-input" value={form.name || ''} onChange={(e) => set('name')(e.target.value)} placeholder="Internal label — e.g. Blum SERVO-DRIVE" />
          </div>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label className="adm-label">Tier (where this row qualifies)</label>
              <select
                className="adm-input"
                value={form.tier || ''}
                onChange={(e) => set('tier')(e.target.value)}
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                Defaults to the owner's profile tier. Override to file this
                ad under a different bucket (e.g. a platinum sponsor with a
                gold-tier multi-grid ad).
              </div>
            </div>
            <div className="adm-field">
              <label className="adm-label">Slot (where it appears)</label>
              <select
                className="adm-input"
                value={form.slot || ''}
                onChange={(e) => set('slot')(e.target.value)}
              >
                {SLOT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{SLOT_META[s]?.label || s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="adm-form-grid">
            <div className="adm-field">
              <label className="adm-label">Click-through URL</label>
              <input type="text" className="adm-input" value={form.click_url || ''} onChange={(e) => set('click_url')(e.target.value)} placeholder="https://…" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Alt text</label>
              <input type="text" className="adm-input" value={form.alt_text || ''} onChange={(e) => set('alt_text')(e.target.value)} placeholder="Accessible description" />
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label">Image</label>
            <CoverImageUploader value={form.image_url || ''} onChange={(url) => set('image_url')(url)} folder="sponsors" />
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.is_approved} onChange={() => set('is_approved')(!form.is_approved)} /> Approved
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.is_active} onChange={() => set('is_active')(!form.is_active)} /> Active
            </label>
          </div>
          <div className="adm-footer">
            <div />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn" onClick={onCancel}>Cancel</button>
              <button className="adm-btn primary" onClick={() => onSave(form)} disabled={!form.name || !form.image_url}>
                {form.id ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

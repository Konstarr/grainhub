import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import CoverImageUploader from '../../components/admin/CoverImageUploader.jsx';
import {
  listSponsorMedia,
  createSponsorMedia,
  updateSponsorMedia,
  deleteSponsorMedia,
} from '../../lib/adminDb.js';

/**
 * Ad slots and the sizes we recommend for each.
 * These hints drive the "Size guidance" panel the admin sees when
 * uploading, so sponsor assets stay consistent across the site.
 */
const SLOTS = [
  { key: 'marquee',     label: 'Homepage Marquee',    sizeHint: '240×80 · transparent PNG or SVG ideal',  desc: 'Horizontal scrolling logo strip on the homepage.' },
  { key: 'leaderboard', label: 'Leaderboard Banner',  sizeHint: '970×90 or 728×90 · JPG/PNG',              desc: 'Top banner above index pages (Marketplace, News, Wiki).' },
  { key: 'sidebar',     label: 'Sidebar Card',        sizeHint: '300×250 or 300×600 · JPG/PNG',            desc: 'Right-column ad on article/thread pages.' },
  { key: 'hero',        label: 'Featured Hero',       sizeHint: '1200×400 · JPG/PNG',                      desc: 'Large featured sponsor block on homepage / News.' },
  { key: 'other',       label: 'Other / Misc',        sizeHint: 'Any size',                                desc: 'Ad hoc placements — use sparingly.' },
];

const TIERS = [
  { key: '',         label: 'House ad (no tier)' },
  { key: 'silver',   label: 'Silver' },
  { key: 'gold',     label: 'Gold' },
  { key: 'platinum', label: 'Platinum' },
];

export default function AdminSponsors() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // row being edited (or 'new')
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await listSponsorMedia({});
    if (error) setErr(error.message || 'Failed to load');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (form.id) {
      const { error } = await updateSponsorMedia(form.id, stripId(form));
      if (error) { alert('Save failed: ' + (error.message || 'unknown')); return; }
    } else {
      const { error } = await createSponsorMedia(form);
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

  const handleToggleApproved = async (row) => {
    const { error } = await updateSponsorMedia(row.id, { is_approved: !row.is_approved });
    if (error) { alert(error.message || 'Failed'); return; }
    load();
  };
  const handleToggleActive = async (row) => {
    const { error } = await updateSponsorMedia(row.id, { is_active: !row.is_active });
    if (error) { alert(error.message || 'Failed'); return; }
    load();
  };

  const bySlot = {};
  (rows || []).forEach((r) => {
    bySlot[r.slot] = bySlot[r.slot] || [];
    bySlot[r.slot].push(r);
  });

  return (
    <AdminLayout
      title="Sponsor media"
      subtitle={loading ? 'Loading…' : `${rows.length} assets`}
      actions={
        <button className="adm-btn primary" onClick={() => setEditing({
          name: '', tier: '', slot: 'marquee', image_url: '', click_url: '', alt_text: '',
          is_approved: false, is_active: true, sort_order: 0,
        })}>+ New asset</button>
      }
    >
      {err && <div className="adm-error" style={{ marginBottom: 12 }}>{err}</div>}

      {SLOTS.map((slot) => (
        <SlotSection
          key={slot.key}
          slot={slot}
          assets={bySlot[slot.key] || []}
          onEdit={setEditing}
          onDelete={handleDelete}
          onToggleApproved={handleToggleApproved}
          onToggleActive={handleToggleActive}
        />
      ))}

      {editing && (
        <EditModal
          row={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}

function SlotSection({ slot, assets, onEdit, onDelete, onToggleApproved, onToggleActive }) {
  return (
    <div className="adm-card" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)' }}>
            {slot.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{slot.desc}</div>
          <div style={{ fontSize: 11.5, color: 'var(--wood-warm)', marginTop: 4, fontWeight: 600 }}>
            Recommended: {slot.sizeHint}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {assets.length} asset{assets.length === 1 ? '' : 's'}
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="adm-empty" style={{ padding: '1.25rem' }}>
          Nothing here yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {assets.map((a) => (
            <div key={a.id} style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--white)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: 110,
                background: 'linear-gradient(135deg, #F1E4CC, #E6D5B3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}>
                {a.image_url
                  ? <img src={a.image_url} alt={a.alt_text || a.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No image</div>}
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.name}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                  {a.tier && <span className="adm-pill pub" style={{ textTransform: 'capitalize' }}>{a.tier}</span>}
                  <span className={'adm-pill ' + (a.is_approved ? 'pub' : 'draft')}>
                    {a.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <span className={'adm-pill ' + (a.is_active ? 'pub' : 'draft')}>
                    {a.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <button className="adm-btn" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => onEdit(a)}>Edit</button>
                  <button className="adm-btn" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => onToggleApproved(a)}>
                    {a.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button className="adm-btn" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => onToggleActive(a)}>
                    {a.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button className="adm-btn danger" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => onDelete(a.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditModal({ row, onCancel, onSave }) {
  const [form, setForm] = useState(row);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const currentSlot = SLOTS.find((s) => s.key === form.slot);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: 14, width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20 }}>
            {form.id ? 'Edit asset' : 'New sponsor asset'}
          </h2>
          <button type="button" className="adm-btn" onClick={onCancel}>×</button>
        </div>

        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Name</label>
            <input type="text" className="adm-input" value={form.name || ''} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Blum SERVO-DRIVE" />
          </div>

          <div className="adm-form-grid">
            <div className="adm-field">
              <label className="adm-label">Slot</label>
              <select className="adm-select" value={form.slot} onChange={(e) => set('slot')(e.target.value)}>
                {SLOTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              {currentSlot && (
                <div className="adm-hint">{currentSlot.sizeHint}</div>
              )}
            </div>
            <div className="adm-field">
              <label className="adm-label">Tier</label>
              <select className="adm-select" value={form.tier || ''} onChange={(e) => set('tier')(e.target.value || null)}>
                {TIERS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label className="adm-label">Click-through URL</label>
              <input type="text" className="adm-input" value={form.click_url || ''} onChange={(e) => set('click_url')(e.target.value)} placeholder="https://…" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Alt text</label>
              <input type="text" className="adm-input" value={form.alt_text || ''} onChange={(e) => set('alt_text')(e.target.value)} placeholder="Short description" />
            </div>

            <div className="adm-field">
              <label className="adm-label">Sort order</label>
              <input type="number" className="adm-input" value={form.sort_order || 0} onChange={(e) => set('sort_order')(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="adm-field">
            <label className="adm-label">Image</label>
            <CoverImageUploader
              value={form.image_url || ''}
              onChange={(url) => set('image_url')(url)}
              folder="sponsors"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.is_approved} onChange={() => set('is_approved')(!form.is_approved)} />
              Approved
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={!!form.is_active} onChange={() => set('is_active')(!form.is_active)} />
              Active
            </label>
          </div>

          <div className="adm-footer">
            <div />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn" onClick={onCancel}>Cancel</button>
              <button
                className="adm-btn primary"
                onClick={() => onSave(form)}
                disabled={!form.name || !form.image_url}
              >
                {form.id ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stripId(obj) {
  const clone = { ...obj };
  delete clone.id;
  delete clone.created_at;
  delete clone.updated_at;
  return clone;
}

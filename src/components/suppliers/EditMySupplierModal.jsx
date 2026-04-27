import { useState } from 'react';
import { updateMySupplier } from '../../lib/supplierClaimsDb.js';

/** Owner-only edit modal for a claimed supplier. */
export default function EditMySupplierModal({ supplier, onClose, onSaved }) {
  const [logoUrl, setLogoUrl]     = useState(supplier?.logo_url || '');
  const [bannerUrl, setBannerUrl] = useState(supplier?.banner_url || '');
  const [description, setDesc]    = useState(supplier?.description || '');
  const [website, setWebsite]     = useState(supplier?.website || '');
  const [phone, setPhone]         = useState(supplier?.phone || '');
  const [email, setEmail]         = useState(supplier?.email || '');
  const [address, setAddress]     = useState(supplier?.address || '');
  const [hours, setHours]         = useState(supplier?.hours || '');
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');

  if (!supplier) return null;

  const submit = async (e) => {
    e?.preventDefault();
    setSaving(true); setErr('');
    const { error } = await updateMySupplier(supplier.id, {
      logo_url:    logoUrl,
      banner_url:  bannerUrl,
      description,
      website,
      phone,
      email,
      address,
      hours,
    });
    setSaving(false);
    if (error) { setErr(error.message || 'Could not save changes.'); return; }
    if (typeof onSaved === 'function') onSaved();
    onClose?.();
  };

  return (
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="claim-modal-header">
          <strong>Edit {supplier.name}</strong>
          <button type="button" className="claim-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="claim-modal-body" onSubmit={submit}>
          <label className="claim-field">
            <span>Logo URL</span>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
          </label>
          <label className="claim-field">
            <span>Banner URL</span>
            <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://…" />
          </label>
          <label className="claim-field">
            <span>Description</span>
            <textarea rows={4} value={description} onChange={(e) => setDesc(e.target.value)} maxLength={2000} />
          </label>
          <label className="claim-field">
            <span>Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="claim-field">
              <span>Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="claim-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <label className="claim-field">
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="claim-field">
            <span>Hours</span>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon–Fri 9am–6pm ET" />
          </label>

          {err && <div className="claim-error">{err}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="claim-btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="claim-btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

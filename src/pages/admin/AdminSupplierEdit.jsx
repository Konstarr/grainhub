import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { fetchSupplierById, adminUpdateSupplier } from '../../lib/supplierClaimsDb.js';

export default function AdminSupplierEdit() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');

  // Local controlled fields
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    const { data } = await fetchSupplierById(id);
    setSupplier(data || null);
    setForm({
      name:          data?.name          || '',
      slug:          data?.slug          || '',
      kind:          data?.kind          || 'vendor',
      category:      data?.category      || '',
      trade:         data?.trade         || '',
      logo_initials: data?.logo_initials || '',
      logo_url:      data?.logo_url      || '',
      banner_url:    data?.banner_url    || '',
      description:   data?.description   || '',
      website:       data?.website       || '',
      phone:         data?.phone         || '',
      email:         data?.email         || '',
      address:       data?.address       || '',
      hours:         data?.hours         || '',
      badges:        (data?.badges || []).join(', '),
      is_verified:   !!data?.is_verified,
      is_approved:   data?.is_approved !== false,
    });
    setLoading(false);
  };

  useEffect(() => { if (id) load(); }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true); setErr(''); setMsg('');
    const patch = {
      name: form.name,
      slug: form.slug,
      kind: form.kind,
      category: form.category,
      trade: form.trade,
      logo_initials: form.logo_initials,
      logo_url: form.logo_url,
      banner_url: form.banner_url,
      description: form.description,
      website: form.website,
      phone: form.phone,
      email: form.email,
      address: form.address,
      hours: form.hours,
      badges: form.badges.split(',').map((s) => s.trim()).filter(Boolean),
      is_verified: !!form.is_verified,
      is_approved: !!form.is_approved,
    };
    const { error } = await adminUpdateSupplier(id, patch);
    setSaving(false);
    if (error) { setErr(error.message || 'Save failed.'); return; }
    setMsg('Saved.');
    load();
  };

  if (loading) {
    return (
      <AdminLayout title="Edit supplier" subtitle="Loading…">
        <div>Loading…</div>
      </AdminLayout>
    );
  }
  if (!supplier) {
    return (
      <AdminLayout title="Supplier not found" subtitle="That row doesn't exist or was deleted">
        <Link to="/admin/suppliers">← Back to all suppliers</Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Edit ${supplier.name}`}
      subtitle={(
        <>
          <Link to={`/suppliers/${form.slug}`} target="_blank" rel="noreferrer">/suppliers/{form.slug} ↗</Link>
          {supplier.claimed_by ? ' · Claimed' : ' · Unclaimed'}
        </>
      )}
      actions={(
        <Link to="/admin/suppliers" className="claim-btn ghost">← All suppliers</Link>
      )}
    >

      <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="claim-field"><span>Name</span><input value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label className="claim-field"><span>Slug</span><input value={form.slug} onChange={(e) => set('slug', e.target.value)} /></label>
          <label className="claim-field">
            <span>Kind</span>
            <select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
              <option value="vendor">Vendor</option>
              <option value="manufacturer">Manufacturer</option>
            </select>
          </label>
          <label className="claim-field"><span>Category</span><input value={form.category} onChange={(e) => set('category', e.target.value)} /></label>
          <label className="claim-field"><span>Trade</span><input value={form.trade} onChange={(e) => set('trade', e.target.value)} /></label>
          <label className="claim-field"><span>Logo initials (fallback)</span><input maxLength={4} value={form.logo_initials} onChange={(e) => set('logo_initials', e.target.value)} /></label>
          <label className="claim-field"><span>Badges (comma-separated)</span><input value={form.badges} onChange={(e) => set('badges', e.target.value)} placeholder="ISO 9001, Family-owned" /></label>
        </div>

        <label className="claim-field"><span>Logo URL</span><input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} /></label>
        <label className="claim-field"><span>Banner URL</span><input value={form.banner_url} onChange={(e) => set('banner_url', e.target.value)} /></label>
        <label className="claim-field">
          <span>Description</span>
          <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={4000} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="claim-field"><span>Website</span><input value={form.website} onChange={(e) => set('website', e.target.value)} /></label>
          <label className="claim-field"><span>Phone</span><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
          <label className="claim-field"><span>Email</span><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
          <label className="claim-field"><span>Hours</span><input value={form.hours} onChange={(e) => set('hours', e.target.value)} /></label>
        </div>
        <label className="claim-field"><span>Address</span><input value={form.address} onChange={(e) => set('address', e.target.value)} /></label>

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={!!form.is_verified} onChange={(e) => set('is_verified', e.target.checked)} />
            Verified
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={!!form.is_approved} onChange={(e) => set('is_approved', e.target.checked)} />
            Approved (visible in directory)
          </label>
        </div>

        {err && <div className="claim-error">{err}</div>}
        {msg && <div style={{ color: '#2E6F2E', fontSize: 13 }}>{msg}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="claim-btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

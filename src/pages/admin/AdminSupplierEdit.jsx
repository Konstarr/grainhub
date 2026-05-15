import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { fetchSupplierById, adminUpdateSupplier, adminCreateSupplier } from '../../lib/supplierClaimsDb.js';

// Convert a free-text name into a clean slug. Lowercase, ASCII-ish,
// hyphens between words, no leading/trailing punctuation.
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export default function AdminSupplierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = id === 'new';

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');

  // Local controlled fields
  const [form, setForm] = useState({
    name: '',
    slug: '',
    // When the admin clicks "+ Add manufacturer" we pre-seed the kind so
    // the form starts on the right tab. ?kind=manufacturer in the URL.
    kind: searchParams.get('kind') === 'manufacturer' ? 'manufacturer' : 'vendor',
    category: '', trade: '', logo_initials: '', logo_url: '', banner_url: '',
    description: '', website: '', phone: '', email: '', address: '', hours: '',
    badges: '', is_verified: false, is_approved: true,
  });

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

  useEffect(() => { if (id && !isNew) load(); }, [id, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true); setErr(''); setMsg('');
    const patch = {
      name: form.name,
      // Auto-slugify on create if the admin left it blank.
      slug: form.slug || slugify(form.name),
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

    if (isNew) {
      const { data, error } = await adminCreateSupplier(patch);
      setSaving(false);
      if (error) { setErr(error.message || 'Create failed.'); return; }
      // Hop to the edit URL so future saves use update, not insert.
      navigate(`/admin/suppliers/${data.id}`, { replace: true });
      return;
    }

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
  if (!isNew && !supplier) {
    return (
      <AdminLayout title="Supplier not found" subtitle="That row doesn't exist or was deleted">
        <Link to="/admin/suppliers">← Back to all suppliers</Link>
      </AdminLayout>
    );
  }

  const headerTitle = isNew
    ? (form.kind === 'manufacturer' ? 'Add a manufacturer member' : 'Add a supplier listing')
    : `Edit ${supplier.name}`;
  const headerSubtitle = isNew
    ? 'Fill out the basics, save, then come back to fine-tune logo, banner, and badges.'
    : (
        <>
          <Link to={`/suppliers/${form.slug}`} target="_blank" rel="noreferrer">/suppliers/{form.slug} ↗</Link>
          {supplier?.claimed_by ? ' · Claimed' : ' · Unclaimed'}
        </>
      );

  return (
    <AdminLayout
      title={headerTitle}
      subtitle={headerSubtitle}
      actions={(
        <Link to="/admin/suppliers" className="claim-btn ghost">← All suppliers</Link>
      )}
    >

      <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="claim-field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => {
                const v = e.target.value;
                set('name', v);
                // While creating, keep slug synced to the name so the admin
                // doesn't have to think about URL strings unless they want to.
                if (isNew && (!form.slug || form.slug === slugify(form.name))) {
                  set('slug', slugify(v));
                }
              }}
              placeholder="e.g., Sunshine Cabinet Hardware"
            />
          </label>
          <label className="claim-field">
            <span>Slug (URL)</span>
            <input
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="e.g., sunshine-cabinet-hardware"
            />
          </label>
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
            {saving ? (isNew ? 'Creating…' : 'Saving…') : (isNew ? 'Create listing' : 'Save changes')}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

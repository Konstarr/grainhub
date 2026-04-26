import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import MarketplaceListingForm from '../../components/marketplace/MarketplaceListingForm.jsx';
import {
  adminGetListing,
  adminUpdateListing,
  adminDeleteListing,
  adminToggleListingApproval,
} from '../../lib/marketplaceAdminDb.js';

/**
 * /admin/listings/:id — admin/mod can edit any listing in the system.
 * Reuses the public MarketplaceListingForm. Adds approval toggle, sold
 * toggle, and a danger-zone delete.
 */
export default function AdminMarketplaceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await adminGetListing(id);
    if (error) setErr(error.message || String(error));
    setListing(data);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const handleSave = async (payload) => {
    setBusy(true);
    setErr(null);
    const { data, error } = await adminUpdateListing(id, payload);
    setBusy(false);
    if (error) {
      setErr(error.message || String(error));
      return;
    }
    if (data) setListing({ ...listing, ...data });
    alert('Listing updated.');
  };

  const handleToggleApproval = async () => {
    if (!listing) return;
    setBusy(true);
    const { data, error } = await adminToggleListingApproval(id, !listing.is_approved);
    setBusy(false);
    if (error) { alert(error.message || 'Could not update'); return; }
    if (data) setListing({ ...listing, ...data });
  };

  const handleToggleSold = async () => {
    if (!listing) return;
    setBusy(true);
    const { data, error } = await adminUpdateListing(id, { is_sold: !listing.is_sold });
    setBusy(false);
    if (error) { alert(error.message || 'Could not update'); return; }
    if (data) setListing({ ...listing, ...data });
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!confirm('Permanently delete "' + listing.title + '"? This cannot be undone.')) return;
    setBusy(true);
    const { error } = await adminDeleteListing(id);
    setBusy(false);
    if (error) { alert(error.message || 'Could not delete'); return; }
    navigate('/admin/listings');
  };

  if (loading) {
    return (
      <AdminLayout title="Edit listing" subtitle="Loading…">
        <div className="adm-card" style={{ padding: '2rem' }}>Loading listing…</div>
      </AdminLayout>
    );
  }
  if (!listing) {
    return (
      <AdminLayout title="Edit listing" subtitle="Not found">
        <div className="adm-card" style={{ padding: '2rem' }}>
          Listing not found. <Link to="/admin/listings">Back to listings</Link>
        </div>
      </AdminLayout>
    );
  }

  const sellerName = listing.seller?.business_name
    || listing.seller?.full_name
    || listing.seller?.username
    || 'Unknown seller';

  return (
    <AdminLayout
      title={'Edit: ' + listing.title}
      subtitle={
        'Seller: ' + sellerName +
        ' · ' + (listing.is_approved ? 'Live' : 'Unpublished') +
        (listing.is_sold ? ' · Sold' : '')
      }
      actions={
        <Link to={'/marketplace/listing/' + listing.slug} className="adm-btn" target="_blank" rel="noreferrer">
          Open public page →
        </Link>
      }
    >
      <div className="adm-card" style={{ padding: '1.25rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={handleToggleApproval}
            disabled={busy}
            className={'adm-btn' + (listing.is_approved ? '' : ' primary')}
          >
            {listing.is_approved ? 'Unpublish' : 'Approve & publish'}
          </button>
          <button
            type="button"
            onClick={handleToggleSold}
            disabled={busy}
            className="adm-btn"
          >
            {listing.is_sold ? 'Mark unsold' : 'Mark sold'}
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="adm-btn danger"
          >
            Delete listing
          </button>
        </div>

        <MarketplaceListingForm
          initial={listing}
          busy={busy}
          submitLabel="Save changes"
          onSubmit={handleSave}
          onCancel={() => navigate('/admin/listings')}
        />

        {err && (
          <div className="adm-error" style={{ marginTop: '1rem' }}>{err}</div>
        )}
      </div>
    </AdminLayout>
  );
}

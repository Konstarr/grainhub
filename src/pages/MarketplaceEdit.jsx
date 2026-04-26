import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import MarketplaceListingForm from '../components/marketplace/MarketplaceListingForm.jsx';
import {
  getListingById,
  updateMyListing,
  markMyListingSold,
  deleteMyListing,
} from '../lib/marketplaceDb.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * /marketplace/edit/:id — owner-only edit page (RLS enforced).
 *
 * Mods/admins land on /admin/listings/:id which uses a richer admin
 * version. This page is for the seller themselves.
 */

export default function MarketplaceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getListingById(id);
      if (cancelled) return;
      if (error) setErr(error.message || String(error));
      setListing(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const isOwner = !!(listing && user && listing.seller_id === user.id);

  const handleSave = async (payload) => {
    setBusy(true);
    setErr(null);
    const { error } = await updateMyListing(id, payload);
    setBusy(false);
    if (error) {
      setErr(error.message || String(error));
      return;
    }
    if (listing?.slug) {
      navigate('/marketplace/listing/' + listing.slug);
    } else {
      navigate('/marketplace');
    }
  };

  const handleMarkSold = async () => {
    if (!confirm('Mark this listing as sold? It will be hidden from the public grid but stay in your account.')) return;
    setBusy(true);
    const { error } = await markMyListingSold(id, true);
    setBusy(false);
    if (error) {
      alert(error.message || 'Could not update listing');
      return;
    }
    navigate('/marketplace');
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    setBusy(true);
    const { error } = await deleteMyListing(id);
    setBusy(false);
    if (error) {
      alert(error.message || 'Could not delete listing');
      return;
    }
    navigate('/marketplace');
  };

  if (!isAuthed) {
    return (
      <>
        <PageBack backTo="/marketplace" backLabel="Back to Marketplace" />
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
          <div className="rs-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Sign in to edit your listings</h2>
            <Link to="/login" className="act-btn primary">Sign in</Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageBack backTo="/marketplace" backLabel="Back to Marketplace" />
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
          <div className="rs-card" style={{ padding: '1.5rem' }}>Loading listing…</div>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <PageBack backTo="/marketplace" backLabel="Back to Marketplace" />
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
          <div className="rs-card" style={{ padding: '1.5rem' }}>
            Listing not found, or you don&apos;t have permission to edit it.
          </div>
        </div>
      </>
    );
  }

  if (!isOwner) {
    return (
      <>
        <PageBack backTo={'/marketplace/listing/' + listing.slug} backLabel="Back to listing" />
        <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
          <div className="rs-card" style={{ padding: '1.5rem' }}>
            You don&apos;t own this listing. <Link to={'/marketplace/listing/' + listing.slug}>View it</Link>.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBack
        backTo={'/marketplace/listing/' + listing.slug}
        backLabel="Back to listing"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Marketplace', to: '/marketplace' },
          { label: listing.title, to: '/marketplace/listing/' + listing.slug },
          { label: 'Edit' },
        ]}
      />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '1rem 1.25rem 4rem' }}>
        <header style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ margin: '0.3rem 0', fontSize: 28 }}>Edit listing</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Updates go live immediately. {listing.is_sold && (
              <span style={{ color: '#a35a00' }}>This listing is currently marked sold.</span>
            )}
          </p>
        </header>

        <div className="rs-card" style={{ padding: '1.5rem' }}>
          <MarketplaceListingForm
            initial={listing}
            busy={busy}
            submitLabel="Save changes"
            onSubmit={handleSave}
            onCancel={() => navigate('/marketplace/listing/' + listing.slug)}
          />

          {err && (
            <div style={{
              marginTop: '1rem',
              padding: '0.6rem 0.8rem',
              background: '#fff4f4',
              color: '#9c1f1f',
              border: '1px solid #f3c9c9',
              borderRadius: 8,
              fontSize: 13,
            }}>
              {err}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {!listing.is_sold && (
              <button
                type="button"
                onClick={handleMarkSold}
                disabled={busy}
                className="act-btn"
                style={{ background: '#fff7e6', borderColor: '#e8c089', color: '#a35a00' }}
              >
                Mark as sold
              </button>
            )}
            {listing.is_sold && (
              <button
                type="button"
                onClick={async () => {
                  setBusy(true);
                  const { error } = await markMyListingSold(id, false);
                  setBusy(false);
                  if (error) { alert(error.message); return; }
                  navigate('/marketplace/listing/' + listing.slug);
                }}
                disabled={busy}
                className="act-btn"
              >
                Re-list (mark unsold)
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="act-btn"
              style={{ background: '#fff4f4', borderColor: '#f3c9c9', color: '#9c1f1f' }}
            >
              Delete listing
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

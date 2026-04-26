import '../styles/listing.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Gallery from '../components/listing/Gallery.jsx';
import SpecsSection from '../components/listing/SpecsSection.jsx';
import DescriptionSection from '../components/listing/DescriptionSection.jsx';
import ConditionSection from '../components/listing/ConditionSection.jsx';
import SellerSection from '../components/listing/SellerSection.jsx';
import SimilarListings from '../components/listing/SimilarListings.jsx';
import PriceCard from '../components/listing/PriceCard.jsx';
import QuickDetails from '../components/listing/QuickDetails.jsx';
import SafetyCard from '../components/listing/SafetyCard.jsx';
import PageBack from '../components/shared/PageBack.jsx';
import { LISTING_HEADER } from '../data/listingData.js';
import { supabase } from '../lib/supabase.js';
import { mapMarketplaceRow } from '../lib/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import { markMyListingSold, deleteMyListing } from '../lib/marketplaceDb.js';
import { adminDeleteListing, adminToggleListingApproval } from '../lib/marketplaceAdminDb.js';

export default function Listing() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isModerator } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [actBusy, setActBusy] = useState(false);

  useEffect(() => {
    if (!slug) { setListing(null); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setListing(null);
      } else {
        setListing(mapMarketplaceRow(data));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const title = listing ? listing.title : LISTING_HEADER.title;
  const category = listing ? listing.category : (LISTING_HEADER.categories || [])[0];
  const location = listing ? listing.location : '';

  const isOwner = !!(listing && user && listing.sellerId === user.id);
  const canModerate = !!isModerator;

  const handleMarkSold = async () => {
    if (!listing) return;
    if (!confirm('Mark this listing as sold? It will be hidden from the public grid.')) return;
    setActBusy(true);
    const { error } = await markMyListingSold(listing.id, true);
    setActBusy(false);
    if (error) { alert(error.message || 'Could not update'); return; }
    setListing({ ...listing, isSold: true });
  };

  const handleDeleteOwn = async () => {
    if (!listing) return;
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    setActBusy(true);
    const { error } = await deleteMyListing(listing.id);
    setActBusy(false);
    if (error) { alert(error.message || 'Could not delete'); return; }
    navigate('/marketplace');
  };

  const handleAdminUnpublish = async () => {
    if (!listing) return;
    if (!confirm('Unpublish this listing? It will be hidden from the public grid until re-approved.')) return;
    setActBusy(true);
    const { error } = await adminToggleListingApproval(listing.id, false);
    setActBusy(false);
    if (error) { alert(error.message || 'Could not unpublish'); return; }
    setListing({ ...listing, isApproved: false });
  };

  const handleAdminDelete = async () => {
    if (!listing) return;
    if (!confirm('Admin delete this listing? This permanently removes it for everyone.')) return;
    setActBusy(true);
    const { error } = await adminDeleteListing(listing.id);
    setActBusy(false);
    if (error) { alert(error.message || 'Could not delete'); return; }
    navigate('/admin/listings');
  };

  return (
    <>
      <PageBack
        backTo="/marketplace"
        backLabel="Back to Marketplace"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Marketplace', to: '/marketplace' },
          { label: title || 'Listing' },
        ]}
      />

      <div className="listing-wrap">
        <div>
          <Gallery listing={listing} />

          <div className="listing-header">
            <div className="listing-cat-row">
              {listing ? (
                <span className="lcat lcat-cnc">{category || 'Listing'}</span>
              ) : (
                LISTING_HEADER.categories.map((cat) => (
                  <span key={cat} className="lcat lcat-cnc">{cat}</span>
                ))
              )}
              {listing && listing.id && (
                <span className="lcat-id">#{String(listing.id).slice(0, 8)}</span>
              )}
            </div>
            <h1 className="listing-title">{title}</h1>
            {listing && (
              <div className="listing-meta-row">
                {location && <div className="lm-item">{location}</div>}
                {listing.condition && <div className="lm-item">{listing.condition}</div>}
                {listing.isSold && (
                  <div className="lm-item" style={{ background: '#fff7e6', color: '#a35a00', padding: '2px 10px', borderRadius: 4 }}>
                    SOLD
                  </div>
                )}
                {!listing.isApproved && (
                  <div className="lm-item" style={{ background: '#fff4f4', color: '#9c1f1f', padding: '2px 10px', borderRadius: 4 }}>
                    UNPUBLISHED
                  </div>
                )}
              </div>
            )}

            {(isOwner || canModerate) && listing && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: '0.85rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border)',
              }}>
                {isOwner && (
                  <>
                    <Link
                      to={'/marketplace/edit/' + listing.id}
                      className="act-btn primary"
                      style={{ fontSize: 13 }}
                    >
                      Edit listing
                    </Link>
                    {!listing.isSold && (
                      <button
                        type="button"
                        onClick={handleMarkSold}
                        disabled={actBusy}
                        className="act-btn"
                        style={{ fontSize: 13, background: '#fff7e6', borderColor: '#e8c089', color: '#a35a00' }}
                      >
                        Mark sold
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDeleteOwn}
                      disabled={actBusy}
                      className="act-btn"
                      style={{ fontSize: 13, background: '#fff4f4', borderColor: '#f3c9c9', color: '#9c1f1f' }}
                    >
                      Delete
                    </button>
                  </>
                )}
                {canModerate && !isOwner && (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cinnabar)', alignSelf: 'center' }}>MOD:</span>
                    <Link
                      to={'/admin/listings/' + listing.id}
                      className="act-btn"
                      style={{ fontSize: 13 }}
                    >
                      Edit in admin
                    </Link>
                    {listing.isApproved && (
                      <button
                        type="button"
                        onClick={handleAdminUnpublish}
                        disabled={actBusy}
                        className="act-btn"
                        style={{ fontSize: 13 }}
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAdminDelete}
                      disabled={actBusy}
                      className="act-btn"
                      style={{ fontSize: 13, background: '#fff4f4', borderColor: '#f3c9c9', color: '#9c1f1f' }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
            {loading && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading listing...</div>}
            {!loading && slug && !listing && (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Listing not found. It may have been sold or removed.
              </div>
            )}
          </div>

          <SpecsSection />
          <DescriptionSection listing={listing} />
          <ConditionSection />
          <SellerSection />
          <SimilarListings />
        </div>

        <aside className="right-col">
          <PriceCard listing={listing} />
          <QuickDetails listing={listing} />
          <SafetyCard />
        </aside>
      </div>
    </>
  );
}

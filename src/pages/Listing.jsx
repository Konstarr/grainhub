import '../styles/listing.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function Listing() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug));

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
                {location && <div className="lm-item">📍 {location}</div>}
                {listing.condition && <div className="lm-item">✓ {listing.condition}</div>}
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

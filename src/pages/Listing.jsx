import '../styles/listing.css';
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

export default function Listing() {
  return (
    <>
      {/* BREADCRUMB */}
      <PageBack
        backTo="/marketplace"
        backLabel="Back to Marketplace"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Marketplace', to: '/marketplace' },
          { label: LISTING_HEADER.title },
        ]}
      />

      {/* PAGE */}
      <div className="listing-wrap">
        <div>
          {/* GALLERY */}
          <Gallery />

          {/* LISTING HEADER */}
          <div className="listing-header">
            <div className="listing-cat-row">
              {LISTING_HEADER.categories.map((cat) => (
                <span key={cat} className="lcat lcat-cnc">
                  {cat}
                </span>
              ))}
              <span className="lcat-id">{LISTING_HEADER.id}</span>
              <span className="lcat-views">{LISTING_HEADER.views} &nbsp;·&nbsp; {LISTING_HEADER.saves}</span>
            </div>
            <h1 className="listing-title">{LISTING_HEADER.title}</h1>
            <div className="listing-meta-row">
              {LISTING_HEADER.meta.map((item, idx) => (
                <div
                  key={idx}
                  className="lm-item"
                  style={item.highlight ? { marginLeft: 'auto', color: '#8B5E08', fontWeight: '500' } : {}}
                >
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* SPECS TABLE */}
          <SpecsSection />

          {/* DESCRIPTION */}
          <DescriptionSection />

          {/* CONDITION REPORT */}
          <ConditionSection />

          {/* SELLER */}
          <SellerSection />

          {/* SIMILAR */}
          <SimilarListings />
        </div>

        {/* RIGHT STICKY PANEL */}
        <aside className="right-col">
          <PriceCard />
          <QuickDetails />
          <SafetyCard />
        </aside>
      </div>
    </>
  );
}

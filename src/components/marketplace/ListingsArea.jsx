import FeaturedListing from './FeaturedListing.jsx';
import ListingSection from './ListingSection.jsx';
import SellCTA from './SellCTA.jsx';
import { FEATURED_LISTING, MACHINERY_LISTINGS, LUMBER_LISTINGS, SHEET_GOODS_LISTINGS, VEHICLE_LISTINGS, SURPLUS_LISTINGS } from '../../data/marketplaceData.js';

export default function ListingsArea({ recent }) {
  return (
    <div className="listings-col">
      <div className="listings-toolbar">
        <div className="listings-count">
          Showing <strong>3,140 listings</strong> across all categories
        </div>
        <div className="toolbar-right">
          <select className="sort-select">
            <option>Newest first</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Ending soon (Auction)</option>
            <option>Closest to me</option>
          </select>
          <div className="view-toggle">
            <button className="view-btn active" title="Grid">
              ⊞
            </button>
            <button className="view-btn" title="List">
              ☰
            </button>
          </div>
        </div>
      </div>

      <FeaturedListing listing={FEATURED_LISTING} />

      {recent && recent.length > 0 && (
        <ListingSection title="🆕 Latest Listings" link={`See all ${recent.length} →`} listings={recent} />
      )}

      <ListingSection title="⚙️ Machinery & Equipment" link="See all 892 →" listings={MACHINERY_LISTINGS} />
      <ListingSection title="🪵 Lumber & Hardwood" link="See all 484 →" listings={LUMBER_LISTINGS} />
      <ListingSection title="📋 Sheet Goods & Panel" link="See all 312 →" listings={SHEET_GOODS_LISTINGS} />
      <ListingSection title="🚛 Vehicles & Trailers" link="See all 148 →" listings={VEHICLE_LISTINGS} />
      <ListingSection title="📦 Surplus & Closeout" link="See all 434 →" listings={SURPLUS_LISTINGS} />

      <SellCTA />

      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn">4</button>
        <button className="page-btn">…</button>
        <button className="page-btn">64</button>
        <button className="page-btn">›</button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
          Showing 1–18 of 3,140 listings
        </span>
      </div>
    </div>
  );
}

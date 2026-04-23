import { Link } from 'react-router-dom';

export default function FeaturedListing({ listing }) {
  return (
    <Link to="/marketplace/listing" className="featured-listing">
      <span className="featured-badge">{listing.badge}</span>
      <div className={`listing-img ${listing.imgClass}`}>{listing.imgEmoji}</div>
      <div className="featured-body">
        <div>
          <div className="listing-meta-top">
            <span className="cat-badge cb-machinery">{listing.category}</span>
            <span className="cat-badge" style={{ background: '#EAF3DE', color: '#2D5016' }}>
              {listing.subCategory}
            </span>
            <span className="listing-id">{listing.id}</span>
          </div>
          <div className="featured-title">{listing.title}</div>
          <div className="listing-specs">
            <div className="spec-item">
              <span className="spec-label">Year</span>
              <span className="spec-val">{listing.year}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Condition</span>
              <span className="spec-val" style={{ color: '#2D5016' }}>
                {listing.condition}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Table</span>
              <span className="spec-val">{listing.table}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Location</span>
              <span className="spec-val">{listing.location}</span>
            </div>
          </div>
          <p className="featured-desc">{listing.description}</p>
        </div>
        <div className="featured-footer">
          <div>
            <div className="listing-price">{listing.price}</div>
            <div className="price-note">{listing.priceNote}</div>
          </div>
          <div className="listing-actions">
            <button className="btn-contact">📞 Contact Seller</button>
            <button className="btn-save">🔖 Save</button>
            <button className="btn-save">↗ Share</button>
          </div>
        </div>
      </div>
    </Link>
  );
}

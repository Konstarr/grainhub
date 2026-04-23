import { Link } from 'react-router-dom';
import { SIMILAR_LISTINGS } from '../../data/listingData.js';

export default function SimilarListings() {
  return (
    <div className="similar-section">
      <div className="similar-title">Similar Listings</div>
      <div className="similar-grid">
        {SIMILAR_LISTINGS.map((listing, idx) => (
          <Link key={idx} to="/marketplace/listing" className="similar-card" style={{ textDecoration: 'none' }}>
            <div className="sim-img" style={listing.imgStyle}>
              {listing.emoji}
            </div>
            <div className="sim-body">
              <span className="sim-cat" style={{ background: '#E6F1FB', color: '#185FA5' }}>
                {listing.category}
              </span>
              <div className="sim-title">{listing.title}</div>
              <div className="sim-price">{listing.price}</div>
              <div className="sim-loc">{listing.location}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

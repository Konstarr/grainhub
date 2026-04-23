import { SELLER } from '../../data/listingData.js';

export default function SellerSection() {
  return (
    <div className="seller-section">
      <div className="seller-header">About the Seller</div>
      <div className="seller-profile">
        <div className="seller-av">{SELLER.avatar}</div>
        <div className="seller-info">
          <div className="seller-name">{SELLER.name}</div>
          <div className="seller-badges">
            {SELLER.badges.map((badge) => (
              <span key={badge.label} className={`seller-badge ${badge.class}`}>
                {badge.label}
              </span>
            ))}
          </div>
          <div className="seller-location">{SELLER.location}</div>
        </div>
      </div>
      <div className="seller-stats">
        {SELLER.stats.map((stat) => (
          <div key={stat.label} className="seller-stat">
            <div className="ss-num">{stat.num}</div>
            <div className="ss-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

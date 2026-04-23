import { SELL_CTA } from '../../data/marketplaceData.js';

export default function SellCTA() {
  return (
    <div className="sell-cta">
      <div>
        <h3>{SELL_CTA.heading}</h3>
        <p>{SELL_CTA.description}</p>
        <div className="sell-cta-actions">
          <button className="sell-btn-primary">Post a Listing Now →</button>
          <button className="sell-btn-outline">View Pricing & Plans</button>
        </div>
      </div>
      <div className="sell-pricing-grid">
        {SELL_CTA.tiers.map((tier) => (
          <div key={tier.name} className="price-tier">
            <div className="tier-name">{tier.name}</div>
            <div className="tier-price">{tier.price}</div>
            <div className="tier-desc">{tier.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { A_LA_CARTE } from '../../lib/pricing.js';

/**
 * À la carte one-off sponsorship items — pulled from the unified
 * pricing config (lib/pricing.js) so this section stays automatically
 * in sync with /pricing. Email blasts, newsletter sponsorships,
 * event sponsorships, featured articles, etc.
 */
export default function SponsorAlaCarte() {
  return (
    <section className="sponsor-section sponsor-alacarte-section">
      <div className="sponsor-section-inner">
        <div className="sponsor-intro-max">
          <div className="sponsor-section-eyebrow">À La Carte</div>
          <h2 className="sponsor-section-title">
            Just need one thing? <em>We've got it.</em>
          </h2>
          <p className="sponsor-section-sub">
            One-off promotions for product launches, events, or seasonal pushes — no monthly
            commitment. Stack with any package on the <Link to="/pricing">pricing page</Link>.
          </p>
        </div>
        <div className="sponsor-alacarte-grid">
          {A_LA_CARTE.map((item) => (
            <div key={item.id} className="sponsor-ac-card">
              <div className="sponsor-ac-icon">
                {item.icon}
              </div>
              <div className="sponsor-ac-title">{item.name}</div>
              <div className="sponsor-ac-desc">{item.tagline}</div>
              <div className="sponsor-ac-price">
                ${item.price.toLocaleString()} <span>· {item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

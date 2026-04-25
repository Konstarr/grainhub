import { Link } from 'react-router-dom';
import { SPONSOR_TIERS, formatPrice } from '../../lib/pricing.js';

/**
 * The three sponsorship tiers (Silver / Gold / Platinum) — read
 * straight from lib/pricing.js so this section stays in sync with
 * the unified /pricing page, the admin editor, and the gating logic.
 *
 * Highlight tier (Gold) gets the "Most popular" ribbon. Each card's
 * CTA routes to the unified pricing page so the entire purchase flow
 * lives in one place.
 */
export default function SponsorPackages() {
  return (
    <section className="sponsor-section sponsor-packages-section" id="sponsor-packages">
      <div className="sponsor-section-inner">
        <div className="sponsor-packages-intro">
          <div>
            <div className="sponsor-section-eyebrow">Sponsorship Packages</div>
            <h2 className="sponsor-section-title">
              Pick your level of <em>visibility.</em>
            </h2>
          </div>
          <p>
            Three flat tiers, billed monthly, no per-impression fees. Stack with any business
            membership or role pack on the <Link to="/account/subscription">pricing page</Link>.
          </p>
        </div>

        <div className="sponsor-packages-grid">
          {SPONSOR_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={'sponsor-pkg-card ' + (tier.highlight ? 'featured' : '')}
            >
              <div className="sponsor-pkg-header">
                {tier.highlight && <div className="sponsor-pkg-featured-tag">Most popular</div>}
                <div className="sponsor-pkg-tier">{tier.id.toUpperCase()}</div>
                <div className="sponsor-pkg-name">{tier.name.replace(' Sponsor', '')}</div>
                <div className="sponsor-pkg-price">
                  {formatPrice(tier.priceMonthly)}
                  {tier.priceMonthly > 0 && <span>/mo</span>}
                </div>
                <div className="sponsor-pkg-desc">{tier.tagline}</div>
              </div>
              <div className="sponsor-pkg-body">
                <div className="sponsor-pkg-features">
                  {tier.features.map((feat) => (
                    <div key={feat} className="sponsor-pkg-feat">
                      <span className="sponsor-pkg-check">✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
                <Link
                  to="/account/subscription?persona=business"
                  className={'sponsor-pkg-btn sponsor-pkg-btn-' + (tier.highlight ? 'primary' : 'secondary')}
                  style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                >
                  Become {tier.name.replace(' Sponsor', '')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

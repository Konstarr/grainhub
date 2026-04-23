import { PRICING_PACKAGES } from '../../data/sponsorData.js';

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
            All packages include a verified supplier directory listing, analytics dashboard, and a
            dedicated account manager. Custom packages available for enterprise brands.
          </p>
        </div>

        <div className="sponsor-packages-grid">
          {PRICING_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`sponsor-pkg-card ${pkg.featured ? 'featured' : ''}`}
            >
              <div className="sponsor-pkg-header">
                {pkg.featured && <div className="sponsor-pkg-featured-tag">Most Popular</div>}
                <div className="sponsor-pkg-tier">{pkg.tier}</div>
                <div className="sponsor-pkg-name">{pkg.name}</div>
                <div className="sponsor-pkg-price">
                  {pkg.price} <span>{pkg.period}</span>
                </div>
                <div className="sponsor-pkg-desc">{pkg.desc}</div>
              </div>
              <div className="sponsor-pkg-body">
                <div className="sponsor-pkg-features">
                  {pkg.features.map((feat) => (
                    <div
                      key={feat.text}
                      className={`sponsor-pkg-feat ${feat.included ? '' : 'muted'}`}
                    >
                      <span className="sponsor-pkg-check">
                        {feat.included ? '✓' : '–'}
                      </span>
                      {feat.text}
                    </div>
                  ))}
                </div>
                <button
                  className={`sponsor-pkg-btn sponsor-pkg-btn-${pkg.buttonVariant}`}
                >
                  {pkg.button}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

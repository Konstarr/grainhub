import { SPONSOR_HERO_STATS } from '../../data/sponsorData.js';

export default function SponsorHero() {
  const scrollToPackages = () => {
    const element = document.getElementById('sponsor-packages');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('sponsor-contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sponsor-hero">
      <div className="sponsor-hero-inner">
        <div className="sponsor-hero-eyebrow">AWI Florida Chapter Sponsorship</div>
        <h1>
          Reach the people who<br />
          <em>buy what you sell.</em>
        </h1>
        <p className="sponsor-hero-sub">
          <strong>24,800 millwork and cabinet professionals</strong> — cabinet makers, CNC
          operators, shop owners, estimators, and purchasing managers — actively engaged on the
          industry's only modern community platform.
        </p>
        <div className="sponsor-hero-buttons">
          <button className="sponsor-hero-btn primary" onClick={scrollToPackages}>
            View Sponsorship Packages →
          </button>
          <button className="sponsor-hero-btn outline" onClick={scrollToContact}>
            Talk to Our Team
          </button>
        </div>

        <div className="sponsor-hero-proof-strip">
          {SPONSOR_HERO_STATS.map((stat) => (
            <div key={stat.label}>
              <div className="sponsor-proof-stat">
                <div className="sponsor-proof-num">{stat.num}</div>
                <div className="sponsor-proof-label">{stat.label}</div>
              </div>
              {stat.label !== SPONSOR_HERO_STATS[SPONSOR_HERO_STATS.length - 1].label && (
                <div className="sponsor-proof-divider"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

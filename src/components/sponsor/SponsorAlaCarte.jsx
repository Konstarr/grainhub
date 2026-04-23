import { ALACARTE_OPTIONS } from '../../data/sponsorData.js';

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
            Add individual placements on top of any package, or buy them standalone. Minimum
            1-month commitment.
          </p>
        </div>
        <div className="sponsor-alacarte-grid">
          {ALACARTE_OPTIONS.map((option) => (
            <div key={option.title} className="sponsor-ac-card">
              <div className={`sponsor-ac-icon ${option.iconBg}`}>
                {option.icon}
              </div>
              <div className="sponsor-ac-title">{option.title}</div>
              <div className="sponsor-ac-desc">{option.desc}</div>
              <div className="sponsor-ac-price">
                ${option.price} <span>{option.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

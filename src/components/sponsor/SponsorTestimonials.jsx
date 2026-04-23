import { TESTIMONIALS } from '../../data/sponsorData.js';

export default function SponsorTestimonials() {
  return (
    <section className="sponsor-section sponsor-testimonials-section">
      <div className="sponsor-section-inner">
        <div className="sponsor-section-centered">
          <div className="sponsor-section-eyebrow">Sponsor Feedback</div>
          <h2 className="sponsor-section-title">
            What sponsors <em>actually say.</em>
          </h2>
        </div>
        <div className="sponsor-t-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="sponsor-t-card">
              <div className="sponsor-t-stars">{t.stars}</div>
              <div className="sponsor-t-quote">{t.quote}</div>
              <div className="sponsor-t-author">
                <div className="sponsor-t-av" style={{ background: t.bg }}>
                  {t.initials}
                </div>
                <div>
                  <div className="sponsor-t-name">{t.author}</div>
                  <div className="sponsor-t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

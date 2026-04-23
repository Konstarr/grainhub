import { CURRENT_SPONSORS } from '../../data/sponsorData.js';

export default function SponsorCurrentSponsors() {
  return (
    <div className="sponsor-current-sponsors">
      <div className="sponsor-cs-inner">
        <span className="sponsor-cs-label">Current Sponsors</span>
        <div className="sponsor-cs-logos">
          {CURRENT_SPONSORS.map((sponsor) => (
            <div key={sponsor} className="sponsor-cs-logo">
              {sponsor}
            </div>
          ))}
        </div>
        <span className="sponsor-cs-cta">Join them →</span>
      </div>
    </div>
  );
}

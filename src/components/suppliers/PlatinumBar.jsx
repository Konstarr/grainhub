import { PLATINUM_SPONSORS } from '../../data/suppliersData.js';

export default function PlatinumBar() {
  return (
    <div className="platinum-bar">
      <div className="platinum-inner">
        <div className="platinum-label">⭐ Platinum Sponsors</div>
        <div className="platinum-grid">
          {PLATINUM_SPONSORS.map((sponsor) => (
            <div key={sponsor.logo} className="platinum-card">
              <div className="plat-logo" style={{ background: 'linear-gradient(135deg, #2D5A3D, #2D6A4F)' }}>
                {sponsor.logo}
              </div>
              <div className="plat-info">
                <div className="plat-name">{sponsor.name}</div>
                <div className="plat-cat">{sponsor.category}</div>
                <div className="plat-badge">{sponsor.badge}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

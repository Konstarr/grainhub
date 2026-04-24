import { Link } from 'react-router-dom';

/**
 * Visual grid of the 8 primary trades. Each tile is a warm gradient
 * with a big emoji/symbol, the trade name, and a "Explore →" link
 * that filters the Forums to that trade via the existing ?trade=
 * URL param.
 *
 * Self-contained: no DB calls, no props — just a wall of
 * hand-picked presets. This is the "map of the site" moment.
 */
const TRADES = [
  { slug: 'cabinet-making',      name: 'Cabinet Making',      icon: '🪵', color: 'linear-gradient(135deg, #3A1F0A, #7A4420)' },
  { slug: 'millwork-moulding',   name: 'Millwork & Moulding', icon: '🏛️', color: 'linear-gradient(135deg, #2C4830, #5A8F3A)' },
  { slug: 'finishing-coatings',  name: 'Finishing',           icon: '🎨', color: 'linear-gradient(135deg, #5A2D3D, #A85670)' },
  { slug: 'cnc-machining',       name: 'CNC & Machining',     icon: '⚙️', color: 'linear-gradient(135deg, #1C3D5C, #3B83B8)' },
  { slug: 'wood-species',        name: 'Wood Species',        icon: '🌳', color: 'linear-gradient(135deg, #2D3F1F, #6A8A3F)' },
  { slug: 'hardware-accessories',name: 'Hardware',            icon: '🔩', color: 'linear-gradient(135deg, #4A2A12, #A0522D)' },
  { slug: 'safety-standards',    name: 'Safety & Standards',  icon: '🛡️', color: 'linear-gradient(135deg, #5A3E0E, #B08A2E)' },
  { slug: 'business-ops',        name: 'Business & Ops',      icon: '📊', color: 'linear-gradient(135deg, #3D1F3A, #7A4970)' },
];

export default function TradeCategoriesTiles() {
  return (
    <section className="home-section">
      <div className="home-section-inner">
        <div className="home-section-head">
          <div>
            <div className="home-section-eyebrow">Explore</div>
            <h2 className="home-section-title">Browse by trade.</h2>
            <p className="home-section-sub">
              Jump into the corner of GrainHub that matches what you build.
            </p>
          </div>
        </div>

        <div className="home-trades-grid">
          {TRADES.map((t) => (
            <Link
              key={t.slug}
              to={`/forums?trade=${t.slug}`}
              className="home-trade-tile"
              style={{ background: t.color }}
            >
              <span className="home-trade-icon" aria-hidden="true">{t.icon}</span>
              <span className="home-trade-name">{t.name}</span>
              <span className="home-trade-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

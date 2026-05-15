import { Link } from 'react-router-dom';

/**
 * Visual grid of Florida regions. Each tile is the chapter's regional
 * meet-up category — clicking goes straight to the matching Regional
 * Meet-ups forum via the ?region= URL param.
 *
 * The eight background photos were chosen by the chapter and shouldn't
 * be swapped — only the labels/links map to FL regions.
 */
const STORAGE = 'https://ozjtreaqyxlgsmopvwif.supabase.co/storage/v1/object/public/media/homepage';

const REGIONS = [
  { slug: 'region-south-fl',        name: 'South Florida',           sub: 'Miami-Dade · Broward · Palm Beach · Monroe',         image: STORAGE + '/cabinet-maker.jpg',         color: 'linear-gradient(135deg, #1B3A2E, #2D6A4F)' },
  { slug: 'region-treasure-coast',  name: 'Treasure Coast',          sub: 'Martin · St. Lucie · Indian River · Okeechobee',     image: STORAGE + '/millwork-and-moulding.jpg', color: 'linear-gradient(135deg, #1F4534, #2D5A3D)' },
  { slug: 'region-central-fl',      name: 'Central Florida',         sub: 'Orlando · Volusia · Brevard · Lake · Polk · Seminole', image: STORAGE + '/finishing.jpg',           color: 'linear-gradient(135deg, #1B3A2E, #2D6A4F)' },
  { slug: 'region-tampa-bay',       name: 'Tampa Bay',               sub: 'Hillsborough · Pinellas · Pasco · Manatee · Sarasota', image: STORAGE + '/cnc-and-machining.jpg',   color: 'linear-gradient(135deg, #1F4534, #2D5A3D)' },
  { slug: 'region-southwest-fl',    name: 'Southwest Florida',       sub: 'Lee · Collier · Charlotte · Hendry',                 image: STORAGE + '/wood-species.jpg',          color: 'linear-gradient(135deg, #1B3A2E, #2D6A4F)' },
  { slug: 'region-north-fl',        name: 'Northeast FL / Jax',      sub: 'Duval · Clay · St. Johns · Nassau',                  image: STORAGE + '/hardware.jpg',              color: 'linear-gradient(135deg, #1F4534, #2D5A3D)' },
  { slug: 'region-north-central',   name: 'North Central Florida',   sub: 'Alachua · Marion · Gainesville · Ocala',             image: STORAGE + '/safety-and-standards.jpg',  color: 'linear-gradient(135deg, #1B3A2E, #2D6A4F)' },
  { slug: 'region-panhandle',       name: 'Panhandle',               sub: 'Escambia · Santa Rosa · Okaloosa · Bay · Leon',      image: STORAGE + '/business-and-ops.jpg',      color: 'linear-gradient(135deg, #1F4534, #2D5A3D)' },
];

export default function TradeCategoriesTiles() {
  return (
    <section className="home-section">
      <div className="home-section-inner">
        <div className="home-section-head">
          <div>
            <div className="home-section-eyebrow">Explore</div>
            <h2 className="home-section-title">Browse by Regions of Florida.</h2>
            <p className="home-section-sub">
              Jump into your corner of the AWI Florida Chapter — find regional meet-ups, local vendor talk, and the shops nearby.
            </p>
          </div>
        </div>

        <div className="home-trades-grid">
          {REGIONS.map((r) => (
            <Link
              key={r.slug}
              to={`/forums?region=${r.slug}`}
              className="home-trade-tile"
              style={{
                backgroundImage: `url('${r.image}')`,
                // Fallback gradient behind the image in case the URL fails.
                backgroundColor: '#1F4534',
              }}
            >
              {/* Color-tinted scrim on top of the photo — pulls each tile
                  into the AWI forest palette AND keeps the title readable. */}
              <span className="home-trade-scrim" style={{ backgroundImage: r.color }} aria-hidden="true" />
              <span className="home-trade-name">{r.name}</span>
              <span className="home-trade-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

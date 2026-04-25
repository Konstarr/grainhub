import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommunities } from '../../lib/communityDb.js';

/**
 * Horizontal showcase of the top public communities. Each card
 * reads as a visual preview: colored banner strip, icon, name,
 * member count, short description.
 */
export default function CommunitiesShowcase() {
  const [communities, setCommunities] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchCommunities({ limit: 6 });
      if (!cancelled) {
        setCommunities(data || []);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loaded) return null;

  return (
    <section className="home-section">
      <div className="home-section-inner">
        <div className="home-section-head">
          <div>
            <div className="home-section-eyebrow">Communities</div>
            <h2 className="home-section-title">Find your people.</h2>
            <p className="home-section-sub">
              User-run groups by trade, region, and shop type. Drop in, post,
              introduce yourself.
            </p>
          </div>
          <Link to="/communities" className="home-section-cta">
            Browse all →
          </Link>
        </div>

        {communities.length === 0 ? (
          <div className="home-empty-card">
            <strong>No communities yet.</strong>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              <Link to="/communities/new" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>
                Start the first one →
              </Link>
            </div>
          </div>
        ) : (
          <div className="home-comm-grid">
            {communities.map((c, i) => (
              <CommunityShowcaseCard key={c.id} c={c} accentIndex={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const ACCENTS = [
  'linear-gradient(135deg, #3A1F0A, #7A4420)',
  'linear-gradient(135deg, #2C4830, #5A8F3A)',
  'linear-gradient(135deg, #1C3D5C, #3B83B8)',
  'linear-gradient(135deg, #4A2A12, #A0522D)',
  'linear-gradient(135deg, #3D1F3A, #7A4970)',
  'linear-gradient(135deg, #5A3E0E, #B08A2E)',
];

function CommunityShowcaseCard({ c, accentIndex }) {
  const accent = ACCENTS[accentIndex % ACCENTS.length];
  const initials = (c.name || '??').split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join('').toUpperCase();

  return (
    <Link to={`/c/${c.slug}`} className="home-comm-card">
      <div
        className="home-comm-banner"
        style={{
          backgroundImage: c.banner_url
            ? `url(${c.banner_url})`
            : accent,
        }}
      />
      <div className="home-comm-icon-wrap">
        {c.icon_url ? (
          <img src={c.icon_url} alt="" className="home-comm-icon" loading="lazy" decoding="async" />
        ) : (
          <div className="home-comm-icon home-comm-icon-fb" style={{ background: accent }}>
            {initials}
          </div>
        )}
      </div>
      <div className="home-comm-body">
        <div className="home-comm-name">{c.name}</div>
        <div className="home-comm-meta">
          {(c.member_count || 0).toLocaleString()} member{c.member_count === 1 ? '' : 's'}
          {c.thread_count ? ' · ' + (c.thread_count || 0).toLocaleString() + ' posts' : ''}
        </div>
        {c.description && (
          <div className="home-comm-desc">{c.description}</div>
        )}
      </div>
    </Link>
  );
}

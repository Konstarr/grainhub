import { POPULAR_ARTICLES, FEATURED_QUALITY, TOP_CONTRIBUTORS } from '../../data/wikiData.js';

function PopularCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">🔥 Most Read This Month</div>
      <div className="rs-body">
        {POPULAR_ARTICLES.map((article) => (
          <div key={article.title} className="popular-item">
            <div className="pi-rank">{article.rank}</div>
            <div>
              <div className="pi-title">{article.title}</div>
              <div className="pi-meta">{article.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">⭐ Featured Quality Articles</div>
      <div className="rs-body">
        {FEATURED_QUALITY.map((article) => (
          <div key={article.title} className="quality-item">
            <span className="qi-title">{article.title}</span>
            <span className={`qi-badge qb-${article.badge === 'Featured' ? 'featured' : 'good'}`}>
              {article.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorsCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">🏆 Top Contributors</div>
      <div className="rs-body">
        {TOP_CONTRIBUTORS.map((contributor) => (
          <div key={contributor.name} className="contrib-item">
            <div className="ci-av" style={{ background: contributor.bgColor }}>
              {contributor.initials}
            </div>
            <div>
              <div className="ci-name">{contributor.name}</div>
              <div className="ci-edits">{contributor.edits}</div>
            </div>
            <div className="ci-pts">{contributor.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorCard() {
  return (
    <div className="sponsor-rs">
      <div className="sp-label">Wiki Sponsor</div>
      <div className="sp-title">Blum CLIP top BLUMOTION</div>
      <div className="sp-sub">The most-specified concealed hinge in North America. Download the full technical reference catalog.</div>
      <button className="sp-btn">Download Catalog →</button>
    </div>
  );
}

function GuidelinesCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">📖 Wiki Guidelines</div>
      <div className="rs-body" style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
        <p style={{ marginBottom: '8px' }}>
          Articles should be factual, practical, and written from first-hand trade experience. No promotional content. No brand endorsements.
        </p>
        <p style={{ marginBottom: '8px' }}>
          Cite standards, sources, and manufacturers where applicable. All measurements in both imperial and metric where possible.
        </p>
        <a href="#" style={{ color: 'var(--wood-warm)', fontWeight: '500' }}>
          Read the full contributor guide →
        </a>
      </div>
    </div>
  );
}

export default function WikiSidebar() {
  return (
    <aside className="right-col">
      <PopularCard />
      <QualityCard />
      <ContributorsCard />
      <SponsorCard />
      <GuidelinesCard />
    </aside>
  );
}

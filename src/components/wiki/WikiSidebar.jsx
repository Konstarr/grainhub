import { POPULAR_ARTICLES, TOP_CONTRIBUTORS } from '../../data/wikiData.js';

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

// Slimmed sidebar: we kept the three highest-signal cards (Popular, Contributors,
// Sponsor) and dropped Quality + Guidelines. Guidelines live on the contributor
// page; featured-quality is already surfaced via badges on the main content cards.
export default function WikiSidebar() {
  return (
    <aside className="right-col">
      <PopularCard />
      <ContributorsCard />
      <SponsorCard />
    </aside>
  );
}

import { POPULAR_ARTICLES, TOP_CONTRIBUTORS } from '../../data/wikiData.js';
import { SponsorSidebar } from '../sponsors/AdSlot.jsx';

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

// Slimmed sidebar: Popular, Contributors, and the live sponsor slot
// (which falls back to a 'Become a sponsor' card when no sponsor is
// approved for the sidebar slot).
export default function WikiSidebar() {
  return (
    <aside className="right-col">
      <PopularCard />
      <ContributorsCard />
      <SponsorSidebar />
    </aside>
  );
}

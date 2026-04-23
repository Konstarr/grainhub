import { WIKI_HERO_STATS } from '../../data/wikiData.js';

export default function WikiHero() {
  return (
    <div className="wiki-hero">
      <div className="hero-inner">
        <div className="hero-top">
          <div className="hero-left">
            <div className="hero-eyebrow">GrainHub Industry Wiki</div>
            <h1 className="hero-title">The trade's<br /><em>knowledge base.</em><br />Written by the pros.</h1>
            <p className="hero-sub">
              3,600 community-written articles covering every aspect of millwork and cabinet work — construction methods, species profiles, machine operation, finishing systems, standards, and business templates.
            </p>

            <div className="wiki-search">
              <div className="ws-icon">🔍</div>
              <input
                className="ws-input"
                type="text"
                placeholder='Search 3,600 articles — try "frameless cabinet" or "white oak"...'
              />
              <button className="ws-btn">Search</button>
            </div>

            <div className="search-suggestions">
              <span className="search-sug-label">Popular:</span>
              <span className="search-sug">Frameless Cabinet Construction</span>
              <span className="search-sug">· Hard Maple</span>
              <span className="search-sug">· PUR Edge Banding</span>
              <span className="search-sug">· KCMA A161.1</span>
              <span className="search-sug">· CNC Nesting</span>
              <span className="search-sug">· MagnaMax</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stats-grid">
              {WIKI_HERO_STATS.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <div className="hs-num">{stat.num}</div>
                  <div className="hs-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

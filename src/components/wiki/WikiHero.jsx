import { WIKI_HERO_STATS } from '../../data/wikiData.js';

export default function WikiHero({ searchQuery = '', onSearchChange, onSearchSubmit }) {
  const submit = () => { if (onSearchSubmit) onSearchSubmit(); };

  return (
    <div className="wiki-hero">
      <div className="hero-inner">
        <div className="hero-top">
          <div className="hero-left">
            <div className="hero-eyebrow">GrainHub Industry Wiki</div>
            <h1 className="hero-title">The trade's <em>knowledge base.</em> Written by the pros.</h1>
            <p className="hero-sub">
              Community-written articles covering every aspect of millwork and cabinet work — construction methods, species profiles, machine operation, finishing systems, standards, and business templates.
            </p>

            <div className="wiki-search">
              <div className="ws-icon">🔍</div>
              <input
                className="ws-input"
                type="text"
                placeholder='Search articles — try "frameless cabinet" or "white oak"...'
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              />
              <button className="ws-btn" onClick={submit} type="button">Search</button>
            </div>

            <div className="search-suggestions">
              <span className="search-sug-label">Popular:</span>
              <span className="search-sug" onClick={() => { onSearchChange && onSearchChange('frameless cabinet'); submit(); }}>Frameless Cabinet</span>
              <span className="search-sug" onClick={() => { onSearchChange && onSearchChange('hard maple'); submit(); }}> · Hard Maple</span>
              <span className="search-sug" onClick={() => { onSearchChange && onSearchChange('edge banding'); submit(); }}> · Edge Banding</span>
              <span className="search-sug" onClick={() => { onSearchChange && onSearchChange('CNC'); submit(); }}> · CNC</span>
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

import { WIKI_HERO_STATS } from '../../data/wikiData.js';

export default function WikiHero({ searchQuery = '', onSearchChange, onSearchSubmit }) {
  const submit = () => { if (onSearchSubmit) onSearchSubmit(); };

  return (
    <>
      {/* 220px brown hero band — matches every other index page. Just the
          eyebrow / title / subtitle group so the height stays aligned. */}
      <div className="wiki-hero gh-hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="hero-left">
              <div className="hero-eyebrow">AWI Florida Chapter · Member Resources</div>
              <h1 className="hero-title">Technical resources for <em>Florida millwork pros.</em></h1>
              <p className="hero-sub">
                Reference articles on construction methods, species profiles, finishing, hardware, AWS standards, Florida code compliance, and shop operations — curated by the chapter and contributed by members.
              </p>
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

      {/* Dedicated search strip directly under the hero. Lives outside the
          locked-height hero so the button can never clip or overlap. */}
      <div className="wiki-search-strip">
        <div className="wiki-search-inner">
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
        
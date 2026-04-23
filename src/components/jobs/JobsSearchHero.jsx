export default function JobsSearchHero() {
  return (
    <div className="page-header" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="header-inner" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <div className="search-hero">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#9A7B5C" strokeWidth="1.5" />
              <path d="M11 11 L14 14" stroke="#9A7B5C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Job title, skill, or keyword..." />
          </div>
          <div className="search-input-wrap" style={{ minWidth: '180px', flex: '0.5' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z"
                stroke="#9A7B5C"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="8" cy="6" r="1.5" stroke="#9A7B5C" strokeWidth="1.3" fill="none" />
            </svg>
            <input type="text" placeholder="City, state, or zip..." />
          </div>
          <select className="search-select">
            <option>All Job Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Temporary</option>
            <option>Apprenticeship</option>
          </select>
          <button className="search-btn">Find Jobs →</button>
        </div>
      </div>
    </div>
  );
}

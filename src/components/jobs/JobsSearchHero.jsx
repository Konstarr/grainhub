export default function JobsSearchHero({
  keyword = '',
  onKeywordChange,
  location = '',
  onLocationChange,
  jobType = 'All Job Types',
  onJobTypeChange,
}) {
  return (
    <div
      style={{
        background: 'var(--wood-cream, #FBF6EC)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2.5rem',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="search-hero">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#6B7280" strokeWidth="1.5" />
              <path d="M11 11 L14 14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Job title, skill, or keyword..."
              value={keyword}
              onChange={(e) => onKeywordChange && onKeywordChange(e.target.value)}
            />
          </div>
          <div className="search-input-wrap" style={{ minWidth: '180px', flex: '0.5' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z"
                stroke="#6B7280"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="8" cy="6" r="1.5" stroke="#6B7280" strokeWidth="1.3" fill="none" />
            </svg>
            <input
              type="text"
              placeholder="City, state, or zip..."
              value={location}
              onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
            />
          </div>
          <select
            className="search-select"
            value={jobType}
            onChange={(e) => onJobTypeChange && onJobTypeChange(e.target.value)}
          >
            <option>All Job Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Temporary</option>
            <option>Apprenticeship</option>
          </select>
          <button
            type="button"
            className="search-btn"
            onClick={() => { /* no-op; inputs already filter live */ }}
          >
            Find Jobs →
          </button>
        </div>
      </div>
    </div>
  );
}

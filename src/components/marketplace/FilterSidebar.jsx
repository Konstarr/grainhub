import { FILTER_OPTIONS } from '../../data/marketplaceData.js';

export default function FilterSidebar({ filters, onFilterChange }) {
  const handleConditionToggle = (condition) => {
    const current = filters.conditions || [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    onFilterChange({ ...filters, conditions: updated });
  };

  return (
    <aside className="filter-col">
      <div className="filter-card">
        <div className="filter-header">
          Filters <span className="filter-clear">Clear all</span>
        </div>
        <div className="filter-body">
          <div className="filter-section">
            <div className="filter-label">Category</div>
            <div className="filter-options">
              {FILTER_OPTIONS.categories.map((cat) => (
                <label key={cat.label} className="filter-opt">
                  <input type="checkbox" defaultChecked={cat.checked} />
                  <span className="filter-opt-label">{cat.label}</span>
                  <span className="filter-opt-count">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Price Range</div>
            <div className="price-range">
              <input className="price-input" type="text" placeholder="Min $" />
              <span className="price-sep">—</span>
              <input className="price-input" type="text" placeholder="Max $" />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Condition</div>
            <div className="condition-pills">
              {FILTER_OPTIONS.conditions.map((cond) => (
                <span
                  key={cond}
                  className={`condition-pill ${
                    (filters.conditions || []).includes(cond) ? 'active' : ''
                  }`}
                  onClick={() => handleConditionToggle(cond)}
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Listing Type</div>
            <div className="filter-options">
              {FILTER_OPTIONS.listingTypes.map((type) => (
                <label key={type.label} className="filter-opt">
                  <input type="checkbox" defaultChecked={type.checked} />
                  <span className="filter-opt-label">{type.label}</span>
                  <span className="filter-opt-count">{type.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Location</div>
            <div className="filter-options">
              {FILTER_OPTIONS.locations.map((loc) => (
                <label key={loc.label} className="filter-opt">
                  <input type="checkbox" />
                  <span className="filter-opt-label">{loc.label}</span>
                  <span className="filter-opt-count">{loc.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Posted Within</div>
            <div className="filter-options">
              {FILTER_OPTIONS.timeframes.map((time) => (
                <label key={time.label} className="filter-opt">
                  <input type="checkbox" defaultChecked={time.checked} />
                  <span className="filter-opt-label">{time.label}</span>
                  <span className="filter-opt-count">{time.count}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="apply-btn">Apply Filters</button>
        </div>
      </div>
    </aside>
  );
}

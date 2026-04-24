import { FILTER_OPTIONS } from '../../data/marketplaceData.js';

export default function FilterSidebar({ filters, onFilterChange, onClearAll }) {
  const conds = filters.conditions || [];

  const handleConditionToggle = (condition) => {
    const updated = conds.includes(condition)
      ? conds.filter((c) => c !== condition)
      : [...conds, condition];
    onFilterChange({ ...filters, conditions: updated });
  };

  const setPrice = (key, v) => {
    const clean = (v || '').replace(/[^0-9]/g, '');
    onFilterChange({ ...filters, [key]: clean });
  };

  return (
    <aside className="filter-col">
      <div className="filter-card">
        <div className="filter-header">
          Filters
          <span className="filter-clear" onClick={onClearAll} style={{ cursor: 'pointer' }}>Clear all</span>
        </div>
        <div className="filter-body">
          <div className="filter-section">
            <div className="filter-label">Price Range</div>
            <div className="price-range">
              <input
                className="price-input"
                type="text"
                inputMode="numeric"
                placeholder="Min $"
                value={filters.priceMin || ''}
                onChange={(e) => setPrice('priceMin', e.target.value)}
              />
              <span className="price-sep">—</span>
              <input
                className="price-input"
                type="text"
                inputMode="numeric"
                placeholder="Max $"
                value={filters.priceMax || ''}
                onChange={(e) => setPrice('priceMax', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Condition</div>
            <div className="condition-pills">
              {FILTER_OPTIONS.conditions.map((cond) => (
                <span
                  key={cond}
                  className={'condition-pill ' + (conds.includes(cond) ? 'active' : '')}
                  onClick={() => handleConditionToggle(cond)}
                >
                  {cond}
                </span>
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
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

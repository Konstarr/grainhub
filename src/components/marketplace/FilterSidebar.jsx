import { FILTER_OPTIONS } from '../../data/marketplaceData.js';

export default function FilterSidebar({ filters, onFilterChange, onClearAll }) {
  const conds = filters.conditions || [];
  const cats = filters.categories || [];
  const types = filters.listingTypes || [];
  const locs = filters.locations || [];
  const timeframe = filters.timeframe || '';

  const toggleIn = (key, value, current) => {
    const updated = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const setPrice = (key, v) => {
    const clean = (v || '').replace(/[^0-9]/g, '');
    onFilterChange({ ...filters, [key]: clean });
  };

  const setTimeframe = (value) => {
    onFilterChange({ ...filters, timeframe: timeframe === value ? '' : value });
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
            <div className="filter-label">Category</div>
            <div className="filter-options">
              {FILTER_OPTIONS.categories.map((cat) => {
                if (cat.label === 'All Categories') return null;
                return (
                  <label key={cat.label} className="filter-opt">
                    <input
                      type="checkbox"
                      checked={cats.includes(cat.label)}
                      onChange={() => toggleIn('categories', cat.label, cats)}
                    />
                    <span className="filter-opt-label">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

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
                  onClick={() => toggleIn('conditions', cond, conds)}
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
                  <input
                    type="checkbox"
                    checked={types.includes(type.label)}
                    onChange={() => toggleIn('listingTypes', type.label, types)}
                  />
                  <span className="filter-opt-label">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Location</div>
            <div className="filter-options">
              {FILTER_OPTIONS.locations.map((loc) => (
                <label key={loc.label} className="filter-opt">
                  <input
                    type="checkbox"
                    checked={locs.includes(loc.label)}
                    onChange={() => toggleIn('locations', loc.label, locs)}
                  />
                  <span className="filter-opt-label">{loc.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Posted Within</div>
            <div className="filter-options">
              {FILTER_OPTIONS.timeframes.map((t) => (
                <label key={t.label} className="filter-opt">
                  <input
                    type="checkbox"
                    checked={timeframe === t.label}
                    onChange={() => setTimeframe(t.label)}
                  />
                  <span className="filter-opt-label">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

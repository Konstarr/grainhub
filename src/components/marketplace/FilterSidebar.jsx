import { useEffect, useState } from 'react';
import { FILTER_OPTIONS } from '../../data/marketplaceData.js';
import PriceRangeSlider from './PriceRangeSlider.jsx';
import { geocodeZip, looksLikeZip } from '../../lib/geocode.js';

const RADIUS_OPTIONS = [10, 25, 50, 100, 200, 500];

export default function FilterSidebar({ filters, onFilterChange, onClearAll }) {
  const conds = filters.conditions || [];
  const cats = filters.categories || [];
  const types = filters.listingTypes || [];
  const locs = filters.locations || [];
  const timeframe = filters.timeframe || '';

  const [zipInput, setZipInput] = useState(filters.distanceZip || '');
  const [zipError, setZipError] = useState(null);
  const [zipBusy, setZipBusy]   = useState(false);

  // Keep local zip input synced if parent clears filters.
  useEffect(() => {
    if ((filters.distanceZip || '') !== zipInput && !zipBusy) {
      setZipInput(filters.distanceZip || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.distanceZip]);

  const toggleIn = (key, value, current) => {
    const updated = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const setTimeframe = (value) => {
    onFilterChange({ ...filters, timeframe: timeframe === value ? '' : value });
  };

  const applyZip = async (raw) => {
    const z = (raw || '').trim();
    if (!z) {
      // Clear distance filter.
      onFilterChange({
        ...filters,
        distanceZip: '',
        distanceLat: null,
        distanceLng: null,
        distanceRadius: filters.distanceRadius || 50,
      });
      setZipError(null);
      return;
    }
    if (!looksLikeZip(z)) {
      setZipError('Enter a valid zip / postal code.');
      return;
    }
    setZipBusy(true);
    setZipError(null);
    const coords = await geocodeZip(z);
    setZipBusy(false);
    if (!coords) {
      setZipError('Could not look up that zip. Try a nearby one.');
      return;
    }
    onFilterChange({
      ...filters,
      distanceZip: z,
      distanceLat: coords.lat,
      distanceLng: coords.lng,
      distanceRadius: filters.distanceRadius || 50,
    });
  };

  const setRadius = (miles) => {
    onFilterChange({ ...filters, distanceRadius: miles });
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
            <PriceRangeSlider
              minValue={filters.priceMin}
              maxValue={filters.priceMax}
              onChange={(p) => onFilterChange({ ...filters, ...p })}
              floor={0}
              ceiling={100000}
              step={250}
            />
          </div>

          <div className="filter-section">
            <div className="filter-label">Distance</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Your zip"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                onBlur={() => applyZip(zipInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); applyZip(zipInput); }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '0.4rem 0.55rem',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--surface, #fff)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
              {zipInput && (
                <button
                  type="button"
                  onClick={() => { setZipInput(''); applyZip(''); }}
                  style={{
                    padding: '0.4rem 0.55rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {zipBusy && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                Looking up zip...
              </div>
            )}
            {zipError && (
              <div style={{ fontSize: 12, color: '#9c1f1f', marginBottom: 6 }}>
                {zipError}
              </div>
            )}
            {filters.distanceLat != null && filters.distanceLng != null && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #555)', marginBottom: 4 }}>
                  Within {filters.distanceRadius || 50} miles
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadius(r)}
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: (filters.distanceRadius || 50) === r ? 'var(--wood-warm, #2D6A4F)' : '#fff',
                        color: (filters.distanceRadius || 50) === r ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {r} mi
                    </button>
                  ))}
                </div>
              </>
            )}
            {!filters.distanceLat && !zipBusy && !zipError && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Enter your zip to filter by miles.
              </div>
            )}
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
            <div className="filter-label">Region</div>
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

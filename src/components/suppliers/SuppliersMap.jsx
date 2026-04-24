import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SUPPLIER_LIST,
  SUPPLIER_CATEGORIES,
  supplierMatchesCategoryId,
} from '../../data/suppliersData.js';
import { matchesTrade } from '../../lib/trades.js';

// ── Marker icon fix for Leaflet + bundlers ────────────────────────────────────
// Leaflet ships its marker PNGs at runtime relative to the CSS, which Vite
// breaks. Point the defaults at the CDN copies so pins render on every host.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Continental US center + fit-all-pins view.
const US_CENTER = [39.5, -98.35];
const DEFAULT_ZOOM = 4;

// Helper: pans/zooms the map so every visible marker fits in the viewport.
// Runs whenever the filtered list changes.
function FitToMarkers({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 10);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
  }, [map, points]);
  return null;
}

export default function SuppliersMap({ activeCategory, onCategoryChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';
  const [query, setQuery] = useState('');

  // Filtered supplier set. Combines the three filter sources:
  //   1. activeCategory — the big tile grid (hardware, lumber, …)
  //   2. trade         — URL ?trade=<slug> from the SecondaryNav bar
  //   3. query         — free text across name, city, state
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUPPLIER_LIST.filter((s) => {
      if (!supplierMatchesCategoryId(s, activeCategory)) return false;
      if (trade && !matchesTrade(s, trade)) return false;
      if (q) {
        const hay = `${s.name} ${s.city} ${s.state}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, trade, query]);

  const handleClearFilters = useCallback(() => {
    setQuery('');
    if (onCategoryChange) onCategoryChange('');
    if (trade) {
      const next = new URLSearchParams(searchParams);
      next.delete('trade');
      setSearchParams(next, { replace: true });
    }
  }, [onCategoryChange, searchParams, setSearchParams, trade]);

  const hasActiveFilter = query || activeCategory || trade;

  return (
    <div style={wrapperStyle}>
      {/* Filter bar above the map */}
      <div style={filterBarStyle}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <input
            type="text"
            placeholder="Search by name, city, or state…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={activeCategory || ''}
            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">All categories</option>
            {SUPPLIER_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{visible.length}</strong>{' '}
            {visible.length === 1 ? 'supplier' : 'suppliers'} shown
          </div>
          {hasActiveFilter && (
            <button type="button" onClick={handleClearFilters} style={clearBtnStyle}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Map canvas */}
      <div style={{ position: 'relative' }}>
        <MapContainer
          center={US_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '560px' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkers points={visible} />
          {visible.map((s) => (
            <Marker key={s.name} position={[s.lat, s.lng]}>
              <Popup>
                <div style={{ minWidth: '200px', fontFamily: "'Montserrat', sans-serif" }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    {s.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#333', lineHeight: 1.4 }}>
                    {s.address}
                    <br />
                    {s.city}, {s.state} {s.zip || ''}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '6px', color: '#333' }}>
                    ⭐ {s.rating} · {s.reviews} reviews
                  </div>
                  <Link
                    to="/suppliers/profile"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#A0522D',
                      textDecoration: 'none',
                    }}
                  >
                    View profile →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {visible.length === 0 && (
          <div style={overlayEmptyStyle}>
            <div style={{ fontSize: '22px', marginBottom: '0.25rem' }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>No suppliers match your filters</div>
            <button type="button" onClick={handleClearFilters} style={{ ...clearBtnStyle, marginTop: '0.75rem' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── inline styles ────────────────────────────────────────────────────────────
const wrapperStyle = {
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(43, 26, 14, 0.04)',
};

const filterBarStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  borderBottom: '1px solid var(--border-light)',
  background: '#FAF6EE',
  flexWrap: 'wrap',
};

const searchInputStyle = {
  flex: 1,
  minWidth: '180px',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: "'Montserrat', sans-serif",
  background: 'var(--white)',
};

const selectStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: "'Montserrat', sans-serif",
  background: 'var(--white)',
  cursor: 'pointer',
};

const clearBtnStyle = {
  padding: '0.4rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  background: 'var(--white)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: "'Montserrat', sans-serif",
};

const overlayEmptyStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255,255,255,0.96)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '1rem 1.25rem',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  zIndex: 500,
  pointerEvents: 'auto',
};

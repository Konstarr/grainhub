import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import {
  SUPPLIER_LIST,
  SUPPLIER_CATEGORIES,
  supplierMatchesCategoryId,
} from '../../data/suppliersData.js';
import { matchesTrade } from '../../lib/trades.js';

// Center of the continental US — a good default zoom-to-fit starting point.
const US_CENTER = { lat: 39.5, lng: -98.35 };
const DEFAULT_ZOOM = 4;

const MAP_CONTAINER = { width: '100%', height: '480px' };

// Clean wood-toned Google Maps styling. Strips noisy POIs and warms the
// base layer so the map blends with the rest of the site rather than
// looking like a drop-in iframe.
const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F5EFE6' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D7E3E8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A6E4A' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#C9B69A' }] },
];

export default function SuppliersMap({ activeCategory, onCategoryChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'grainhub-google-maps',
    googleMapsApiKey: apiKey || '',
  });

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

  // Close the info window whenever the filter set shrinks past the open pin.
  useEffect(() => {
    if (openIdx != null && !visible.find((s) => s.name === openIdx)) {
      setOpenIdx(null);
    }
  }, [visible, openIdx]);

  const handleClearFilters = useCallback(() => {
    setQuery('');
    if (onCategoryChange) onCategoryChange('');
    if (trade) {
      const next = new URLSearchParams(searchParams);
      next.delete('trade');
      setSearchParams(next, { replace: true });
    }
  }, [onCategoryChange, searchParams, setSearchParams, trade]);

  // Quiet fallback when the API key is missing — don't blow up the page.
  if (!apiKey) {
    return (
      <div style={wrapperStyle}>
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>🗺️</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Map unavailable</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px' }}>
            Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in your environment to
            enable the supplier map. The list below still works.
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={wrapperStyle}>
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>⚠️</div>
          <div style={{ fontWeight: 600 }}>Couldn't load Google Maps</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Check that your API key is valid and the Maps JavaScript API is enabled.
          </div>
        </div>
      </div>
    );
  }

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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{visible.length}</strong>{' '}
            {visible.length === 1 ? 'supplier' : 'suppliers'} shown
          </div>
          {(query || activeCategory || trade) && (
            <button type="button" onClick={handleClearFilters} style={clearBtnStyle}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Map canvas */}
      <div style={{ position: 'relative' }}>
        {!isLoaded ? (
          <div style={{ ...MAP_CONTAINER, ...emptyStateStyle }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading map…</div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER}
            center={US_CENTER}
            zoom={DEFAULT_ZOOM}
            options={{
              styles: MAP_STYLES,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              clickableIcons: false,
              gestureHandling: 'greedy',
            }}
          >
            {visible.map((s) => (
              <Marker
                key={s.name}
                position={{ lat: s.lat, lng: s.lng }}
                onClick={() => setOpenIdx(s.name)}
                title={s.name}
              />
            ))}

            {openIdx &&
              (() => {
                const s = visible.find((x) => x.name === openIdx);
                if (!s) return null;
                return (
                  <InfoWindow
                    position={{ lat: s.lat, lng: s.lng }}
                    onCloseClick={() => setOpenIdx(null)}
                  >
                    <div style={{ minWidth: '200px', fontFamily: "'DM Sans', sans-serif" }}>
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
                  </InfoWindow>
                );
              })()}
          </GoogleMap>
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
  marginBottom: '1.5rem',
};

const filterBarStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  padding: '0.9rem 1rem',
  borderBottom: '1px solid var(--border-light)',
  background: 'var(--wood-paper)',
  flexWrap: 'wrap',
};

const searchInputStyle = {
  flex: 1,
  minWidth: '180px',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
  background: 'var(--white)',
};

const selectStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
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
  fontFamily: "'DM Sans', sans-serif",
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1rem',
  textAlign: 'center',
  background: 'var(--wood-paper)',
  color: 'var(--text-primary)',
};

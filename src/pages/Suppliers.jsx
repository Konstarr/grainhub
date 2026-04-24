import '../styles/suppliers.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SupplierTable from '../components/suppliers/SupplierTable.jsx';
import SuppliersMap from '../components/suppliers/SuppliersMap.jsx';
import { SUPPLIERS_HEADER, SUPPLIER_CATEGORIES } from '../data/suppliersData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapSupplierRow } from '../lib/mappers.js';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';

export default function Suppliers() {
  const [searchParams] = useSearchParams();
  const navCategory = searchParams.get('category') || '';

  const [activeCategory, setActiveCategory] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Mirror the secondary-nav ?category= into the in-page active category.
  useEffect(() => {
    setActiveCategory(navCategory);
  }, [navCategory]);

  const { data: rows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true),
    order: { column: 'rating', ascending: false },
    limit: 100,
  });
  const liveSuppliers = rows.map((r) => {
    const m = mapSupplierRow(r);
    return {
      logo: m.logo,
      name: m.name,
      category: m.category || '',
      rating: m.rating || '',
      reviews: String(m.reviewCount || 0),
      location: m.address || '',
      badges: m.badges || [],
      trade: m.trade,
    };
  });

  return (
    <>
      <div className="page-header gh-hero">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <div className="page-eyebrow">{SUPPLIERS_HEADER.eyebrow}</div>
              <h1 className="page-title">{SUPPLIERS_HEADER.title}</h1>
              <p className="page-subtitle">{SUPPLIERS_HEADER.subtitle}</p>
            </div>
            <div className="header-stats">
              {SUPPLIERS_HEADER.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="hstat-num">{stat.num}</div>
                  <div className="hstat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="search-hero">
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#9A7B5C" strokeWidth="1.5" />
                <path d="M11 11 L14 14" stroke="#9A7B5C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search for hardware, lumber, CNC suppliers..." />
            </div>
            <select className="search-select">
              <option>All Categories</option>
              {SUPPLIER_CATEGORIES.map((cat) => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button className="search-btn">Search Suppliers →</button>
          </div>
        </div>
      </div>

      <div className="main-wrap" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setShowMap((v) => (v ? false : true))}
          aria-expanded={showMap}
          style={mapTogglePillStyle}
        >
          <span style={{ fontSize: '16px' }}>{showMap ? '✕' : '🗺'}</span>
          <span>
            {showMap ? 'Hide map' : 'Show map — find suppliers near you'}
          </span>
        </button>

        {showMap && (
          <div style={{ marginTop: '1rem' }}>
            <SuppliersMap
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        )}
      </div>

      <div className="cat-highway">
        <div className="cat-highway-inner">
          {SUPPLIER_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`cat-tile ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? '' : cat.id)
              }
            >
              <div
                className="cat-tile-icon"
                style={{ background: 'linear-gradient(135deg, #2C1A0E, #6B3F1F)' }}
              >
                {cat.icon}
              </div>
              <div className="cat-tile-name">{cat.name}</div>
              <div className="cat-tile-count">{cat.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-wrap">
        <div>
          <SupplierTable activeCategory={activeCategory} suppliers={liveSuppliers} />
        </div>
        <aside className="right-col">
          <SponsorSidebar />
        </aside>
      </div>
    </>
  );
}

const mapTogglePillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.55rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: '999px',
  background: 'var(--white)',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

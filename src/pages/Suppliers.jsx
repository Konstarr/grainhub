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
  const [view, setView] = useState('list'); // 'list' | 'map'

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
      logoUrl: m.logoUrl,
      name: m.name,
      description: m.description || '',
      category: m.category || '',
      rating: m.rating || '',
      reviews: String(m.reviewCount || 0),
      reviewCount: m.reviewCount || 0,
      location: m.address || '',
      website: m.website || '',
      phone: m.phone || '',
      isVerified: m.isVerified,
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
          {/* Sleek view switcher — lives at the top of the center column.
              Same width as the list/map below, so swapping views doesn't
              shift the layout. */}
          <div className="view-switch-row">
            <div className="view-switch-label">
              {view === 'map' ? 'Map view' : 'Directory view'}
            </div>
            <div className="view-switch" role="tablist" aria-label="View mode">
              <button
                type="button"
                role="tab"
                aria-selected={view === 'list'}
                className={`view-switch-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 3.5h12M2 8h12M2 12.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                List
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'map'}
                className={`view-switch-btn ${view === 'map' ? 'active' : ''}`}
                onClick={() => setView('map')}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1.5 3.5 5.5 2l5 1.5 4-1.5v10l-4 1.5-5-1.5-4 1.5v-10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M5.5 2v11M10.5 3.5v11" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                Map
              </button>
              {/* Animated slider pill behind the active tab */}
              <span
                className="view-switch-thumb"
                style={{ transform: view === 'list' ? 'translateX(0%)' : 'translateX(100%)' }}
                aria-hidden="true"
              />
            </div>
          </div>

          {view === 'list' ? (
            <SupplierTable activeCategory={activeCategory} suppliers={liveSuppliers} />
          ) : (
            <SuppliersMap
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          )}
        </div>
        <aside className="right-col">
          <SponsorSidebar />
        </aside>
      </div>
    </>
  );
}

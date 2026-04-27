import '../styles/suppliers.css';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SupplierTable from '../components/suppliers/SupplierTable.jsx';
import { SUPPLIERS_HEADER, SUPPLIER_CATEGORIES } from '../data/suppliersData.js';

// Leaflet + react-leaflet weigh ~180KB minified — none of which is
// needed unless the user actually flips to map view. Lazy-load.
const SuppliersMap = lazy(() => import('../components/suppliers/SuppliersMap.jsx'));
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapSupplierRow } from '../lib/mappers.js';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';

const PREVIEW_LIMIT = 10;

// Map a Supabase row → the shape SupplierTable / preview lists expect.
function shapeSupplier(r) {
  const m = mapSupplierRow(r);
  return {
    slug: m.slug,
    kind: m.kind,
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
}

/** A compact list card used inside each landing column. */
function PreviewColumn({ title, eyebrow, suppliers, viewAllHref, viewAllLabel, emptyLabel }) {
  return (
    <div className="kind-col">
      <div className="kind-col-head">
        <div>
          <div className="kind-col-eyebrow">{eyebrow}</div>
          <h2 className="kind-col-title">{title}</h2>
        </div>
        <Link to={viewAllHref} className="kind-col-viewall">{viewAllLabel} →</Link>
      </div>
      <div className="kind-col-list">
        {suppliers.length === 0 ? (
          <div className="kind-col-empty">{emptyLabel}</div>
        ) : suppliers.map((s) => (
          <Link
            key={s.slug || s.name}
            to={s.slug ? `/suppliers/${s.slug}` : '/suppliers/profile'}
            className="kind-col-row"
          >
            {s.logoUrl
              ? <img src={s.logoUrl} alt={`${s.name} logo`} className="kind-col-logo-img" />
              : <span className="kind-col-logo-text">{s.logo}</span>}
            <div className="kind-col-meta">
              <div className="kind-col-name">
                {s.name}
                {s.isVerified && <span className="kind-col-verified" title="Verified">✓</span>}
              </div>
              <div className="kind-col-sub">
                {s.category || s.trade}
                {s.location && <> &middot; {s.location}</>}
              </div>
            </div>
            <div className="kind-col-rating">
              {s.rating ? <>{Number(s.rating).toFixed(1)} ★ <span style={{ opacity: 0.6 }}>({s.reviewCount})</span></> : '—'}
            </div>
          </Link>
        ))}
      </div>
      <Link to={viewAllHref} className="kind-col-allbtn">
        {viewAllLabel} →
      </Link>
    </div>
  );
}

export default function Suppliers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navCategory = searchParams.get('category') || '';
  const kindParam   = searchParams.get('kind');
  // No kind param → landing (two columns). With kind → focused full list.
  const focusedKind = kindParam === 'manufacturer' ? 'manufacturer'
                    : kindParam === 'vendor'       ? 'vendor'
                    : null;
  const isLanding = !focusedKind;

  const [activeCategory, setActiveCategory] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'map'

  useEffect(() => { setActiveCategory(navCategory); }, [navCategory]);

  // Landing mode: two preview lists (10 each).
  const { data: vendorRows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true).eq('kind', 'vendor'),
    order:  { column: 'rating', ascending: false },
    limit:  PREVIEW_LIMIT,
    deps:   ['preview-vendor'],
  });
  const { data: mfrRows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true).eq('kind', 'manufacturer'),
    order:  { column: 'rating', ascending: false },
    limit:  PREVIEW_LIMIT,
    deps:   ['preview-manufacturer'],
  });

  // Focused mode: one full list, by kind.
  const { data: focusedRows } = useSupabaseList('suppliers', {
    filter: (q) => q.eq('is_approved', true).eq('kind', focusedKind || 'vendor'),
    order:  { column: 'rating', ascending: false },
    limit:  100,
    deps:   ['focused-' + (focusedKind || 'vendor')],
  });

  const vendorPreview = vendorRows.map(shapeSupplier);
  const mfrPreview    = mfrRows.map(shapeSupplier);
  const focusedList   = focusedRows.map(shapeSupplier);

  return (
    <>
      <div className="page-header gh-hero">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <div className="page-eyebrow">
                {focusedKind === 'manufacturer' ? 'MANUFACTURERS'
                  : focusedKind === 'vendor'    ? 'VENDORS'
                  : SUPPLIERS_HEADER.eyebrow}
              </div>
              <h1 className="page-title">
                {focusedKind === 'manufacturer' ? 'Millwork shops & cabinet makers'
                  : focusedKind === 'vendor'    ? 'Vendors & parts suppliers'
                  : SUPPLIERS_HEADER.title}
              </h1>
              <p className="page-subtitle">
                {focusedKind === 'manufacturer'
                  ? 'Find local custom millwork shops, cabinet makers, finishers, and installers.'
                  : focusedKind === 'vendor'
                  ? 'Hardware, lumber, CNC tooling, finishes, and everything in between.'
                  : SUPPLIERS_HEADER.subtitle}
              </p>
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

          {!isLanding && (
            <div style={{ marginTop: 12 }}>
              <Link to="/suppliers" className="kind-tab" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
                ← All directories
              </Link>
            </div>
          )}

          <div className="search-hero">
            <div className="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#9A7B5C" strokeWidth="1.5" />
                <path d="M11 11 L14 14" stroke="#9A7B5C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={focusedKind === 'manufacturer'
                  ? 'Search cabinet shops, millwork, installers near you…'
                  : 'Search hardware, lumber, CNC suppliers…'}
              />
            </div>
            <select className="search-select">
              <option>All Categories</option>
              {SUPPLIER_CATEGORIES.map((cat) => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button className="search-btn">
              {focusedKind === 'manufacturer' ? 'Search Manufacturers →' : 'Search Suppliers →'}
            </button>
          </div>
        </div>
      </div>

      {/* Category highway only on focused view (cleaner landing) */}
      {!isLanding && (
        <div className="cat-highway">
          <div className="cat-highway-inner">
            {SUPPLIER_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`cat-tile ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
              >
                <div className="cat-tile-icon" style={{ background: 'linear-gradient(135deg, #2C1A0E, #6B3F1F)' }}>
                  {cat.icon}
                </div>
                <div className="cat-tile-name">{cat.name}</div>
                <div className="cat-tile-count">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LANDING: two columns */}
      {isLanding ? (
        <div className="main-wrap suppliers-wrap">
          <div>
            <div className="kind-intro">
              <div className="kind-intro-card">
                <div className="kind-intro-icon">🛠️</div>
                <div>
                  <div className="kind-intro-h">Vendors</div>
                  <p>
                    Hardware, lumber, panel goods, abrasives, finishes, CNC tooling, and shop equipment —
                    the parts and tools that keep your shop running.
                  </p>
                </div>
              </div>
              <div className="kind-intro-card">
                <div className="kind-intro-icon">🪵</div>
                <div>
                  <div className="kind-intro-h">Manufacturers</div>
                  <p>
                    Custom millwork shops, cabinet makers, finishers, and installers —
                    the trade businesses near you who actually build the work.
                  </p>
                </div>
              </div>
            </div>
            <div className="kind-split">
              <PreviewColumn
                eyebrow="VENDORS"
                title="Top vendors & parts suppliers"
                suppliers={vendorPreview}
                viewAllHref="/suppliers?kind=vendor"
                viewAllLabel="View all vendors"
                emptyLabel="No vendors yet."
              />
              <PreviewColumn
                eyebrow="MANUFACTURERS"
                title="Top millwork shops & cabinet makers"
                suppliers={mfrPreview}
                viewAllHref="/suppliers?kind=manufacturer"
                viewAllLabel="View all manufacturers"
                emptyLabel="No manufacturers yet."
              />
            </div>
          </div>
          <aside className="right-col">
            <SponsorSidebar />
          </aside>
        </div>
      ) : (
        // FOCUSED: existing list / map view
        <div className="main-wrap suppliers-wrap">
          <div>
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
                <span
                  className="view-switch-thumb"
                  style={{ transform: view === 'list' ? 'translateX(0%)' : 'translateX(100%)' }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {view === 'list' ? (
              <SupplierTable activeCategory={activeCategory} suppliers={focusedList} />
            ) : (
              <Suspense fallback={
                <div style={{
                  height: 540,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  background: '#FAF6EE',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}>
                  Loading map…
                </div>
              }>
                <SuppliersMap
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </Suspense>
            )}
          </div>
          <aside className="right-col">
            <SponsorSidebar />
          </aside>
        </div>
      )}
    </>
  );
}

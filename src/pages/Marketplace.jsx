import '../styles/marketplace.css';
import { useMemo, useState } from 'react';
import CategoryHighway from '../components/marketplace/CategoryHighway.jsx';
import FilterSidebar from '../components/marketplace/FilterSidebar.jsx';
import ListingsArea from '../components/marketplace/ListingsArea.jsx';
import { MARKETPLACE_HEADER } from '../data/marketplaceData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapMarketplaceRow } from '../lib/mappers.js';

const COND_LABEL = {
  'new': 'New',
  'used-excellent': 'Excellent',
  'used-good': 'Good',
  'used-fair': 'Fair',
};
const EMOJI_BY_CAT = {
  'CNC Machinery': '⚙️',
  'Edgebanders': '🔧',
  'Moulders': '🏭',
  'Finishing': '🎨',
  'Stationary Tools': '🪚',
  'Combination': '🛠',
  'Hand/Power Tools': '🔌',
  'Panel Saws': '📐',
  'Dust Collection': '💨',
  'Lumber': '🪵',
  'Sheet Goods': '📋',
  'Hardware': '🔩',
  'Sanders': '🧽',
  'Tooling': '🔩',
};

const DEFAULT_FILTERS = {
  conditions: ['New', 'Excellent', 'Good', 'Fair'],
  priceMin: '',
  priceMax: '',
};

const CATEGORY_PATTERN = {
  'all': () => true,
  'machinery': (c) => /machin|cnc|edgeband|moulder|saw|sander|dust|combin/i.test(c),
  'lumber': (c) => /lumber/i.test(c),
  'sheet': (c) => /sheet/i.test(c),
  'hardware': (c) => /hardware/i.test(c),
  'finishing': (c) => /finish|coat/i.test(c),
  'tooling': (c) => /tool|bit/i.test(c),
  'vehicles': (c) => /vehicle|trailer|truck/i.test(c),
  'shop': (c) => /shop|office|fixture/i.test(c),
  'surplus': (c) => /surplus|closeout/i.test(c),
};

function toListingCard(row) {
  const m = mapMarketplaceRow(row);
  return {
    id: m.id,
    slug: m.slug,
    category: m.category || 'Misc',
    condition: COND_LABEL[m.condition] || 'Used',
    title: m.title,
    location: m.location || 'U.S.',
    shipping: 'Local pickup',
    price: m.price || 'Contact',
    priceNumeric: m.priceNumeric,
    priceUnit: '',
    emoji: EMOJI_BY_CAT[m.category] || '📦',
    imgClass: 'mk-img-default',
    imgStyle: { background: 'linear-gradient(135deg, #2C1A0E, #6B3F1F)' },
    specs: m.description ? m.description.slice(0, 80) + (m.description.length > 80 ? '…' : '') : '',
    isNew: false,
    images: m.images,
    createdAt: row.created_at,
  };
}

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortMode, setSortMode] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const { data: rows } = useSupabaseList('marketplace_listings', {
    filter: (q) => q.eq('is_approved', true).eq('is_sold', false),
    order: { column: 'created_at', ascending: false },
    limit: 200,
  });

  const allListings = useMemo(() => rows.map(toListingCard), [rows]);

  const visible = useMemo(() => {
    const catMatcher = CATEGORY_PATTERN[activeCategory] || (() => true);
    const min = filters.priceMin === '' ? null : Number(filters.priceMin);
    const max = filters.priceMax === '' ? null : Number(filters.priceMax);
    const conds = filters.conditions || [];

    let out = allListings.filter((l) => {
      if (catMatcher(l.category) === false) return false;
      if (conds.length > 0 && conds.includes(l.condition) === false) return false;
      if (min !== null && !Number.isNaN(min) && (l.priceNumeric == null || l.priceNumeric < min)) return false;
      if (max !== null && !Number.isNaN(max) && (l.priceNumeric == null || l.priceNumeric > max)) return false;
      return true;
    });

    if (sortMode === 'price-asc') {
      out = [...out].sort((a, b) => (a.priceNumeric ?? Infinity) - (b.priceNumeric ?? Infinity));
    } else if (sortMode === 'price-desc') {
      out = [...out].sort((a, b) => (b.priceNumeric ?? -Infinity) - (a.priceNumeric ?? -Infinity));
    }
    return out;
  }, [allListings, activeCategory, filters, sortMode]);

  return (
    <>
      <div className="page-header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <div className="page-eyebrow">{MARKETPLACE_HEADER.eyebrow}</div>
              <h1 className="page-title">{MARKETPLACE_HEADER.title}</h1>
              <p className="page-subtitle">{MARKETPLACE_HEADER.subtitle}</p>
            </div>
            <div className="header-stats">
              {MARKETPLACE_HEADER.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="hstat-num">{stat.num}</div>
                  <div className="hstat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="search-hero">
            <div className="search-hero-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#9A7B5C" strokeWidth="1.5" />
                <path d="M11 11 L14 14" stroke="#9A7B5C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search for machinery, lumber, hardware, trucks..." />
            </div>
            <select className="search-select">
              <option>All Categories</option>
              <option>Machinery & Equipment</option>
              <option>Lumber & Hardwood</option>
              <option>Sheet Goods & Panel</option>
              <option>Hardware & Fasteners</option>
              <option>Finishing & Coatings</option>
              <option>Tooling & Bits</option>
              <option>Vehicles & Trailers</option>
              <option>Shop Fixtures & Furniture</option>
              <option>Surplus & Closeout</option>
            </select>
            <select className="search-select" style={{ minWidth: '130px' }}>
              <option>Anywhere</option>
              <option>Northeast US</option>
              <option>Southeast US</option>
              <option>Midwest US</option>
              <option>West US</option>
              <option>Canada</option>
            </select>
            <button className="search-btn">Search Listings →</button>
          </div>
        </div>
      </div>

      <CategoryHighway activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

      <div className="mk-wrap">
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={() => { setFilters(DEFAULT_FILTERS); setActiveCategory('all'); }}
        />
        <ListingsArea
          listings={visible}
          totalCount={allListings.length}
          sortMode={sortMode}
          onSortChange={setSortMode}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
      </div>
    </>
  );
}

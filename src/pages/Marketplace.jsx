import '../styles/marketplace.css';
import { useState } from 'react';
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

function toListingCard(row) {
  const m = mapMarketplaceRow(row);
  return {
    id: m.id,
    category: m.category || 'Misc',
    condition: COND_LABEL[m.condition] || 'Used',
    title: m.title,
    location: m.location || 'U.S.',
    shipping: 'Local pickup',
    price: m.price || 'Contact',
    priceUnit: '',
    emoji: EMOJI_BY_CAT[m.category] || '📦',
    imgClass: 'mk-img-default',
    imgStyle: { background: 'linear-gradient(135deg, #2C1A0E, #6B3F1F)' },
    specs: m.description ? m.description.slice(0, 80) + (m.description.length > 80 ? '…' : '') : '',
    isNew: false,
  };
}

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({ conditions: ['New', 'Excellent', 'Good'] });

  const { data: rows } = useSupabaseList('marketplace_listings', {
    filter: (q) => q.eq('is_approved', true).eq('is_sold', false),
    order: { column: 'created_at', ascending: false },
    limit: 12,
  });
  const recent = rows.map(toListingCard);

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
        <FilterSidebar filters={filters} onFilterChange={setFilters} />
        <ListingsArea recent={recent} />
      </div>
    </>
  );
}

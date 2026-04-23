import '../styles/marketplace.css';
import { useState } from 'react';
import CategoryHighway from '../components/marketplace/CategoryHighway.jsx';
import FilterSidebar from '../components/marketplace/FilterSidebar.jsx';
import ListingsArea from '../components/marketplace/ListingsArea.jsx';
import { MARKETPLACE_HEADER } from '../data/marketplaceData.js';

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({ conditions: ['New', 'Excellent', 'Good'] });

  return (
    <>
      {/* PAGE HEADER */}
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

          {/* SEARCH HERO */}
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

      {/* CATEGORY HIGHWAY */}
      <CategoryHighway activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

      {/* MAIN */}
      <div className="mk-wrap">
        <FilterSidebar filters={filters} onFilterChange={setFilters} />
        <ListingsArea />
      </div>
    </>
  );
}

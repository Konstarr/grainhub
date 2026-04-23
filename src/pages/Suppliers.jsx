import '../styles/suppliers.css';
import { useState } from 'react';
import SecondaryNav from '../components/layout/SecondaryNav.jsx';
import PlatinumBar from '../components/suppliers/PlatinumBar.jsx';
import SupplierTable from '../components/suppliers/SupplierTable.jsx';
import { SUPPLIERS_HEADER, SUPPLIER_CATEGORIES } from '../data/suppliersData.js';

export default function Suppliers() {
  const [activeCategory, setActiveCategory] = useState('hardware');

  return (
    <>
      <SecondaryNav />

      {/* PAGE HEADER */}
      <div className="page-header">
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

          {/* SEARCH HERO */}
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

      {/* PLATINUM SPONSORS */}
      <PlatinumBar />

      {/* CATEGORY HIGHWAY */}
      <div className="cat-highway">
        <div className="cat-highway-inner">
          {SUPPLIER_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`cat-tile ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
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

      {/* SUPPLIERS TABLE */}
      <SupplierTable activeCategory={activeCategory} />
    </>
  );
}

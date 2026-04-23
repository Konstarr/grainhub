import { SUPPLIER_HERO, HERO_TABS } from '../../data/supplierProfileData.js';

export default function HeroSection() {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-top">
          <div className="sup-logo">{SUPPLIER_HERO.logo}</div>
          <div className="hero-text">
            <div className="hero-badges">
              {SUPPLIER_HERO.badges.map((badge) => (
                <span key={badge.label} className={`hbadge ${badge.class}`}>
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="hero-name">{SUPPLIER_HERO.name}</div>
            <div className="hero-sub">{SUPPLIER_HERO.description}</div>
            <div className="hero-actions">
              <button className="hbtn hbtn-primary">Contact Blum</button>
              <button className="hbtn hbtn-ghost">↓ Catalog</button>
              <button className="hbtn hbtn-ghost">🔖 Follow</button>
              <button className="hbtn hbtn-ghost">↗ Share</button>
            </div>
            <div className="hero-rating">
              <span className="hr-score">{SUPPLIER_HERO.rating}</span>
              <span className="hr-stars">{SUPPLIER_HERO.stars}</span>
              <span className="hr-count">{SUPPLIER_HERO.reviews}</span>
              <div className="hr-div"></div>
              <span className="hr-stat">{SUPPLIER_HERO.forumMentions}</span>
              <div className="hr-div"></div>
              <span className="hr-stat">{SUPPLIER_HERO.location}</span>
              <div className="hr-div"></div>
              <span className="hr-stat">{SUPPLIER_HERO.website}</span>
            </div>
          </div>
        </div>
        <div className="hero-tabs">
          {HERO_TABS.map((tab) => (
            <div key={tab} className="htab active">
              {tab}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';

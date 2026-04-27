import React from 'react';
import { SUPPLIER_HERO, HERO_TABS } from '../../data/supplierProfileData.js';

export default function HeroSection({ supplier }) {
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fall through to demo data if no real supplier (legacy /suppliers/profile route).
  const name        = supplier?.name        || SUPPLIER_HERO.name;
  const description = supplier?.description || SUPPLIER_HERO.description;
  const logoUrl     = supplier?.logo_url    || null;
  const logoText    = supplier?.logo_initials || (supplier ? (name.split(/\s+/).map((w) => w[0]).slice(0,2).join('')) : SUPPLIER_HERO.logo);
  const bannerUrl   = supplier?.banner_url  || null;
  const rating      = supplier?.rating      ?? SUPPLIER_HERO.rating;
  const reviewCount = supplier?.review_count;
  const reviewsLabel = reviewCount != null
    ? `${reviewCount} review${reviewCount === 1 ? '' : 's'}`
    : SUPPLIER_HERO.reviews;
  const stars = supplier
    ? '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0))
    : SUPPLIER_HERO.stars;
  const location = supplier?.address || SUPPLIER_HERO.location;
  const website  = supplier?.website || SUPPLIER_HERO.website;

  const badges = supplier
    ? [
        ...(supplier.is_verified ? [{ label: '✓ Verified', class: 'hb-verified' }] : []),
        ...(supplier.badges || []).map((b) => ({ label: b, class: 'hb-tag' })),
      ]
    : (SUPPLIER_HERO.badges || []);

  const heroStyle = bannerUrl
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div className="hero" style={heroStyle}>
      <div className="hero-inner">
        <div className="hero-top">
          <div className="sup-logo">
            {logoUrl
              ? <img src={logoUrl} alt={`${name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              : logoText
            }
          </div>
          <div className="hero-text">
            <div className="hero-badges">
              {badges.map((badge, i) => (
                <span key={badge.label + i} className={`hbadge ${badge.class || ''}`}>{badge.label}</span>
              ))}
            </div>
            <div className="hero-name">{name}</div>
            <div className="hero-sub">{description}</div>
            <div className="hero-actions">
              <a className="hbtn hbtn-primary" href="#contact">Contact {supplier ? supplier.name.split(/\s+/)[0] : 'us'}</a>
              {website && <a className="hbtn hbtn-ghost" href={website} target="_blank" rel="noreferrer">↗ Website</a>}
              <button className="hbtn hbtn-ghost" type="button">🔖 Follow</button>
            </div>
            <div className="hero-rating">
              <span className="hr-score">{rating ? Number(rating).toFixed(1) : '—'}</span>
              <span className="hr-stars">{stars}</span>
              <span className="hr-count">{reviewsLabel}</span>
              {location && <><div className="hr-div"></div><span className="hr-stat">{location}</span></>}
              {website && <><div className="hr-div"></div><span className="hr-stat">{(() => { try { return new URL(website).host.replace(/^www\./, ''); } catch { return website; } })()}</span></>}
            </div>
          </div>
        </div>
        <div className="hero-tabs">
          {HERO_TABS.map((tab) => (
            <div key={tab} className={'htab' + (tab.toLowerCase() === activeTab ? ' active' : '')} onClick={() => setActiveTab(tab.toLowerCase())} style={{ cursor: 'pointer' }}>
              {tab}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

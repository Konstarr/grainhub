import { Link, useSearchParams } from 'react-router-dom';
import { supplierMatchesCategoryId } from '../../data/suppliersData.js';
import { matchesTrade } from '../../lib/trades.js';
import TradeFilterBanner from '../layout/TradeFilterBanner.jsx';

export default function SupplierTable({ activeCategory = '', suppliers }) {
  const [searchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';

  const source = suppliers || [];

  const visible = source.filter((s) => {
    if (supplierMatchesCategoryId(s, activeCategory) === false) return false;
    if (trade && matchesTrade(s, trade) === false) return false;
    return true;
  });

  return (
    <>
      <TradeFilterBanner />
      <div className="supplier-list-card">
        <div className="supplier-list-head">
          <div className="supplier-list-title">
            Featured Suppliers
            {(trade || activeCategory) &&
              ' \u2014 ' + visible.length + ' match' + (visible.length === 1 ? '' : 'es')}
          </div>
          <div className="supplier-list-count">
            {visible.length} {visible.length === 1 ? 'company' : 'companies'}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="trade-empty">
            No suppliers match this filter. Clear the filters above to see all suppliers.
          </div>
        ) : (
          visible.map((supplier) => (
            <Link
              key={supplier.name}
              to={supplier.slug ? `/suppliers/${supplier.slug}` : '/suppliers/profile'}
              className="supplier-row"
            >
              {supplier.logoUrl ? (
                <img
                  src={supplier.logoUrl}
                  alt={supplier.name + ' logo'}
                  className="supplier-logo-img"
                />
              ) : (
                <div className="supplier-logo-fallback">{supplier.logo}</div>
              )}

              <div className="supplier-body">
                <div className="supplier-name-row">
                  <span className="supplier-name">{supplier.name}</span>
                  {supplier.isVerified && (
                    <span className="supplier-verified" title="Verified supplier">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M8 1.5 10 3l2.2-.3.3 2.2L14 7l-1.5 2 .3 2.2-2.2.3L9 14 7 12.8l-2.2.3-.3-2.2L3 9l1.5-2-.3-2.2 2.2-.3L8 1.5Z"
                          fill="#2E7BC4"
                        />
                        <path d="m5.5 8 2 2 3.5-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                <div className="supplier-meta">
                  {supplier.category && (
                    <span className="supplier-meta-item supplier-meta-cat">
                      {supplier.category}
                    </span>
                  )}
                  {supplier.location && (
                    <span className="supplier-meta-item">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M8 14s5-4.5 5-8a5 5 0 1 0-10 0c0 3.5 5 8 5 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      {supplier.location}
                    </span>
                  )}
                </div>

                {supplier.description && (
                  <div className="supplier-desc">{supplier.description}</div>
                )}

                <div className="supplier-footer">
                  {(supplier.badges || []).slice(0, 4).map((badge) => (
                    <span key={badge} className="supplier-badge">
                      {badge}
                    </span>
                  ))}
                  {supplier.website && (
                    <span className="supplier-quickchip">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      Website
                    </span>
                  )}
                  {supplier.phone && (
                    <span className="supplier-quickchip">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 3.5c0 5 4.5 9.5 9.5 9.5V11l-2.5-1-1.5 1.5L6.5 9 8 7.5 7 5H5L3 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                      Phone
                    </span>
                  )}
                </div>
              </div>

              <div className="supplier-aside">
                <div className="supplier-rating">
                  {supplier.rating && (
                    <>
                      <span className="supplier-star">★</span>
                      {supplier.rating}
                    </>
                  )}
                </div>
                <div className="supplier-reviews">
                  {supplier.reviewCount ? supplier.reviewCount + ' reviews' : 'No reviews yet'}
                </div>
                <div className="supplier-cta">View profile →</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

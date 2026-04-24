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
    <div className="main-wrap">
      <div>
        <TradeFilterBanner />
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--white)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Featured Suppliers {(trade || activeCategory) && '\u2014 ' + visible.length + ' match' + (visible.length === 1 ? '' : 'es')}
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
                to="/suppliers/profile"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {supplier.logoUrl ? (
                  <img
                    src={supplier.logoUrl}
                    alt={supplier.name + ' logo'}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      objectFit: 'contain',
                      background: 'white',
                      border: '1px solid var(--border-light)',
                      padding: '6px',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6B3F1F, #A0522D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '18px',
                      color: 'white',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {supplier.logo}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {supplier.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {supplier.category}
                    {supplier.location ? '  \u00b7  ' + supplier.location : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(supplier.badges || []).map((badge) => (
                      <span
                        key={badge}
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          background: '#EAF3DE',
                          color: '#2D5016',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {supplier.rating ? '\u2605 ' + supplier.rating : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {supplier.reviewCount ? supplier.reviewCount + ' reviews' : ''}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

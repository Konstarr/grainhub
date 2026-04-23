import { Link, useSearchParams } from 'react-router-dom';
import { SUPPLIER_LIST } from '../../data/suppliersData.js';
import { matchesTrade } from '../../lib/trades.js';
import TradeFilterBanner from '../layout/TradeFilterBanner.jsx';

export default function SupplierTable() {
  const [searchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';

  const visible = trade
    ? SUPPLIER_LIST.filter((s) => matchesTrade(s, trade))
    : SUPPLIER_LIST;

  return (
    <div className="main-wrap">
      <div>
        <TradeFilterBanner />
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--white)' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Featured Suppliers {trade && `— ${visible.length} match${visible.length === 1 ? '' : 'es'}`}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="trade-empty">
              No suppliers match this trade yet. Clear the filter above to see all suppliers.
            </div>
          ) : (
            visible.map((supplier) => (
              <Link
                key={supplier.logo}
                to="/suppliers/profile"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6B3F1F, #A0522D)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '18px',
                    color: 'white',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}
                >
                  {supplier.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {supplier.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {supplier.category}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {supplier.badges.map((badge) => (
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
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    ⭐ {supplier.rating}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {supplier.reviews} reviews
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

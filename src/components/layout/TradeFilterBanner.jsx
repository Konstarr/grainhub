import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { TRADES } from '../../lib/trades.js';

/**
 * Small badge that appears on filterable pages when ?trade=<slug>
 * is active. Shows which trade is selected and offers a one-click clear.
 * Renders nothing when no filter is active.
 */
export default function TradeFilterBanner() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const slug = searchParams.get('trade') || '';

  if (!slug) return null;

  const trade = TRADES.find((t) => t.slug === slug);
  if (!trade) return null;

  const clear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('trade');
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="trade-filter-banner">
      <span className="tfb-label">Filtered by trade:</span>
      <span className="tfb-value">{trade.label}</span>
      <button type="button" onClick={clear} className="tfb-clear">Clear ✕</button>
    </div>
  );
}

import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { TRADES } from '../../lib/trades.js';

export { TRADES };

export default function SecondaryNav() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const active = searchParams.get('trade') || '';

  const handleClick = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (active === slug) {
      params.delete('trade');
    } else {
      params.set('trade', slug);
    }
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="secondary-nav">
      {TRADES.map((t) => (
        <div
          key={t.slug}
          className={`sec-item ${active === t.slug ? 'active' : ''}`}
          onClick={() => handleClick(t.slug)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(t.slug);
            }
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

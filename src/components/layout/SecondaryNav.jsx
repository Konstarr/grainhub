import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { TRADES } from '../../lib/trades.js';

export { TRADES };

/**
 * SecondaryNav — context-aware horizontal strip below the main Nav.
 * Each path decides what "navigation" means:
 *
 *   /           → quick-link shortcuts to the big sections
 *   /forums     → trade filter  (?trade=cabinet-making etc.)
 *   /suppliers  → trade filter  (same)
 *   /news       → category pills (?category=Industry%20News etc.)
 *   /events     → event-type pills (?type=trade-show etc.)
 *   /wiki       → category pills (?category=Cabinet%20Making etc.)
 *   other       → hidden (returns null so no bar renders)
 *
 * The bar itself is one component so the styling stays uniform; only
 * the items + URL-param it controls change.
 */

// Simple link mode — no filtering, just navigation shortcuts. Used on Home.
const LINKS_HOME = [
  { label: 'Forums',       to: '/forums' },
  { label: 'News',         to: '/news' },
  { label: 'Wiki',         to: '/wiki' },
  { label: 'Marketplace',  to: '/marketplace' },
  { label: 'Jobs',         to: '/jobs' },
  { label: 'Suppliers',    to: '/suppliers' },
  { label: 'Events',       to: '/events' },
];

const NEWS_CATEGORIES = [
  'Industry News', 'Product Release', 'Safety & Compliance',
  'Business & Trends', 'Events', 'Community',
];

const WIKI_CATEGORIES = [
  'Cabinet Making', 'Finishing', 'Joinery',
  'Machines', 'Species', 'Business',
];

const EVENT_TYPES = [
  { label: 'Trade Shows',  value: 'trade-show' },
  { label: 'Conferences',  value: 'conference' },
  { label: 'Workshops',    value: 'workshop' },
  { label: 'Meetups',      value: 'meetup' },
  { label: 'Webinars',     value: 'webinar' },
];

/** Resolve the right bar config for the current path. Null = hide. */
function resolveConfig(pathname) {
  if (pathname === '/')             return { mode: 'links', items: LINKS_HOME };
  if (pathname === '/forums')       return { mode: 'trade' };
  if (pathname === '/suppliers')    return { mode: 'trade' };
  if (pathname === '/news')         return { mode: 'pills', param: 'category', items: NEWS_CATEGORIES.map((v) => ({ label: v, value: v })) };
  if (pathname === '/wiki')         return { mode: 'pills', param: 'category', items: WIKI_CATEGORIES.map((v) => ({ label: v, value: v })) };
  if (pathname === '/events')       return { mode: 'pills', param: 'type',     items: EVENT_TYPES };
  return null;
}

export default function SecondaryNav() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const config = resolveConfig(location.pathname);

  if (!config) return null;

  // -------- Trade mode (Forums / Suppliers) --------
  if (config.mode === 'trade') {
    const active = searchParams.get('trade') || '';
    const onClick = (slug) => {
      const params = new URLSearchParams(searchParams);
      if (active === slug) params.delete('trade');
      else params.set('trade', slug);
      const qs = params.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
    };
    return (
      <div className="secondary-nav">
        {TRADES.map((t) => (
          <div
            key={t.slug}
            className={`sec-item ${active === t.slug ? 'active' : ''}`}
            onClick={() => onClick(t.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(t.slug); } }}
          >
            {t.label}
          </div>
        ))}
      </div>
    );
  }

  // -------- Links mode (Home) --------
  if (config.mode === 'links') {
    return (
      <div className="secondary-nav">
        {config.items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sec-item ${location.pathname === item.to ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  // -------- Pills mode (News / Wiki / Events) --------
  if (config.mode === 'pills') {
    const active = searchParams.get(config.param) || '';
    const onClick = (val) => {
      const params = new URLSearchParams(searchParams);
      if (active === val) params.delete(config.param);
      else params.set(config.param, val);
      const qs = params.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
    };
    return (
      <div className="secondary-nav">
        {config.items.map((it) => (
          <div
            key={it.value}
            className={`sec-item ${active === it.value ? 'active' : ''}`}
            onClick={() => onClick(it.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(it.value); } }}
          >
            {it.label}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

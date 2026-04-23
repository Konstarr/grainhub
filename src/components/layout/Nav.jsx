import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Forums', to: '/forums' },
  { label: 'Wiki', to: '/wiki' },
  { label: 'News', to: '/news' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Events', to: '/events' },
];

export default function Nav() {
  return (
    <nav className="site-nav">
      <Logo />

      <ul className="nav-links">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <div className="nav-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <path
              d="M11 11 L14 14"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input type="text" placeholder="Search GrainHub..." />
        </div>
        <Link to="/signup" className="nav-btn">Sign In</Link>
        <Link to="/signup" className="nav-btn primary">Join Free</Link>
      </div>
    </nav>
  );
}

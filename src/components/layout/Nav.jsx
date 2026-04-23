import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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

function initialsFromProfile(profile, user) {
  if (profile?.full_name) {
    return profile.full_name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');
  }
  if (profile?.username) return profile.username.slice(0, 2).toUpperCase();
  if (user?.email) return user.email.slice(0, 2).toUpperCase();
  return '..';
}

export default function Nav() {
  const { isAuthed, user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

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

        {isAuthed ? (
          <>
            <div
              className="nav-avatar"
              title={profile?.username || user?.email}
              aria-label="Your profile"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6B3F1F, #A0522D)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {initialsFromProfile(profile, user)}
            </div>
            <button
              type="button"
              className="nav-btn"
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn">Log In</Link>
            <Link to="/signup" className="nav-btn primary">Join Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}

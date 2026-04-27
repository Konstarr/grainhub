import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePlanChanges } from '../../context/PlanContext.jsx';
import { fetchUnreadCount } from '../../lib/messagingDb.js';
import NotificationBell from './NotificationBell.jsx';

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
  const { isAuthed, user, profile, signOut, isStaff, isAdmin } = useAuth();
  const plan = usePlanChanges();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [unread, setUnread] = useState(0);

  // Poll the unread-count every 30s while signed in — cheap server-side
  // count(), and only runs for authed users.
  useEffect(() => {
    if (!user?.id) { setUnread(0); return; }
    let cancelled = false;
    const tick = async () => {
      const n = await fetchUnreadCount(user.id);
      if (!cancelled) setUnread(n || 0);
    };
    tick();
    const iv = setInterval(tick, 30000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [user?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/', { replace: true });
  };

  // Prefer the username in the URL. If it isn't set yet, link to the
  // user's UUID — the Profile page accepts both. Avoids broken links
  // like /profile/<email-prefix> when no username exists on the row.
  const routeKey = profile?.username || user?.id || '';
  const profileHref = routeKey ? '/profile/' + routeKey : '/forums';

  const avatarBg = profile?.avatar_url
    ? 'url(' + profile.avatar_url + ') center/cover no-repeat'
    : 'linear-gradient(135deg, #6B3F1F, #A0522D)';

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
            <path d="M11 11 L14 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Search Millwork.io..." />
        </div>

        {isAuthed ? (
          <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell userId={user?.id} />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={profile?.username || user?.email}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: avatarBg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.5px',
                border: menuOpen ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {!profile?.avatar_url && initialsFromProfile(profile, user)}
            </button>

            <button
              type="button"
              className="nav-btn"
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--wood-cream, #F5EAD6)',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>

            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 220,
                  background: 'var(--white, #fff)',
                  color: 'var(--text-primary, #1a1a1a)',
                  border: '1px solid var(--border, rgba(0,0,0,0.1))',
                  borderRadius: 10,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  padding: 6,
                  zIndex: 200,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <div style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile?.full_name || profile?.username || 'You'}
                    </div>
                    <AccountTypePill
                      accountType={profile?.account_type}
                      membershipTier={profile?.membership_tier}
                    />
                  </div>
                  {profile?.username && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      @{profile.username}
                    </div>
                  )}
                  {profile?.account_type === 'business' && profile?.business_name && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                      {profile.business_name}
                    </div>
                  )}
                </div>

                <MenuItem onClick={() => { setMenuOpen(false); navigate(profileHref); }}>
                  View profile
                </MenuItem>
                <MenuItem onClick={() => { setMenuOpen(false); navigate(profileHref + '?edit=1'); }}>
                  Edit profile
                </MenuItem>
                <MenuItem onClick={() => { setMenuOpen(false); navigate('/messages'); }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Messages</span>
                    {unread > 0 && (
                      <span style={{
                        background: 'var(--wood-warm)',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '1px 7px',
                        fontSize: 10.5,
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </span>
                </MenuItem>
                <MenuItem onClick={() => { setMenuOpen(false); navigate('/account/subscription'); }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Manage subscription</span>
                    {plan.count > 0 && (
                      <span style={{
                        background: 'var(--wood-warm)',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '1px 7px',
                        fontSize: 10.5,
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}>
                        {plan.count} pending
                      </span>
                    )}
                  </span>
                </MenuItem>
                <MenuItem onClick={() => { setMenuOpen(false); navigate('/forums?view=my-posts'); }}>
                  My posts
                </MenuItem>
                <MenuItem onClick={() => { setMenuOpen(false); navigate('/forums?view=subscriptions'); }}>
                  Thread subscriptions
                </MenuItem>

                {/* Admin panel is admin/owner only — moderators do their
                    work inline on the forum/community pages instead. */}
                {isAdmin && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <MenuItem onClick={() => { setMenuOpen(false); navigate('/admin/news'); }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 18, height: 18,
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #c07a3c, #8a5030)',
                              color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                        }}>A</span>
                        Admin panel
                      </span>
                    </MenuItem>
                  </>
                )}

                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <MenuItem onClick={handleSignOut}>
                  Sign out
                </MenuItem>
              </div>
            )}
          </div>
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

function MenuItem({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        padding: '0.55rem 0.75rem',
        fontSize: 14,
        color: 'inherit',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--wood-cream, #f5ead6)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

/**
 * Small color-coded pill that surfaces the account type + membership
 * tier at the top of the user dropdown. Individual = brown, Business =
 * blue. The tier ("Free", "Pro", "Enterprise" …) appears as the second
 * half so the user knows exactly what they're on.
 */
function AccountTypePill({ accountType, membershipTier }) {
  const isBusiness = accountType === 'business';
  const tierLabel = (membershipTier || 'free');
  const label = isBusiness ? 'Business' : 'Individual';

  const palette = isBusiness
    ? { bg: '#E6F1FB', fg: '#185FA5', border: '#BFDCEF' }
    : { bg: '#F5EAD6', fg: '#6B3F1F', border: '#E0CDA7' };

  return (
    <span
      title={`${label} account · ${tierLabel[0].toUpperCase() + tierLabel.slice(1)} tier`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 999,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{tierLabel}</span>
    </span>
  );
}

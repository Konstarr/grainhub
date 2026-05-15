import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/admin.css';

/**
 * Admin sidebar layout. Sections are grouped by domain and individually
 * collapsible (state persisted to localStorage). A search box at the top
 * filters items by label so power users can jump straight to what they need.
 */
export const ADMIN_SECTIONS = [
  {
    id: 'editorial',
    group: 'Chapter content',
    items: [
      { to: '/admin/news',   label: 'News',      icon: <IconNews />, enabled: true },
      { to: '/admin/events', label: 'Events',    icon: <IconCal />,  enabled: true },
      { to: '/admin/wiki',   label: 'Resources', icon: <IconNews />, enabled: true },
    ],
  },
  {
    id: 'directory',
    group: 'Member directory',
    items: [
      { to: '/admin/suppliers',       label: 'Members',          icon: <IconStar />,  enabled: true },
      { to: '/admin/supplier-claims', label: 'Claim requests',   icon: <IconFlag />,  enabled: true },
      { to: '/admin/sponsors',        label: 'Chapter sponsors', icon: <IconStar />,  enabled: true },
    ],
  },
  {
    id: 'forum',
    group: 'Forum moderation',
    items: [
      { to: '/admin/forums',            label: 'Overview',           icon: <IconShield />, enabled: true },
      { to: '/admin/forums/threads',    label: 'Threads',            icon: <IconShield />, enabled: true },
      { to: '/admin/forums/reports',    label: 'Reports',            icon: <IconFlag />,   enabled: true },
      { to: '/admin/forums/log',        label: 'Mod log',            icon: <IconFlag />,   enabled: true },
      { to: '/admin/forums/words',      label: 'Blocked words',      icon: <IconShield />, enabled: true },
      { to: '/admin/forums/reputation', label: 'Rep gains',          icon: <IconStar />,   enabled: true },
      { to: '/admin/forums/badges',     label: 'Levels & accolades', icon: <IconStar />,   enabled: true },
    ],
  },
  {
    id: 'people',
    group: 'People',
    items: [
      { to: '/admin/users',       label: 'Members',     icon: <IconUsers />, enabled: true },
      { to: '/admin/connections', label: 'Connections', icon: <IconLink />,  enabled: true },
    ],
  },
];

/** localStorage helper — persist which groups are collapsed. */
const COLLAPSE_KEY = 'mw-admin-collapse-v2';
function loadCollapseState() {
  try {
    const raw = window.localStorage.getItem(COLLAPSE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCollapseState(state) {
  try { window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state)); } catch {}
}

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { profile, role, isOwner } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => loadCollapseState());
  const [query, setQuery] = useState('');

  useEffect(() => { saveCollapseState(collapsed); }, [collapsed]);

  const toggleSection = (id) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  // Auto-expand the section that contains the active route, so people
  // never end up on a page whose group is collapsed.
  useEffect(() => {
    const here = location.pathname;
    const owning = ADMIN_SECTIONS.find((s) => s.items.some((i) => i.to === here || here.startsWith(i.to + '/')));
    if (owning && collapsed[owning.id]) {
      setCollapsed((c) => ({ ...c, [owning.id]: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const q = query.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!q) return ADMIN_SECTIONS;
    return ADMIN_SECTIONS
      .map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((s) => s.items.length > 0);
  }, [q]);

  return (
    <div className="adm-shell">
      <aside className="adm-aside">
        <div className="adm-brand">
          <div className="adm-brand-badge">AWI</div>
          <div>
            <div className="adm-brand-title">Admin</div>
            <div className="adm-brand-sub">AWI Florida Chapter</div>
          </div>
        </div>

        <div className="adm-nav-search">
          <input
            type="search"
            placeholder="Filter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Owner-only Dashboard pinned at the top — never inside a
            collapsible group so financial info is one click away. */}
        {isOwner && (
          <div className="adm-nav-section">
            <div className="adm-nav-group adm-nav-group-static">Overview</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => 'adm-nav-item ' + (isActive ? 'active' : '')}
            >
              <span className="adm-nav-icon"><IconChart /></span>
              <span>Dashboard</span>
            </NavLink>
          </div>
        )}

        {visibleSections.map((section) => {
          const isCollapsed = !q && collapsed[section.id];
          return (
            <div key={section.id} className="adm-nav-section">
              <button
                type="button"
                className={'adm-nav-group adm-nav-group-toggle' + (isCollapsed ? ' collapsed' : '')}
                onClick={() => toggleSection(section.id)}
                aria-expanded={!isCollapsed}
              >
                <span>{section.group}</span>
                <span className="adm-nav-chev" aria-hidden="true">▾</span>
              </button>
              {!isCollapsed && (
                <div className="adm-nav-section-body">
                  {section.items.map((item) =>
                    item.enabled ? (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin/forums'}
                        className={({ isActive }) => 'adm-nav-item ' + (isActive ? 'active' : '')}
                      >
                        <span className="adm-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    ) : (
                      <div key={item.to} className="adm-nav-item disabled" title="Coming soon">
                        <span className="adm-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        <span className="adm-nav-soon">SOON</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        {q && visibleSections.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            No matching admin pages.
          </div>
        )}

        <div className="adm-aside-foot">
          <div>Signed in as</div>
          <div style={{ color: '#E0CC8A', fontWeight: 600, marginTop: 2 }}>
            {profile?.full_name || profile?.username || 'Staff'}
          </div>
          <div style={{ opacity: 0.7, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Role · {role}
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/" style={{ color: 'rgba(245,230,200,0.7)', textDecoration: 'none', fontSize: 12 }}>
              ← Back to site
            </Link>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <div>
            <h1 className="adm-title">{title}</h1>
            {subtitle && <div className="adm-sub">{subtitle}</div>}
          </div>
          {actions && <div className="adm-actions">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}

/* ---------- inline icons ---------- */
const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
function IconNews()   { return (<svg {...svg}><path d="M4 4h12a2 2 0 0 1 2 2v14a2 2 0 0 0 2-2V6"/><rect x="4" y="4" width="14" height="16" rx="2"/><line x1="8" y1="9" x2="14" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>); }
function IconCal()    { return (<svg {...svg}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>); }
function IconTag()    { return (<svg {...svg}><path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>); }
function IconShield() { return (<svg {...svg}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>); }
function IconFlag()   { return (<svg {...svg}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>); }
function IconUsers()  { return (<svg {...svg}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function IconStar()   { return (<svg {...svg}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>); }
function IconBriefcase() { return (<svg {...svg}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>); }
function IconLink() { return (<svg {...svg}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>); }
function IconChart() { return (<svg {...svg}><line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/><line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="2" y2="20"/></svg>); }

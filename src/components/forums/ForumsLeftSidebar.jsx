import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FORUM_GROUPS } from '../../data/forumsData.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Reddit-style left navigation for the Forums section.
 *
 * Top group:  Home / Popular
 * Actions:    Start a community / Join a community
 * Recents:    last 5 threads the user clicked on (localStorage)
 * Communities: every forum group + its categories, collapsible
 *
 * Recents are tracked in localStorage by ForumThread.jsx whenever a
 * thread is opened. This sidebar just reads the list and renders it
 * as a short vertical menu.
 */

const RECENTS_KEY = 'gh:forumRecents';
const RECENTS_CAP = 6;

export function recordForumRecent({ slug, title }) {
  if (!slug || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const deduped = [{ slug, title, ts: Date.now() }, ...list.filter((r) => r.slug !== slug)];
    localStorage.setItem(RECENTS_KEY, JSON.stringify(deduped.slice(0, RECENTS_CAP)));
  } catch (_) { /* localStorage disabled or quota */ }
}

export default function ForumsLeftSidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [recents, setRecents] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  // Read recents on mount + whenever the route changes (so opening a
  // thread bumps the list without a full reload).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      setRecents(raw ? JSON.parse(raw) : []);
    } catch (_) { setRecents([]); }
  }, [location.pathname]);

  const toggleGroup = (id) =>
    setOpenGroups((o) => ({ ...o, [id]: !(o[id] ?? true) }));

  return (
    <aside className="fs-sidebar">
      {/* ── Primary nav ── */}
      <Section>
        <NavItem to="/forums" end icon={<IconHome />} label="Home" />
        <NavItem to="/forums?view=hot" icon={<IconFlame />} label="Popular" />
      </Section>

      {/* ── Actions ── */}
      <Section>
        <NavItem
          to={isAdmin ? '/admin/forums/new' : '/forums?request=new-community'}
          icon={<IconPlus />}
          label="Start a community"
        />
        <NavItem to="/forums?view=subscriptions" icon={<IconBookmark />} label="Join a community" />
        <NavItem to="/forums/new" icon={<IconPen />} label="Start a thread" />
      </Section>

      {/* ── Recents ── */}
      {recents.length > 0 && (
        <Section title="Recent">
          {recents.map((r) => (
            <Link
              key={r.slug}
              to={`/forums/thread/${r.slug}`}
              className="fs-item fs-item-recent"
              title={r.title}
            >
              <span className="fs-item-dot" aria-hidden="true" />
              <span className="fs-item-text">{r.title}</span>
            </Link>
          ))}
          <button type="button" className="fs-item fs-item-muted" onClick={() => {
            try { localStorage.removeItem(RECENTS_KEY); } catch (_) { /* ignore */ }
            setRecents([]);
          }}>
            <span className="fs-item-text" style={{ fontStyle: 'italic' }}>Clear recents</span>
          </button>
        </Section>
      )}

      {/* ── Communities (groups + categories) ── */}
      <Section title="Communities">
        {FORUM_GROUPS.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          return (
            <div key={group.id} className="fs-group">
              <button
                type="button"
                className="fs-group-header"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
              >
                <span className="fs-group-icon">{group.icon || '#'}</span>
                <span className="fs-group-name">{group.name}</span>
                <span className={'fs-group-chevron ' + (isOpen ? 'open' : '')} aria-hidden="true">
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="fs-group-children">
                  {group.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/forums/category/${cat.id}`}
                      className="fs-item fs-item-community"
                    >
                      <span className="fs-item-dot" aria-hidden="true" />
                      <span className="fs-item-text">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </aside>
  );
}

/* ── Primitives ── */
function Section({ title, children }) {
  return (
    <div className="fs-section">
      {title && <div className="fs-section-title">{title}</div>}
      {children}
    </div>
  );
}

function NavItem({ to, end, icon, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => 'fs-item ' + (isActive ? 'active' : '')}
    >
      <span className="fs-item-icon">{icon}</span>
      <span className="fs-item-text">{label}</span>
    </NavLink>
  );
}

/* ── Icons ── */
const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
function IconHome()     { return <svg {...svg}><path d="M3 12l9-9 9 9" /><path d="M5 10v10h14V10" /></svg>; }
function IconFlame()    { return <svg {...svg}><path d="M12 2c2 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5-1 4 3 4 3 4 0-4-1-6 0-9z" /></svg>; }
function IconPlus()     { return <svg {...svg}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function IconBookmark() { return <svg {...svg}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>; }
function IconPen()      { return <svg {...svg}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>; }

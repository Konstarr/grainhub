import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FORUM_GROUPS } from '../../data/forumsData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchMyCommunities } from '../../lib/communityDb.js';
import { supabase } from '../../lib/supabase.js';
import { setForumMarkAllReadAt } from '../../lib/forumLastVisit.js';

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

/**
 * Drop a slug from the local "recent threads" list. Called from
 * ForumThread.jsx when fetchThreadBySlug returns nothing (the
 * thread was deleted by its author or by staff after the user
 * clicked into it once) so we don't keep showing a dead link
 * in the sidebar.
 */
export function forgetForumRecent(slug) {
  if (!slug || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return;
    const next = JSON.parse(raw).filter((r) => r.slug !== slug);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch (_) { /* ignore */ }
}

export default function ForumsLeftSidebar() {
  const { isAuthed } = useAuth();
  const location = useLocation();
  const [recents, setRecents] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [openGroups, setOpenGroups] = useState({ browse: false });

  // Read recents on mount + whenever the route changes (so opening a
  // thread bumps the list without a full reload). After loading,
  // verify each slug still exists in forum_threads — drop any that
  // were deleted upstream so the sidebar never shows a dead link.
  useEffect(() => {
    let raw;
    try {
      raw = localStorage.getItem(RECENTS_KEY);
    } catch (_) { setRecents([]); return; }

    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length === 0) { setRecents([]); return; }

    // Optimistic render so the sidebar doesn't blink while we verify.
    setRecents(parsed);

    let cancelled = false;
    (async () => {
      const slugs = parsed.map((r) => r.slug).filter(Boolean);
      if (slugs.length === 0) return;
      const { data, error } = await supabase
        .from('forum_threads')
        .select('slug')
        .in('slug', slugs);
      if (cancelled || error) return;
      const alive = new Set((data || []).map((r) => r.slug));
      const filtered = parsed.filter((r) => alive.has(r.slug));
      if (filtered.length !== parsed.length) {
        try { localStorage.setItem(RECENTS_KEY, JSON.stringify(filtered)); } catch (_) {}
        setRecents(filtered);
      }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  // Load joined communities for the logged-in user.
  useEffect(() => {
    if (!isAuthed) { setMyCommunities([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await fetchMyCommunities();
      if (!cancelled) setMyCommunities(data || []);
    })();
    return () => { cancelled = true; };
  }, [isAuthed, location.pathname]);

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
        <NavItem to="/forums/new" icon={<IconPen />} label="Start a thread" />
        <button
          type="button"
          className="fs-item fs-item-action"
          onClick={() => {
            setForumMarkAllReadAt();
            window.location.reload();
          }}
        >
          <span className="fs-item-icon"><IconCheck /></span>
          <span className="fs-item-text">Mark all read</span>
        </button>
        <NavItem to="/communities/new" icon={<IconPlus />} label="Start a community" />
        <NavItem to="/communities" icon={<IconBookmark />} label="Browse communities" />
      </Section>

      {/* ── Rules ── */}
      <Section title="Community">
        <NavItem to="/forums/rules" icon={<IconScale />} label="Forum rules" />
      </Section>

      {/* ── Joined communities ── */}
      {myCommunities.length > 0 && (
        <Section title="Your communities">
          {myCommunities.map((c) => (
            <Link key={c.id} to={`/c/${c.slug}`} className="fs-item fs-item-community fs-item-with-icon">
              <CommIconSmall c={c} />
              <span className="fs-item-text">{c.name}</span>
            </Link>
          ))}
          <Link to="/communities" className="fs-item fs-item-muted" style={{ paddingLeft: 12 }}>
            <span className="fs-item-text">See all →</span>
          </Link>
        </Section>
      )}

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

      {/* ── Forum topic groups (the built-in taxonomy) ── */}
      <Section title="Browse topics">
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
function IconScale()    { return <svg {...svg}><path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-3 7a4 4 0 0 0 6 0z" /><path d="M19 7l3 7a4 4 0 0 1-6 0z" /></svg>; }
function IconCheck()    { return <svg {...svg}><polyline points="20 6 9 17 4 12" /></svg>; }

/* Tiny round icon used inside the "Your communities" sidebar list. */
function CommIconSmall({ c }) {
  if (c.icon_url) {
    return <img src={c.icon_url} alt="" width="20" height="20" style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  const initials = (c.name || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join('').toUpperCase();
  return (
    <span style={{
      width: 20, height: 20, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6B3F1F, #A0522D)',
      color: '#fff', fontSize: 9, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, letterSpacing: 0.3,
    }}>
      {initials}
    </span>
  );
}

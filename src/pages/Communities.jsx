import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCommunities,
  fetchMyCommunities,
  joinCommunity,
  leaveCommunity,
} from '../lib/communityDb.js';
import '../styles/communities.css';

/**
 * /communities — browse all public communities.
 * Shows My communities at the top, then all others in a grid.
 * Each card has a one-click Join/Leave button.
 */
export default function Communities() {
  const { isAuthed } = useAuth();
  const [all, setAll] = useState([]);
  const [mine, setMine] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([
      fetchCommunities({ search }),
      isAuthed ? fetchMyCommunities() : Promise.resolve({ data: [] }),
    ]);
    setAll(a.data || []);
    setMine(b.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, isAuthed]);

  const myIds = useMemo(() => new Set(mine.map((c) => c.id)), [mine]);
  const browseList = useMemo(
    () => all.filter((c) => !myIds.has(c.id)),
    [all, myIds]
  );

  const handleJoin = async (c) => {
    setBusyId(c.id);
    const { error } = await joinCommunity(c.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    load();
  };
  const handleLeave = async (c) => {
    setBusyId(c.id);
    const { error } = await leaveCommunity(c.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    load();
  };

  return (
    <>
      <div className="page-header gh-hero">
        <div className="header-inner">
          <div className="header-top">
            <div className="header-left">
              <div className="page-eyebrow">Communities</div>
              <h1 className="page-title">Find your people.</h1>
              <p className="page-subtitle">
                User-run communities for specific trades, regions, and shop types.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="comm-wrap">
        <div className="comm-toolbar">
          <div className="comm-search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
            <input
              type="text"
              placeholder="Search communities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/communities/new" className="comm-new-btn">+ New community</Link>
        </div>

        {isAuthed && mine.length > 0 && (
          <Section title="Your communities">
            <div className="comm-grid">
              {mine.map((c) => (
                <CommunityCard key={c.id} c={c} isMember busy={busyId === c.id} onLeave={() => handleLeave(c)} />
              ))}
            </div>
          </Section>
        )}

        <Section title={mine.length > 0 ? 'Browse all' : 'All communities'}>
          {loading ? (
            <Empty>Loading…</Empty>
          ) : browseList.length === 0 ? (
            <Empty>
              {search
                ? `No communities match "${search}".`
                : 'No other public communities yet. Want to start the first one?'}
            </Empty>
          ) : (
            <div className="comm-grid">
              {browseList.map((c) => (
                <CommunityCard key={c.id} c={c} busy={busyId === c.id} onJoin={() => handleJoin(c)} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: '1.75rem' }}>
      <h2 className="comm-section-title">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return (
    <div className="comm-empty">
      {children}
    </div>
  );
}

function CommunityCard({ c, isMember, busy, onJoin, onLeave }) {
  return (
    <div className="comm-card">
      <Link to={`/c/${c.slug}`} className="comm-card-link">
        <div className="comm-card-head">
          <CommunityIcon c={c} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="comm-card-name">{c.name}</div>
            <div className="comm-card-meta">
              {(c.member_count || 0).toLocaleString()} member{c.member_count === 1 ? '' : 's'}
              {c.thread_count ? ` · ${c.thread_count.toLocaleString()} threads` : ''}
            </div>
          </div>
        </div>
        {c.description && <div className="comm-card-desc">{c.description}</div>}
      </Link>
      <div className="comm-card-action">
        {isMember ? (
          <button type="button" className="comm-btn ghost" onClick={onLeave} disabled={busy}>
            {busy ? 'Leaving…' : 'Leave'}
          </button>
        ) : (
          <button type="button" className="comm-btn primary" onClick={onJoin} disabled={busy}>
            {busy ? 'Joining…' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}

export function CommunityIcon({ c, size = 44 }) {
  if (c.icon_url) {
    return <img src={c.icon_url} alt="" className="comm-icon-img" style={{ width: size, height: size }} />;
  }
  const initials = (c.name || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="comm-icon-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

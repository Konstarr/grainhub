import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import {
  fetchCommunities,
  fetchMyCommunities,
  requestToJoinCommunity,
  cancelJoinRequest,
  leaveCommunity,
} from '../lib/communityDb.js';
import { safeImageUrl } from '../lib/urlSafety.js';
import '../styles/communities.css';

/**
 * /communities — browse all public communities.
 *
 * Communities are application-only: clicking the join button on a card
 * sends a request to that community's mods/owner and shows "Pending"
 * until they approve. Owners can never leave from this card — leaving
 * requires transferring ownership first inside /c/:slug.
 */
export default function Communities() {
  const { isAuthed, user } = useAuth();
  const [all, setAll] = useState([]);
  const [mine, setMine] = useState([]);
  const [myRequests, setMyRequests] = useState({});
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

    if (isAuthed && user?.id) {
      const { data } = await supabase
        .from('community_join_requests')
        .select('id, community_id')
        .eq('profile_id', user.id)
        .eq('status', 'pending');
      const map = {};
      (data || []).forEach((r) => { map[r.community_id] = r.id; });
      setMyRequests(map);
    } else {
      setMyRequests({});
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, isAuthed, user?.id]);

  const myIds = useMemo(() => new Set(mine.map((c) => c.id)), [mine]);
  const browseList = useMemo(
    () => all.filter((c) => !myIds.has(c.id)),
    [all, myIds]
  );

  const handleApply = async (c) => {
    setBusyId(c.id);
    const { error } = await requestToJoinCommunity(c.id);
    setBusyId(null);
    if (error) { alert(prettyErr(error.message)); return; }
    load();
  };
  const handleCancelRequest = async (c) => {
    const reqId = myRequests[c.id];
    if (!reqId) return;
    setBusyId(c.id);
    const { error } = await cancelJoinRequest(reqId);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    load();
  };
  const handleLeave = async (c) => {
    setBusyId(c.id);
    const { error } = await leaveCommunity(c.id);
    setBusyId(null);
    if (error) { alert(prettyErr(error.message)); return; }
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
                Membership is by application or invitation — request access and a moderator will review.
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
                <CommunityCard
                  key={c.id}
                  c={c}
                  isMember
                  isOwner={c.role === 'owner'}
                  busy={busyId === c.id}
                  onLeave={() => handleLeave(c)}
                />
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
                <CommunityCard
                  key={c.id}
                  c={c}
                  hasPendingRequest={!!myRequests[c.id]}
                  busy={busyId === c.id}
                  onApply={() => handleApply(c)}
                  onCancelRequest={() => handleCancelRequest(c)}
                />
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
  return <div className="comm-empty">{children}</div>;
}

function CommunityCard({ c, isMember, isOwner, hasPendingRequest, busy, onApply, onLeave, onCancelRequest }) {
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
          isOwner ? (
            <Link to={`/c/${c.slug}`} className="comm-btn ghost">
              👑 Owner — Manage
            </Link>
          ) : (
            <button type="button" className="comm-btn ghost" onClick={onLeave} disabled={busy}>
              {busy ? 'Leaving…' : 'Leave'}
            </button>
          )
        ) : hasPendingRequest ? (
          <button type="button" className="comm-btn ghost" onClick={onCancelRequest} disabled={busy} title="Cancel pending request">
            {busy ? '…' : 'Pending — Cancel'}
          </button>
        ) : (
          <button type="button" className="comm-btn primary" onClick={onApply} disabled={busy}>
            {busy ? '…' : 'Request to join'}
          </button>
        )}
      </div>
    </div>
  );
}

function prettyErr(message) {
  const m = String(message || '');
  if (m.includes('owner_must_transfer_first')) {
    return 'You are the owner of this community. Open the community and transfer ownership before leaving.';
  }
  if (m.includes('already_member')) return 'You\'re already a member.';
  if (m.includes('request_already_pending')) return 'You already have a pending request for this community.';
  return m;
}

export function CommunityIcon({ c, size = 44 }) {
  const safe = safeImageUrl(c?.icon_url);
  if (safe) {
    return <img src={safe} alt="" className="comm-icon-img" style={{ width: size, height: size }} />;
  }
  const initials = (c?.name || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="comm-icon-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

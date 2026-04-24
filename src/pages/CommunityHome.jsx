import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCommunityBySlug,
  fetchMyMembership,
  joinCommunity,
  leaveCommunity,
  fetchCommunityThreads,
} from '../lib/communityDb.js';
import { CommunityIcon } from './Communities.jsx';
import { mapThreadRow } from '../lib/mappers.js';
import '../styles/communities.css';

/**
 * /c/:slug — the community home page. Header with icon + banner,
 * member count, Join button, thread list, members sidebar.
 */
export default function CommunityHome() {
  const { slug } = useParams();
  const { isAuthed } = useAuth();
  const [community, setCommunity] = useState(null);
  const [threads, setThreads] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    const { data } = await fetchCommunityBySlug(slug);
    if (!data) { setNotFound(true); setLoading(false); return; }
    setCommunity(data);
    const [m, t] = await Promise.all([
      fetchMyMembership(data.id),
      fetchCommunityThreads(data.id, { limit: 50 }),
    ]);
    setMembership(m.data || null);
    setThreads(t.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const handleToggleJoin = async () => {
    if (!community) return;
    setBusy(true);
    if (membership) {
      await leaveCommunity(community.id);
    } else {
      await joinCommunity(community.id);
    }
    setBusy(false);
    load();
  };

  if (notFound) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap">
          <div className="comm-empty">
            We couldn't find a community at <code>/c/{slug}</code>.
          </div>
        </div>
      </>
    );
  }
  if (loading || !community) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap">
          <div className="comm-empty">Loading…</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBack
        backTo="/communities"
        backLabel="Back to Communities"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Communities', to: '/communities' },
          { label: community.name },
        ]}
      />

      {/* ── Header banner ── */}
      <div
        className="comm-banner"
        style={{
          backgroundImage: community.banner_url
            ? `url(${community.banner_url})`
            : 'linear-gradient(135deg, #2C1A0E 0%, #6B3F1F 50%, #A0522D 100%)',
        }}
      >
        <div className="comm-banner-inner">
          <CommunityIcon c={community} size={88} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="comm-home-title">{community.name}</h1>
            <div className="comm-home-sub">
              <span>c/{community.slug}</span>
              <span className="dot">·</span>
              <span>{(community.member_count || 0).toLocaleString()} members</span>
              <span className="dot">·</span>
              <span>{(community.thread_count || 0).toLocaleString()} threads</span>
            </div>
          </div>
          <div className="comm-home-actions">
            {isAuthed ? (
              <button
                type="button"
                onClick={handleToggleJoin}
                disabled={busy}
                className={'comm-btn ' + (membership ? 'ghost-light' : 'primary')}
              >
                {busy ? '…' : membership ? (membership.role === 'owner' ? 'Owner' : 'Joined ✓') : 'Join'}
              </button>
            ) : (
              <Link to="/login" className="comm-btn primary">Sign in to join</Link>
            )}
          </div>
        </div>
      </div>

      <div className="comm-home-wrap">
        <div>
          {/* Description card */}
          {community.description && (
            <div className="comm-home-card">
              <div className="comm-home-card-title">About</div>
              <div className="comm-home-card-body">{community.description}</div>
            </div>
          )}

          {/* Threads */}
          <div className="comm-home-card">
            <div className="comm-home-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Threads</span>
              {membership && (
                <Link to={`/forums/new?community=${community.slug}`} className="comm-btn primary" style={{ padding: '6px 14px', fontSize: 12.5 }}>
                  + New thread
                </Link>
              )}
            </div>
            {threads.length === 0 ? (
              <div className="comm-empty" style={{ margin: '0.5rem 0 0' }}>
                No threads yet. {membership ? 'Be the first to post.' : 'Join to start one.'}
              </div>
            ) : (
              <div className="comm-thread-list">
                {threads.map((row) => {
                  const t = mapThreadRow(row);
                  return (
                    <Link key={t.id} to={`/forums/thread/${t.slug}`} className="comm-thread-row">
                      <div className="comm-thread-title">{t.title}</div>
                      <div className="comm-thread-meta">
                        <span>{t.replyCount} replies</span>
                        <span>·</span>
                        <span>{t.viewCount} views</span>
                        <span>·</span>
                        <span>{t.lastReplyAgo || 'recently'}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right rail — community info */}
        <aside className="comm-home-side">
          <div className="comm-home-card">
            <div className="comm-home-card-title">About this community</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Created {new Date(community.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <Stat label="Members" value={community.member_count} />
              <Stat label="Threads" value={community.thread_count} />
            </div>
          </div>

          {isAuthed && !membership && (
            <div className="comm-home-card">
              <div className="comm-home-card-title">Not a member yet?</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 10 }}>
                Join to post threads and show up in this community's member list.
              </div>
              <button type="button" className="comm-btn primary" onClick={handleToggleJoin} disabled={busy} style={{ width: '100%' }}>
                {busy ? 'Joining…' : 'Join community'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: '8px 10px', background: '#FDFBF5', borderRadius: 8, border: '1px solid var(--border-light)' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
        {Number(value || 0).toLocaleString()}
      </div>
    </div>
  );
}

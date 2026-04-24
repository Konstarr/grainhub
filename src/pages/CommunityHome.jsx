import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCommunityBySlug,
  fetchMyMembership,
  joinCommunity,
  leaveCommunity,
  fetchCommunityMembers,
  fetchCommunityMessages,
  sendCommunityMessage,
  subscribeCommunityMessages,
} from '../lib/communityDb.js';
import { supabase } from '../lib/supabase.js';
import { CommunityIcon } from './Communities.jsx';
import '../styles/communities.css';

/**
 * /c/:slug — community as a chat room.
 *
 * Layout:
 *   - Top banner with name / icon / member count / Join button
 *   - Center: messages stream + compose box at bottom
 *   - Right: member roster grouped by role (Owner / Mods / Members)
 *
 * Realtime: subscribes to community_messages inserts via Supabase
 * realtime so new messages stream in automatically.
 */
export default function CommunityHome() {
  const { slug } = useParams();
  const { user, isAuthed } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    const { data } = await fetchCommunityBySlug(slug);
    if (!data) { setNotFound(true); setLoading(false); return; }
    setCommunity(data);
    const [m, r, msgs] = await Promise.all([
      fetchMyMembership(data.id),
      fetchCommunityMembers(data.id),
      fetchCommunityMessages(data.id, { limit: 100 }),
    ]);
    setMembership(m.data || null);
    setMembers(r.data || []);
    setMessages(msgs.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  // Realtime subscription — live message inserts.
  useEffect(() => {
    if (!community?.id) return undefined;
    const channel = subscribeCommunityMessages(community.id, async (row) => {
      // The realtime payload doesn't include the embedded author —
      // hydrate by looking up the profile in our local member list.
      const authorFromMembers = members.find((m) => m.profile?.id === row.author_id)?.profile;
      const hydrated = { ...row, author: authorFromMembers || null };
      // If author wasn't in the local member list (e.g. a mod posted
      // from another tab), fetch them.
      if (!hydrated.author && row.author_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', row.author_id)
          .maybeSingle();
        hydrated.author = data || null;
      }
      setMessages((prev) => {
        // Guard against dupes: the sender also optimistically added
        // their own message, so skip if we already have this id.
        if (prev.some((m) => m.id === hydrated.id)) return prev;
        return [...prev, hydrated];
      });
    });
    return () => { if (channel) supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [community?.id]);

  const handleToggleJoin = async () => {
    if (!community) return;
    setBusy(true);
    if (membership) await leaveCommunity(community.id);
    else            await joinCommunity(community.id);
    setBusy(false);
    load();
  };

  const isMember = !!membership;
  const isMod = membership?.role === 'mod' || membership?.role === 'owner';

  const handleSend = async (body) => {
    if (!community?.id || !body.trim()) return { ok: false };
    const { data, error } = await sendCommunityMessage(community.id, body);
    if (error) return { ok: false, error: error.message };
    // Optimistic append — realtime will dedupe.
    if (data) setMessages((prev) => [...prev, data]);
    return { ok: true };
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

      <div
        className="comm-banner"
        style={{
          backgroundImage: community.banner_url
            ? `url(${community.banner_url})`
            : 'linear-gradient(135deg, #2C1A0E 0%, #6B3F1F 50%, #A0522D 100%)',
        }}
      >
        <div className="comm-banner-inner">
          <CommunityIcon c={community} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="comm-home-title">{community.name}</h1>
            <div className="comm-home-sub">
              <span>c/{community.slug}</span>
              <span className="dot">·</span>
              <span>{(community.member_count || 0).toLocaleString()} members</span>
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

      {community.description && (
        <div className="comm-chat-about">
          <div className="comm-chat-about-inner">{community.description}</div>
        </div>
      )}

      <div className="comm-chat-wrap">
        {/* Messages column */}
        <div className="comm-chat-main">
          {!isMember ? (
            <div className="comm-gate">
              <div className="comm-gate-title">Join to see the chat</div>
              <div className="comm-gate-sub">
                This community's conversation is visible to members only. Join to read and post.
              </div>
              {isAuthed ? (
                <button type="button" className="comm-btn primary" onClick={handleToggleJoin} disabled={busy}>
                  {busy ? 'Joining…' : 'Join community'}
                </button>
              ) : (
                <Link to="/login" className="comm-btn primary">Sign in</Link>
              )}
            </div>
          ) : (
            <ChatStream
              messages={messages}
              currentUserId={user?.id}
              isMod={isMod}
              onSend={handleSend}
            />
          )}
        </div>

        {/* Member roster */}
        <aside className="comm-chat-side">
          <div className="comm-chat-side-title">
            Members <span className="comm-chat-side-count">{members.length}</span>
          </div>
          <MemberRoster members={members} />
        </aside>
      </div>
    </>
  );
}

/* ══════════════════ Chat stream + compose ══════════════════ */
function ChatStream({ messages, currentUserId, isMod, onSend }) {
  const scrollerRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  // Auto-scroll to bottom when messages change — only if the user is
  // already near the bottom, so reading older history isn't disturbed.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Grouped rendering: consecutive messages from the same author within
  // 5 minutes collapse into one "block" so the avatar + name appears
  // once per block.
  const blocks = useMemo(() => {
    const out = [];
    messages.forEach((m) => {
      const last = out[out.length - 1];
      const sameAuthor = last && last.authorId === m.author_id;
      const close = last && (new Date(m.created_at) - new Date(last.items[last.items.length - 1].created_at)) < 5 * 60 * 1000;
      if (last && sameAuthor && close) {
        last.items.push(m);
      } else {
        out.push({ authorId: m.author_id, author: m.author, items: [m] });
      }
    });
    return out;
  }, [messages]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setErr(null);
    const res = await onSend(draft);
    setSending(false);
    if (!res.ok) {
      setErr(res.error || 'Message failed to send.');
      return;
    }
    setDraft('');
  };

  return (
    <div className="comm-chat-col">
      <div className="comm-chat-scroll" ref={scrollerRef}>
        {messages.length === 0 ? (
          <div className="comm-chat-empty">
            No messages yet. Say hi 👋
          </div>
        ) : (
          blocks.map((b, i) => (
            <ChatBlock key={b.items[0].id + '_' + i} block={b} currentUserId={currentUserId} isMod={isMod} />
          ))
        )}
      </div>

      <form className="comm-chat-compose" onSubmit={submit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Say something to the community…"
          rows={1}
          className="comm-chat-input"
          maxLength={4000}
        />
        <button type="submit" className="comm-btn primary" disabled={!draft.trim() || sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
      {err && <div className="comm-chat-err">{err}</div>}
      <div className="comm-chat-hint">
        <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for a new line
      </div>
    </div>
  );
}

function ChatBlock({ block, currentUserId, isMod }) {
  const isSelf = block.authorId === currentUserId;
  const name = block.author?.full_name || block.author?.username || 'Someone';
  const avatarUrl = block.author?.avatar_url;
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const firstTs = block.items[0].created_at;

  return (
    <div className={'comm-chat-block ' + (isSelf ? 'is-self' : '')}>
      <div className="comm-chat-avatar">
        {avatarUrl
          ? <img src={avatarUrl} alt="" />
          : <span>{initials}</span>}
      </div>
      <div className="comm-chat-body">
        <div className="comm-chat-head">
          <Link
            to={block.author?.username ? '/profile/' + block.author.username : '/forums'}
            className="comm-chat-name"
          >
            {name}
          </Link>
          <span className="comm-chat-ts" title={new Date(firstTs).toLocaleString()}>
            {formatRelative(firstTs)}
          </span>
        </div>
        {block.items.map((m) => (
          <div key={m.id} className="comm-chat-msg">
            {m.deleted_at ? (
              <em style={{ color: 'var(--text-muted)' }}>Message deleted</em>
            ) : (
              m.body
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRelative(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return 'just now';
  if (ms < 60 * 60 * 1000) return Math.floor(ms / 60000) + 'm';
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ══════════════════ Member roster ══════════════════ */
function MemberRoster({ members }) {
  const owners = members.filter((m) => m.role === 'owner');
  const mods   = members.filter((m) => m.role === 'mod');
  const regs   = members.filter((m) => m.role === 'member');

  if (members.length === 0) {
    return <div className="comm-empty" style={{ padding: '1.25rem 1rem' }}>No members yet.</div>;
  }

  return (
    <div className="comm-members">
      {owners.length > 0 && <RosterGroup label="Owner" rows={owners} />}
      {mods.length   > 0 && <RosterGroup label={'Moderators · ' + mods.length} rows={mods} />}
      {regs.length   > 0 && <RosterGroup label={'Members · ' + regs.length} rows={regs} />}
    </div>
  );
}

function RosterGroup({ label, rows }) {
  return (
    <div className="comm-roster-group">
      <div className="comm-roster-label">{label}</div>
      {rows.map((m) => {
        const p = m.profile;
        if (!p) return null;
        const name = p.full_name || p.username || 'Member';
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
        return (
          <Link
            key={p.id}
            to={'/profile/' + (p.username || p.id)}
            className="comm-roster-row"
          >
            <div className="comm-roster-avatar">
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
            </div>
            <div className="comm-roster-text">
              <div className="comm-roster-name">{name}</div>
              {p.trade && <div className="comm-roster-trade">{p.trade}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

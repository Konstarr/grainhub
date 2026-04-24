import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCommunityBySlug,
  fetchMyMembership,
  joinCommunity,
  leaveCommunity,
  fetchCommunityMembers,
  fetchCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  togglePostLike,
  setPostPinned,
  fetchPostComments,
  createPostComment,
  deletePostComment,
} from '../lib/communityDb.js';
import { CommunityIcon } from './Communities.jsx';
import { safeImageUrl } from '../lib/urlSafety.js';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/communities.css';

/**
 * /c/:slug — community home, Facebook-group-inspired but tuned to
 * the millwork/trade palette. Layout:
 *
 *   Banner w/ icon, name, member strip, Join button
 *   Tab bar: Discussion · About · Members · Media
 *
 *   On Discussion tab:
 *     Center : composer with post-type chips · pinned posts rail ·
 *              filterable feed · each card has like/comment/pin
 *     Right  : About card · Recent media · Member preview
 *
 * Everything below the banner is member-gated.
 */

const POST_TYPES = [
  { id: 'discussion',   label: 'Discussion',   icon: '💬', tint: 'tint-discussion' },
  { id: 'question',     label: 'Question',     icon: '❓', tint: 'tint-question' },
  { id: 'showcase',     label: 'Showcase',     icon: '🔨', tint: 'tint-showcase' },
  { id: 'announcement', label: 'Announcement', icon: '📣', tint: 'tint-announcement' },
];
const TYPE_MAP = Object.fromEntries(POST_TYPES.map((t) => [t.id, t]));

const TABS = [
  { id: 'discussion', label: 'Discussion' },
  { id: 'about',      label: 'About' },
  { id: 'members',    label: 'Members' },
  { id: 'media',      label: 'Media' },
];

export default function CommunityHome() {
  const { slug } = useParams();
  const { user, isAuthed } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('discussion');
  const [filterType, setFilterType] = useState(null); // null = all

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    const { data } = await fetchCommunityBySlug(slug);
    if (!data) { setNotFound(true); setLoading(false); return; }
    setCommunity(data);
    const [m, r, p] = await Promise.all([
      fetchMyMembership(data.id),
      fetchCommunityMembers(data.id),
      fetchCommunityPosts(data.id, { myUserId: user?.id }),
    ]);
    setMembership(m.data || null);
    setMembers(r.data || []);
    setPosts(p.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug, user?.id]);
  useDocumentTitle(community?.name);

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

  const handleCreatePost = async ({ body, imageUrl, postType }) => {
    if (!community?.id) return { ok: false };
    const { data, error } = await createCommunityPost(community.id, { body, imageUrl, postType });
    if (error) return { ok: false, error: error.message };
    if (data) setPosts((prev) => [{ ...data, iLiked: false }, ...prev]);
    return { ok: true };
  };
  const handleLike = async (post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, iLiked: !p.iLiked, like_count: Math.max(0, (p.like_count || 0) + (p.iLiked ? -1 : 1)) }
          : p
      )
    );
    await togglePostLike({ postId: post.id, communityId: community.id, iLiked: post.iLiked });
  };
  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await deleteCommunityPost(postId);
    if (error) { alert(error.message); return; }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };
  const handlePin = async (post) => {
    const next = !post.is_pinned;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_pinned: next } : p)));
    const { error } = await setPostPinned(post.id, next);
    if (error) {
      // revert on error
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_pinned: !next } : p)));
      alert(error.message);
    }
  };

  if (notFound) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap">
          <div className="comm-empty">We couldn't find a community at <code>/c/{slug}</code>.</div>
        </div>
      </>
    );
  }
  if (loading || !community) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap"><div className="comm-empty">Loading…</div></div>
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

      {/* ── HERO / BANNER ── */}
      <div
        className="comm-banner comm-banner-soft"
        style={{
          backgroundImage: safeImageUrl(community.banner_url)
            ? `url("${safeImageUrl(community.banner_url)}")`
            : 'linear-gradient(135deg, #2C1A0E 0%, #6B3F1F 50%, #A0522D 100%)',
        }}
      >
        <div className="comm-banner-inner comm-banner-inner-rich">
          <CommunityIcon c={community} size={96} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="comm-home-title">{community.name}</h1>
            <div className="comm-home-sub">
              <span className="comm-dot-public">● Public group</span>
              <span className="dot">·</span>
              <span>{(community.member_count || 0).toLocaleString()} members</span>
            </div>
            {members.length > 0 && (
              <div className="comm-avatar-strip" aria-label="Some members of this community">
                {members.slice(0, 14).map((m) => (
                  <AvatarChip key={m.profile?.id} profile={m.profile} />
                ))}
                {members.length > 14 && (
                  <span className="comm-avatar-more">+{members.length - 14}</span>
                )}
              </div>
            )}
          </div>
          <div className="comm-home-actions">
            {isAuthed ? (
              <button
                type="button"
                onClick={handleToggleJoin}
                disabled={busy}
                className={'comm-btn ' + (membership ? 'ghost-light' : 'primary')}
              >
                {busy ? '…' : membership ? (membership.role === 'owner' ? 'Owner ▾' : 'Joined ✓') : '+ Join group'}
              </button>
            ) : (
              <Link to="/login" className="comm-btn primary">Sign in to join</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="comm-tabs">
        <div className="comm-tabs-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={'comm-tab ' + (tab === t.id ? 'active' : '')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="comm-feed-wrap">
        <div className="comm-feed-main">
          {tab === 'discussion' && (
            <DiscussionTab
              community={community}
              posts={posts}
              members={members}
              isMember={isMember}
              isAuthed={isAuthed}
              isMod={isMod}
              currentUserId={user?.id}
              filterType={filterType}
              setFilterType={setFilterType}
              onCreate={handleCreatePost}
              onLike={handleLike}
              onDelete={handleDeletePost}
              onPin={handlePin}
              onJoin={handleToggleJoin}
              busy={busy}
            />
          )}

          {tab === 'about' && <AboutTab community={community} />}
          {tab === 'members' && <MembersTab members={members} />}
          {tab === 'media' && <MediaTab posts={posts} />}
        </div>

        <aside className="comm-chat-side">
          <AboutCard community={community} />
          <RecentMediaCard posts={posts} onSeeAll={() => setTab('media')} />
          <MemberPreviewCard members={members} onSeeAll={() => setTab('members')} />
        </aside>
      </div>
    </>
  );
}

/* ══════════════════ Discussion tab ══════════════════ */
function DiscussionTab({
  community, posts, members, isMember, isAuthed, isMod, currentUserId,
  filterType, setFilterType, onCreate, onLike, onDelete, onPin, onJoin, busy,
}) {
  const pinned   = useMemo(() => posts.filter((p) => p.is_pinned), [posts]);
  const regular  = useMemo(() => posts.filter((p) => !p.is_pinned), [posts]);
  const filtered = filterType ? regular.filter((p) => p.post_type === filterType) : regular;

  if (!isMember) {
    return (
      <div className="comm-gate comm-gate-card">
        <div className="comm-gate-title">Join to see posts</div>
        <div className="comm-gate-sub">Posts in this community are visible to members only.</div>
        {isAuthed ? (
          <button type="button" className="comm-btn primary" onClick={onJoin} disabled={busy}>
            {busy ? 'Joining…' : 'Join community'}
          </button>
        ) : (
          <Link to="/login" className="comm-btn primary">Sign in</Link>
        )}
      </div>
    );
  }

  return (
    <>
      <PostComposer onSubmit={onCreate} />

      {/* Filter chips — All + one per post type */}
      <div className="comm-filter-row">
        <button
          type="button"
          className={'comm-filter-chip ' + (!filterType ? 'active' : '')}
          onClick={() => setFilterType(null)}
        >
          All
        </button>
        {POST_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={'comm-filter-chip ' + (filterType === t.id ? 'active' : '')}
            onClick={() => setFilterType(t.id)}
          >
            <span style={{ marginRight: 5 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && !filterType && (
        <div className="comm-pinned-group">
          <div className="comm-section-ribbon">📌 Pinned</div>
          {pinned.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              community={community}
              currentUserId={currentUserId}
              canModerate={isMod}
              onLike={onLike}
              onDelete={onDelete}
              onPin={onPin}
            />
          ))}
        </div>
      )}

      {/* Regular feed */}
      {filtered.length === 0 ? (
        <div className="comm-empty" style={{ marginTop: 12 }}>
          {filterType ? `No ${TYPE_MAP[filterType].label.toLowerCase()} posts yet.` : 'No posts yet. Be the first to write something.'}
        </div>
      ) : (
        filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            community={community}
            currentUserId={currentUserId}
            canModerate={isMod}
            onLike={onLike}
            onDelete={onDelete}
            onPin={onPin}
          />
        ))
      )}
    </>
  );
}

/* ══════════════════ About / Members / Media tabs ══════════════════ */
function AboutTab({ community }) {
  return (
    <div className="post-card" style={{ padding: '1.2rem 1.35rem' }}>
      <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700 }}>
        About this community
      </h3>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>
        {community.description || 'The founder hasn\'t written a description yet.'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 16 }}>
        <FactChip label="Members"   value={(community.member_count || 0).toLocaleString()} />
        <FactChip label="Posts"     value={(community.thread_count || 0).toLocaleString()} />
        <FactChip label="Visibility" value={community.is_public ? 'Public' : 'Private'} />
        <FactChip label="Founded"   value={new Date(community.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
      </div>
    </div>
  );
}
function FactChip({ label, value }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: '#FDFBF5',
      border: '1px solid var(--border-light)',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

function MembersTab({ members }) {
  const owners = members.filter((m) => m.role === 'owner');
  const mods   = members.filter((m) => m.role === 'mod');
  const regs   = members.filter((m) => m.role === 'member');
  return (
    <div className="post-card" style={{ padding: '1rem 1.1rem' }}>
      {owners.length > 0 && <RosterGroup label="Owner" rows={owners} />}
      {mods.length   > 0 && <RosterGroup label={'Moderators · ' + mods.length} rows={mods} />}
      {regs.length   > 0 && <RosterGroup label={'Members · ' + regs.length} rows={regs} />}
    </div>
  );
}

function MediaTab({ posts }) {
  const imgs = posts.filter((p) => p.image_url && !p.deleted_at);
  if (imgs.length === 0) {
    return <div className="comm-empty">No images posted yet.</div>;
  }
  return (
    <div className="comm-media-grid">
      {imgs.map((p) => (
        <img key={p.id} src={p.image_url} alt="" className="comm-media-tile" loading="lazy" />
      ))}
    </div>
  );
}

/* ══════════════════ Sidebar cards ══════════════════ */
function AboutCard({ community }) {
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title">About</div>
      <div style={{ padding: '0.85rem 1rem', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {community.description
          ? (community.description.length > 160 ? community.description.slice(0, 160) + '…' : community.description)
          : 'Founder hasn\'t written a description yet.'}
        <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
          <SideFact label="Public"  value="Anyone can see posts" />
          <SideFact label="Founded" value={new Date(community.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} />
        </div>
      </div>
    </div>
  );
}
function SideFact({ label, value }) {
  return (
    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
      <strong style={{ color: 'var(--text-primary)' }}>{label}</strong> · {value}
    </div>
  );
}

function RecentMediaCard({ posts, onSeeAll }) {
  const imgs = posts.filter((p) => p.image_url && !p.deleted_at).slice(0, 6);
  if (imgs.length === 0) return null;
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Recent media</span>
        <button type="button" onClick={onSeeAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 11.5, color: 'var(--wood-warm)', fontWeight: 600 }}>
          See all
        </button>
      </div>
      <div className="comm-side-media">
        {imgs.map((p) => (
          <img key={p.id} src={p.image_url} alt="" loading="lazy" />
        ))}
      </div>
    </div>
  );
}
function MemberPreviewCard({ members, onSeeAll }) {
  if (members.length === 0) return null;
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Members <span className="comm-chat-side-count">{members.length}</span></span>
        <button type="button" onClick={onSeeAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 11.5, color: 'var(--wood-warm)', fontWeight: 600 }}>
          See all
        </button>
      </div>
      <div className="comm-members" style={{ maxHeight: 260 }}>
        {members.slice(0, 8).map((m) => {
          const p = m.profile; if (!p) return null;
          const name = p.full_name || p.username || 'Member';
          const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
          return (
            <Link key={p.id} to={'/profile/' + (p.username || p.id)} className="comm-roster-row">
              <div className="comm-roster-avatar">
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
              </div>
              <div className="comm-roster-text">
                <div className="comm-roster-name">{name}</div>
                {m.role !== 'member' && (
                  <div className="comm-roster-trade" style={{ color: 'var(--wood-warm)' }}>{m.role}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════ Avatar chip for header strip ══════════════════ */
function AvatarChip({ profile }) {
  if (!profile) return null;
  const name = profile.full_name || profile.username || '?';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <Link
      to={'/profile/' + (profile.username || profile.id)}
      className="comm-avatar-chip"
      title={name}
    >
      {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{initials}</span>}
    </Link>
  );
}

/* ══════════════════ Composer ══════════════════ */
function PostComposer({ onSubmit }) {
  const [body, setBody]   = useState('');
  const [imageUrl, setUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [postType, setPostType] = useState('discussion');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setErr(null);
    const res = await onSubmit({ body, imageUrl: imageUrl.trim() || null, postType });
    setSending(false);
    if (!res.ok) { setErr(res.error || 'Could not post.'); return; }
    setBody(''); setUrl(''); setShowUrl(false); setPostType('discussion');
  };

  return (
    <div className="post-composer">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share something with the community…"
          rows={3}
          className="post-composer-input"
          maxLength={8000}
        />
        {showUrl && (
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an image URL (https://…)"
            className="post-composer-url"
          />
        )}
        <div className="comm-type-chips" role="radiogroup" aria-label="Post type">
          {POST_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={postType === t.id}
              onClick={() => setPostType(t.id)}
              className={'comm-type-chip ' + t.tint + ' ' + (postType === t.id ? 'active' : '')}
            >
              <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        {err && <div className="comm-chat-err">{err}</div>}
        <div className="post-composer-actions">
          <button
            type="button"
            className="post-composer-ghost"
            onClick={() => setShowUrl((v) => !v)}
          >
            {showUrl ? '✕ Remove image' : '📷 Add image'}
          </button>
          <button type="submit" className="comm-btn primary" disabled={!body.trim() || sending}>
            {sending ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════ Post card ══════════════════ */
function PostCard({ post, community, currentUserId, canModerate, onLike, onDelete, onPin }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const author = post.author || {};
  const name = author.full_name || author.username || 'Someone';
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const isOwnPost = post.author_id === currentUserId;
  const type = TYPE_MAP[post.post_type] || TYPE_MAP.discussion;

  const openComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      const { data } = await fetchPostComments(post.id);
      setComments(data || []);
    }
  };
  const handleReply = async (body) => {
    const { data, error } = await createPostComment({ postId: post.id, communityId: community.id, body });
    if (error) return { ok: false, error: error.message };
    setComments((prev) => [...(prev || []), data]);
    post.comment_count = (post.comment_count || 0) + 1;
    return { ok: true };
  };
  const handleCommentDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await deletePostComment(commentId);
    if (error) { alert(error.message); return; }
    setComments((prev) => (prev || []).filter((c) => c.id !== commentId));
    post.comment_count = Math.max(0, (post.comment_count || 0) - 1);
  };

  return (
    <article className={'post-card ' + (post.is_pinned ? 'post-card-pinned' : '')}>
      <div className="post-card-typebar">
        <span className={'comm-type-chip ' + type.tint + ' active'} style={{ pointerEvents: 'none' }}>
          <span style={{ marginRight: 5 }}>{type.icon}</span>{type.label}
        </span>
        {post.is_pinned && <span className="post-card-pin-pill">📌 Pinned</span>}
      </div>
      <header className="post-card-head">
        <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-card-avatar">
          {author.avatar_url ? <img src={author.avatar_url} alt="" /> : <span>{initials}</span>}
        </Link>
        <div className="post-card-head-text">
          <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-card-author">
            {name}
          </Link>
          <div className="post-card-ts" title={new Date(post.created_at).toLocaleString()}>
            {formatRelative(post.created_at)}
            {author.trade && <> · <span style={{ color: 'var(--wood-warm)' }}>{author.trade}</span></>}
          </div>
        </div>
        {(isOwnPost || canModerate) && (
          <div style={{ display: 'flex', gap: 4 }}>
            {canModerate && (
              <button type="button" onClick={() => onPin(post)} className="post-card-menu" title={post.is_pinned ? 'Unpin' : 'Pin to top'}>
                {post.is_pinned ? '📌' : '📍'}
              </button>
            )}
            <button type="button" onClick={() => onDelete(post.id)} className="post-card-menu" title="Delete">⋯</button>
          </div>
        )}
      </header>

      <div className="post-card-body">{post.body}</div>
      {post.image_url && <img src={post.image_url} alt="" className="post-card-image" loading="lazy" />}

      <div className="post-card-counts">
        {post.like_count > 0 && <span><span className="post-heart">❤</span> {post.like_count}</span>}
        {post.comment_count > 0 && <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>}
      </div>

      <div className="post-card-actions">
        <button type="button" onClick={() => onLike(post)} className={'post-action-btn ' + (post.iLiked ? 'liked' : '')}>
          <span className="post-action-icon">{post.iLiked ? '❤' : '♡'}</span>
          Like
        </button>
        <button type="button" onClick={openComments} className="post-action-btn">
          <span className="post-action-icon">💬</span>
          Comment
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {comments === null ? (
            <div className="post-comments-empty">Loading…</div>
          ) : comments.length === 0 ? (
            <div className="post-comments-empty">No comments yet — be first.</div>
          ) : (
            comments.map((c) => (
              <Comment
                key={c.id}
                c={c}
                canDelete={c.author_id === currentUserId || canModerate}
                onDelete={handleCommentDelete}
              />
            ))
          )}
          <CommentComposer onReply={handleReply} />
        </div>
      )}
    </article>
  );
}

function Comment({ c, canDelete, onDelete }) {
  const author = c.author || {};
  const name = author.full_name || author.username || 'Someone';
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="post-comment">
      <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-comment-avatar">
        {author.avatar_url ? <img src={author.avatar_url} alt="" /> : <span>{initials}</span>}
      </Link>
      <div className="post-comment-bubble">
        <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-comment-author">{name}</Link>
        <div className="post-comment-body">{c.body}</div>
        <div className="post-comment-meta">
          <span>{formatRelative(c.created_at)}</span>
          {canDelete && (
            <>
              <span>·</span>
              <button type="button" onClick={() => onDelete(c.id)} className="post-comment-delete">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({ onReply }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true); setErr(null);
    const res = await onReply(body);
    setSending(false);
    if (!res.ok) { setErr(res.error || 'Could not comment.'); return; }
    setBody('');
  };
  return (
    <form onSubmit={submit} className="post-comment-compose">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment…"
        className="post-comment-compose-input"
        maxLength={4000}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
      />
      {err && <div className="comm-chat-err" style={{ marginTop: 6 }}>{err}</div>}
    </form>
  );
}

/* ══════════════════ Member roster ══════════════════ */
function RosterGroup({ label, rows }) {
  return (
    <div className="comm-roster-group">
      <div className="comm-roster-label">{label}</div>
      {rows.map((m) => {
        const p = m.profile; if (!p) return null;
        const name = p.full_name || p.username || 'Member';
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
        return (
          <Link key={p.id} to={'/profile/' + (p.username || p.id)} className="comm-roster-row">
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

/* ══════════════════ Helpers ══════════════════ */
function formatRelative(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return 'just now';
  if (ms < 60 * 60 * 1000) return Math.floor(ms / 60000) + 'm ago';
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h ago';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd ago';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

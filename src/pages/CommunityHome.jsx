import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
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
  fetchPostComments,
  createPostComment,
  deletePostComment,
} from '../lib/communityDb.js';
import { CommunityIcon } from './Communities.jsx';
import '../styles/communities.css';

/**
 * /c/:slug — community home as a Facebook-style feed.
 *
 *   Top    : banner + name + Join button
 *   Center : composer ("Write something…") + list of PostCards
 *            each with like + comment + inline comment thread
 *   Right  : members roster grouped by role
 */
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

  const handleCreatePost = async ({ body, imageUrl }) => {
    if (!community?.id) return { ok: false };
    const { data, error } = await createCommunityPost(community.id, { body, imageUrl });
    if (error) return { ok: false, error: error.message };
    if (data) setPosts((prev) => [{ ...data, iLiked: false }, ...prev]);
    return { ok: true };
  };

  const handleLike = async (post) => {
    // optimistic
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

      <div className="comm-feed-wrap">
        <div className="comm-feed-main">
          {isMember && (
            <PostComposer
              currentUser={user}
              onSubmit={handleCreatePost}
            />
          )}

          {!isMember && (
            <div className="comm-gate comm-gate-card">
              <div className="comm-gate-title">Join to see posts</div>
              <div className="comm-gate-sub">
                Posts in this community are visible to members only.
              </div>
              {isAuthed ? (
                <button type="button" className="comm-btn primary" onClick={handleToggleJoin} disabled={busy}>
                  {busy ? 'Joining…' : 'Join community'}
                </button>
              ) : (
                <Link to="/login" className="comm-btn primary">Sign in</Link>
              )}
            </div>
          )}

          {isMember && posts.length === 0 && (
            <div className="comm-empty" style={{ marginTop: 12 }}>
              No posts yet. Be the first to write something.
            </div>
          )}

          {isMember && posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              community={community}
              currentUserId={user?.id}
              canModerate={isMod}
              onLike={handleLike}
              onDelete={handleDeletePost}
            />
          ))}
        </div>

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

/* ══════════════════ Post composer ══════════════════ */
function PostComposer({ currentUser, onSubmit }) {
  const [body, setBody]     = useState('');
  const [imageUrl, setUrl]  = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setErr(null);
    const res = await onSubmit({ body, imageUrl: imageUrl.trim() || null });
    setSending(false);
    if (!res.ok) { setErr(res.error || 'Could not post.'); return; }
    setBody('');
    setUrl('');
    setShowUrl(false);
  };

  const avatarInitials = (currentUser?.email || '??').slice(0, 2).toUpperCase();

  return (
    <div className="post-composer">
      <div className="post-composer-row">
        <div className="post-composer-avatar">{avatarInitials}</div>
        <form onSubmit={submit} className="post-composer-form">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something to the group…"
            rows={showUrl || body ? 3 : 1}
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
          {err && <div className="comm-chat-err">{err}</div>}
          <div className="post-composer-actions">
            <button
              type="button"
              className="post-composer-ghost"
              onClick={() => setShowUrl((v) => !v)}
            >
              {showUrl ? '✕ Remove image' : '📷 Add image'}
            </button>
            <button
              type="submit"
              className="comm-btn primary"
              disabled={!body.trim() || sending}
            >
              {sending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════ Post card + comments ══════════════════ */
function PostCard({ post, community, currentUserId, canModerate, onLike, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null); // null = not loaded yet
  const author = post.author || {};
  const name = author.full_name || author.username || 'Someone';
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const isOwnPost = post.author_id === currentUserId;

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
    // Also bump the displayed comment_count without refetching everything.
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
    <article className="post-card">
      <header className="post-card-head">
        <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-card-avatar">
          {author.avatar_url ? <img src={author.avatar_url} alt="" /> : <span>{initials}</span>}
        </Link>
        <div className="post-card-head-text">
          <Link
            to={author.username ? '/profile/' + author.username : '/forums'}
            className="post-card-author"
          >
            {name}
          </Link>
          <div className="post-card-ts" title={new Date(post.created_at).toLocaleString()}>
            {formatRelative(post.created_at)}
            {author.trade && <> · <span style={{ color: 'var(--wood-warm)' }}>{author.trade}</span></>}
          </div>
        </div>
        {(isOwnPost || canModerate) && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="post-card-menu"
            aria-label="Delete post"
            title="Delete"
          >
            ⋯
          </button>
        )}
      </header>

      <div className="post-card-body">{post.body}</div>

      {post.image_url && (
        <img src={post.image_url} alt="" className="post-card-image" />
      )}

      <div className="post-card-counts">
        {(post.like_count > 0 || post.comment_count > 0) && (
          <>
            {post.like_count > 0 && (
              <span><span className="post-heart">❤</span> {post.like_count}</span>
            )}
            {post.comment_count > 0 && (
              <span>
                {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
              </span>
            )}
          </>
        )}
      </div>

      <div className="post-card-actions">
        <button
          type="button"
          onClick={() => onLike(post)}
          className={'post-action-btn ' + (post.iLiked ? 'liked' : '')}
        >
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
        <Link
          to={author.username ? '/profile/' + author.username : '/forums'}
          className="post-comment-author"
        >
          {name}
        </Link>
        <div className="post-comment-body">{c.body}</div>
        <div className="post-comment-meta">
          <span>{formatRelative(c.created_at)}</span>
          {canDelete && (
            <>
              <span>·</span>
              <button type="button" onClick={() => onDelete(c.id)} className="post-comment-delete">
                Delete
              </button>
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
    setSending(true);
    setErr(null);
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

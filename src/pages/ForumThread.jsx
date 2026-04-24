import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/forumThread.css';
import PageBack from '../components/shared/PageBack.jsx';
import ReportModal from '../components/shared/ReportModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FORUM_GROUPS } from '../data/forumsData.js';
import {
  fetchThreadBySlug,
  fetchThreadPosts,
  hasUpvotedThread,
  fetchUserPostUpvotes,
  toggleThreadUpvote,
  togglePostUpvote,
  createPost,
  incrementThreadViews,
} from '../lib/forumDb.js';

function findCategoryMeta(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return { category: cat, group: g };
  }
  return { category: null, group: null };
}

function authorDisplay(author) {
  if (!author) return { handle: 'community', name: 'Community', initials: 'GH', trade: '', reputation: 0 };
  const name = author.full_name || author.username || 'Member';
  const handle = author.username || 'member';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'GH';
  return { handle, name, initials, trade: author.trade || '', reputation: author.reputation || 0 };
}

function timeAgo(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm ago';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h ago';
  const d = Math.floor(hr / 24);
  if (d < 30) return d + 'd ago';
  return new Date(iso).toLocaleDateString();
}

function AuthorCard({ author }) {
  const a = authorDisplay(author);
  return (
    <div className="user-col">
      <Link to={'/profile/' + a.handle} className={'user-avatar av-a'} style={{ textDecoration: 'none' }}>
        {a.initials}
      </Link>
      <Link to={'/profile/' + a.handle} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="user-name">{a.name}</div>
      </Link>
      {a.trade && <div className="user-title">{a.trade}</div>}
      <div className="user-rep">{a.reputation} rep</div>
    </div>
  );
}

function PostCard({ post, index, isOp, isAccepted, hasUpvoted, onUpvote, onQuote, onReport, onGoToProfile }) {
  const quoted = post.quoted_post_id && post.__quoted
    ? { author: authorDisplay(post.__quoted.author), body: post.__quoted.body }
    : null;

  return (
    <div className={'post ' + (isOp ? 'op ' : '') + (isAccepted ? 'best' : '')}>
      <div className="post-inner">
        <div className="vote-col">
          <button
            type="button"
            className={'vote-btn ' + (hasUpvoted ? 'voted' : '')}
            onClick={onUpvote}
            aria-label="Upvote"
            title={hasUpvoted ? 'Remove upvote' : 'Upvote'}
          >
            ▲
          </button>
          <div className="vote-count">{post.upvote_count || 0}</div>
        </div>

        <AuthorCard author={post.author} />

        <div className="post-body">
          <div className="post-header">
            <span className="post-num">#{index + 1}</span>
            {isOp && <span className="post-op-badge">OP</span>}
            {isAccepted && <span className="best-badge">✓ Accepted answer</span>}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>

          {quoted && (
            <div className="post-quote">
              <div className="post-quote-author">{quoted.author.name} wrote:</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {(quoted.body || '').slice(0, 280)}{(quoted.body || '').length > 280 ? '…' : ''}
              </div>
            </div>
          )}

          <div className="post-text">
            {(post.body || '').split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="post-footer">
            <button type="button" className="post-action" onClick={onQuote}>“ Quote</button>
            <button type="button" className="post-action" onClick={onUpvote}>{hasUpvoted ? '❤️' : '👍'} {hasUpvoted ? 'Liked' : 'Like'}</button>
            <div className="post-footer-spacer" />
            <span className="post-report" onClick={onReport}>⚑ Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadHeader({ thread, category, hasUpvoted, onUpvote, onReport, onReply }) {
  if (!thread) return null;
  return (
    <div className="thread-header">
      <div className="thread-tags">
        {category && <span className="tag tag-cat">{category.name}</span>}
        {thread.is_pinned && <span className="tag tag-solved">📌 Pinned</span>}
        {thread.is_solved && <span className="tag tag-solved">✓ Solved</span>}
        {(thread.view_count || 0) > 1000 && <span className="tag tag-hot">🔥 Hot</span>}
      </div>
      <h1 className="thread-title">{thread.title}</h1>
      <div className="thread-meta">
        <div className="thread-meta-item">👁️ {thread.view_count || 0} views</div>
        <div className="thread-meta-item">💬 {thread.reply_count || 0} replies</div>
        <div className="thread-meta-item">👍 {thread.upvote_count || 0} upvotes</div>
        <div className="thread-meta-item">⏱️ last reply {timeAgo(thread.last_reply_at)}</div>
      </div>
      <div className="thread-actions">
        <button type="button" className="act-btn primary" onClick={onReply}>✉️ Reply</button>
        <button type="button" className={'act-btn ' + (hasUpvoted ? 'primary' : '')} onClick={onUpvote}>
          {hasUpvoted ? '❤️ Upvoted' : '👍 Upvote thread'}
        </button>
        <button type="button" className="act-btn" onClick={onReport}>⚑ Report</button>
      </div>
    </div>
  );
}

function ReplyBox({ value, onChange, onSubmit, disabled, quoteSnippet, onCancelQuote, busy, signedIn }) {
  if (!signedIn) {
    return (
      <div className="reply-box">
        <div className="reply-box-header">
          <strong>Sign in to reply</strong>
        </div>
        <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Link to="/login" style={{ color: 'var(--wood-warm)' }}>Sign in</Link> or{' '}
          <Link to="/signup" style={{ color: 'var(--wood-warm)' }}>create an account</Link> to join this discussion.
        </div>
      </div>
    );
  }
  return (
    <div className="reply-box" id="reply-box">
      <div className="reply-box-header">
        <strong>Post a reply</strong>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Markdown supported</span>
      </div>
      {quoteSnippet && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--wood-cream)', borderBottom: '1px solid var(--border)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong>Replying to {quoteSnippet.authorName}:</strong>
            <div style={{ fontStyle: 'italic', marginTop: 4, color: 'var(--text-muted)' }}>
              "{(quoteSnippet.body || '').slice(0, 200)}{(quoteSnippet.body || '').length > 200 ? '…' : ''}"
            </div>
          </div>
          <button type="button" onClick={onCancelQuote} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
      )}
      <textarea
        className="reply-textarea"
        placeholder="Share your take… be specific, include measurements and photos when they help."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <div className="reply-footer">
        <div className="reply-footer-left">Be kind. Stay on topic. Link sources.</div>
        <div className="reply-footer-right">
          <button type="button" className="act-btn primary" onClick={onSubmit} disabled={disabled || busy || !value.trim()}>
            {busy ? 'Posting…' : 'Post reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForumThread() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAuthed } = useAuth();

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadUpvoted, setThreadUpvoted] = useState(false);
  const [postUpvotedSet, setPostUpvotedSet] = useState(new Set());

  const [replyBody, setReplyBody] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [quoteTarget, setQuoteTarget] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Load thread + posts + user's upvote state
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: t } = await fetchThreadBySlug(slug);
      if (cancelled) return;
      if (!t) { setThread(null); setLoading(false); return; }
      setThread(t);
      incrementThreadViews(t.id).catch(() => null);

      const { data: p } = await fetchThreadPosts(t.id);
      if (cancelled) return;
      setPosts(p);

      if (user?.id) {
        const up = await hasUpvotedThread(t.id, user.id);
        if (!cancelled) setThreadUpvoted(up);
        const postUpvotes = await fetchUserPostUpvotes(p.map((x) => x.id), user.id);
        if (!cancelled) setPostUpvotedSet(postUpvotes);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, user?.id]);

  const { category, group } = findCategoryMeta(thread?.category_id);

  const enrichedPosts = useMemo(() => {
    // Attach quoted posts inline for render
    const byId = {};
    posts.forEach((p) => { byId[p.id] = p; });
    return posts.map((p) => (p.quoted_post_id ? { ...p, __quoted: byId[p.quoted_post_id] } : p));
  }, [posts]);

  const handleThreadUpvote = async () => {
    if (!isAuthed) { navigate('/login'); return; }
    if (!thread) return;
    // optimistic
    setThreadUpvoted((v) => !v);
    setThread((t) => t ? { ...t, upvote_count: (t.upvote_count || 0) + (threadUpvoted ? -1 : 1) } : t);
    const { error } = await toggleThreadUpvote(thread.id, user.id);
    if (error) {
      // revert on failure
      setThreadUpvoted((v) => !v);
      setThread((t) => t ? { ...t, upvote_count: (t.upvote_count || 0) + (threadUpvoted ? 1 : -1) } : t);
    }
  };

  const handlePostUpvote = async (postId) => {
    if (!isAuthed) { navigate('/login'); return; }
    const wasUpvoted = postUpvotedSet.has(postId);
    // optimistic
    setPostUpvotedSet((s) => {
      const next = new Set(s);
      if (wasUpvoted) next.delete(postId); else next.add(postId);
      return next;
    });
    setPosts((ps) => ps.map((p) => p.id === postId
      ? { ...p, upvote_count: (p.upvote_count || 0) + (wasUpvoted ? -1 : 1) }
      : p
    ));
    const { error } = await togglePostUpvote(postId, user.id);
    if (error) {
      setPostUpvotedSet((s) => {
        const next = new Set(s);
        if (wasUpvoted) next.add(postId); else next.delete(postId);
        return next;
      });
      setPosts((ps) => ps.map((p) => p.id === postId
        ? { ...p, upvote_count: (p.upvote_count || 0) + (wasUpvoted ? 1 : -1) }
        : p
      ));
    }
  };

  const handleQuote = (post) => {
    setQuoteTarget({
      postId: post.id,
      authorName: authorDisplay(post.author).name,
      body: post.body,
    });
    setTimeout(() => {
      const el = document.getElementById('reply-box');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const openReport = (targetType, targetId) => {
    setReportTarget({ type: targetType, id: targetId });
    setReportOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!isAuthed || !thread) return;
    if (!replyBody.trim()) return;
    setReplyBusy(true);
    const { data, error } = await createPost({
      threadId: thread.id,
      authorId: user.id,
      body: replyBody.trim(),
      quotedPostId: quoteTarget?.postId || null,
    });
    setReplyBusy(false);
    if (error || !data) {
      alert('Could not post reply: ' + (error?.message || 'unknown error'));
      return;
    }
    setPosts((ps) => [...ps, data]);
    setThread((t) => t ? { ...t, reply_count: (t.reply_count || 0) + 1, last_reply_at: new Date().toISOString() } : t);
    setReplyBody('');
    setQuoteTarget(null);
  };

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: 'Forums', to: '/forums' },
  ];
  if (category && group) {
    crumbs.push({ label: group.name });
    crumbs.push({ label: category.name, to: '/forums/category/' + category.id });
  }
  crumbs.push({ label: thread?.title || 'Thread' });

  const backTo = category ? '/forums/category/' + category.id : '/forums';
  const backLabel = category ? 'Back to ' + category.name : 'Back to Forums';

  return (
    <>
      <PageBack backTo={backTo} backLabel={backLabel} crumbs={crumbs} />

      <div className="ft-wrap">
        <div>
          {loading && <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading thread…</div>}
          {!loading && !thread && (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
              Thread not found. <Link to="/forums">Back to Forums →</Link>
            </div>
          )}
          {thread && (
            <>
              <ThreadHeader
                thread={thread}
                category={category}
                hasUpvoted={threadUpvoted}
                onUpvote={handleThreadUpvote}
                onReport={() => openReport('thread', thread.id)}
                onReply={() => {
                  const el = document.getElementById('reply-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              <div className="posts">
                {enrichedPosts.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                    No replies yet. Be the first to respond.
                  </div>
                )}
                {enrichedPosts.map((p, idx) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    index={idx}
                    isOp={thread.author_id && p.author?.id === thread.author_id}
                    isAccepted={thread.accepted_post_id === p.id}
                    hasUpvoted={postUpvotedSet.has(p.id)}
                    onUpvote={() => handlePostUpvote(p.id)}
                    onQuote={() => handleQuote(p)}
                    onReport={() => openReport('post', p.id)}
                  />
                ))}
              </div>

              <ReplyBox
                value={replyBody}
                onChange={setReplyBody}
                onSubmit={handleSubmitReply}
                busy={replyBusy}
                disabled={replyBusy}
                signedIn={isAuthed}
                quoteSnippet={quoteTarget}
                onCancelQuote={() => setQuoteTarget(null)}
              />
            </>
          )}
        </div>

        <aside className="sidebar">
          <div className="rs-card">
            <div className="rs-header">About this category</div>
            <div className="rs-body">
              {category ? (
                <>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                    <Link to={'/forums/category/' + category.id} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {category.name}
                    </Link>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {category.description}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Discussion</div>
              )}
            </div>
          </div>

          {profile && (
            <div className="rs-card">
              <div className="rs-header">You</div>
              <div className="rs-body" style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>{profile.full_name || profile.username}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{profile.reputation || 0} rep · {profile.post_count || 0} posts</div>
                <Link to={'/profile/' + profile.username} style={{ display: 'inline-block', marginTop: 8, color: 'var(--wood-warm)', fontSize: 12 }}>
                  View your profile →
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType={reportTarget?.type}
        targetId={reportTarget?.id}
      />
    </>
  );
}

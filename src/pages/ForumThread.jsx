import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/forumThread.css';
import PageBack from '../components/shared/PageBack.jsx';
import ReportModal from '../components/shared/ReportModal.jsx';
import RichReplyBox from '../components/forums/RichReplyBox.jsx';
import ThreadModToolbar from '../components/forums/ThreadModToolbar.jsx';
import { recordForumRecent } from '../components/forums/ForumsLeftSidebar.jsx';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';
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
  isSubscribed,
  toggleSubscription,
} from '../lib/forumDb.js';

function findCategoryMeta(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return { category: cat, group: g };
  }
  return { category: null, group: null };
}

function authorDisplay(author) {
  if (!author) {
    return {
      handle: 'community', name: 'Community', initials: 'GH',
      trade: '', reputation: 0, location: '', postCount: 0,
      joinDate: null, avatarUrl: null,
    };
  }
  const name = author.full_name || author.username || 'Member';
  const handle = author.username || 'member';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'GH';
  return {
    handle, name, initials,
    trade:      author.trade      || '',
    reputation: author.reputation || 0,
    location:   author.location   || '',
    postCount:  author.post_count || 0,
    joinDate:   author.joined_at  || author.created_at || null,
    avatarUrl:  author.avatar_url || null,
  };
}

/* Format a join date as "Join Date: Sep 2013" — short month + year. */
function formatJoinDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch (_) { return ''; }
}

/* Reputation bar: 5 segments, fills based on log scale so a user
   with 50 rep shows ~half-filled and 5000+ rep shows fully filled.
   Avoids the "endless empty bar" problem of linear scaling. */
function repBarSegments(rep) {
  const score = Math.max(0, Math.log10((rep || 0) + 1) / Math.log10(5001));
  const filled = Math.min(5, Math.round(score * 5));
  return { filled, total: 5 };
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

function AuthorCard({ author, voteCount, hasUpvoted, onUpvote }) {
  const a = authorDisplay(author);
  const join = formatJoinDate(a.joinDate);
  const rep = repBarSegments(a.reputation);
  return (
    <div className="user-col">
      {/* Compact upvote pinned to the top-left corner. */}
      {onUpvote && (
        <div className="user-vote">
          <button
            type="button"
            className={'vote-btn ' + (hasUpvoted ? 'voted' : '')}
            onClick={onUpvote}
            aria-label="Upvote"
            title={hasUpvoted ? 'Remove upvote' : 'Upvote'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
          <div className="vote-count">{voteCount || 0}</div>
        </div>
      )}
      <Link to={'/profile/' + a.handle} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="user-name">{a.name}</div>
      </Link>
      <Link
        to={'/profile/' + a.handle}
        className="user-avatar av-a"
        style={{
          textDecoration: 'none',
          backgroundImage: a.avatarUrl ? 'url(' + a.avatarUrl + ')' : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-label={a.name + ' profile'}
      >
        {!a.avatarUrl && a.initials}
      </Link>
      {a.trade && <div className="user-title">{a.trade}</div>}

      <ul className="user-stats">
        {join       && <li><span>Join Date:</span> <strong>{join}</strong></li>}
        {a.location && <li><span>Location:</span> <strong>{a.location}</strong></li>}
        <li><span>Posts:</span> <strong>{a.postCount.toLocaleString()}</strong></li>
      </ul>

      <div className="user-rep-row" title={a.reputation.toLocaleString() + ' reputation'}>
        <span className="user-rep-label">Rep</span>
        <div className="user-rep-bar" aria-label={'Reputation ' + a.reputation}>
          {Array.from({ length: rep.total }).map((_, i) => (
            <span key={i} className={'user-rep-seg ' + (i < rep.filled ? 'on' : '')} />
          ))}
        </div>
        <span className="user-rep-num">{a.reputation.toLocaleString()}</span>
      </div>
    </div>
  );
}

function PostCard({ post, index, isOp, isAccepted, hasUpvoted, onUpvote, onQuote, onReport }) {
  const quoted = post.quoted_post_id && post.__quoted
    ? { author: authorDisplay(post.__quoted.author), body: post.__quoted.body }
    : null;

  return (
    <div className={'post ' + (isOp ? 'op ' : '') + (isAccepted ? 'best' : '')}>
      <div className="post-inner">

        <AuthorCard
          author={post.author}
          voteCount={post.upvote_count || 0}
          hasUpvoted={hasUpvoted}
          onUpvote={onUpvote}
        />

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

          <div className="post-text post-text-md">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    loading="lazy"
                    style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                ),
              }}
            >
              {post.body || ''}
            </ReactMarkdown>
          </div>

          <div className="post-footer">
            <button type="button" className="post-action" onClick={onQuote}>“ Quote</button>
            <button type="button" className="post-action" onClick={onUpvote}>{hasUpvoted ? 'Liked' : 'Like'}</button>
            <div className="post-footer-spacer" />
            <span className="post-report" onClick={onReport}>⚑ Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadHeader({ thread, category, hasUpvoted, onUpvote, onReport, onReply, subscribed, onToggleSubscribe, subscribeBusy }) {
  if (!thread) return null;
  return (
    <div className="thread-header">
      <div className="thread-tags">
        {category && <span className="tag tag-cat">{category.name}</span>}
        {thread.is_pinned && <span className="tag tag-solved">Pinned</span>}
        {thread.is_solved && <span className="tag tag-solved">✓ Solved</span>}
        {(thread.view_count || 0) > 1000 && <span className="tag tag-hot">Hot</span>}
      </div>
      <h1 className="thread-title">{thread.title}</h1>
      <div className="thread-meta">
        <div className="thread-meta-item">{thread.view_count || 0} views</div>
        <div className="thread-meta-item">{thread.reply_count || 0} replies</div>
        <div className="thread-meta-item">{thread.upvote_count || 0} upvotes</div>
        <div className="thread-meta-item">last reply {timeAgo(thread.last_reply_at)}</div>
      </div>
      <div className="thread-actions">
        <button type="button" className="act-btn primary" onClick={onReply}>Reply</button>
        <button type="button" className={'act-btn ' + (hasUpvoted ? 'primary' : '')} onClick={onUpvote}>
          {hasUpvoted ? 'Upvoted' : 'Upvote thread'}
        </button>
        <button
          type="button"
          className={'act-btn ' + (subscribed ? 'primary' : '')}
          onClick={onToggleSubscribe}
          disabled={subscribeBusy}
          title={subscribed ? 'Stop tracking this thread' : 'Get notified about new replies'}
        >
          {subscribed ? '🔖 Subscribed' : '🔖 Subscribe'}
        </button>
        <button type="button" className="act-btn" onClick={onReport}>⚑ Report</button>
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

  const [subscribed, setSubscribed] = useState(false);
  const [subscribeBusy, setSubscribeBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data: t, error } = await fetchThreadBySlug(slug);
      if (cancelled) return;
      if (error) { setLoadError(error); setThread(null); setLoading(false); return; }
      if (!t) { setThread(null); setLoading(false); return; }
      setThread(t);
      incrementThreadViews(t.id).catch(() => null);
      // Track in the left-sidebar "Recent" list.
      recordForumRecent({ slug: t.slug, title: t.title });

      const { data: p } = await fetchThreadPosts(t.id);
      if (cancelled) return;
      setPosts(p);

      if (user?.id) {
        const up = await hasUpvotedThread(t.id, user.id);
        if (!cancelled) setThreadUpvoted(up);
        const postUpvotes = await fetchUserPostUpvotes(p.map((x) => x.id), user.id);
        if (!cancelled) setPostUpvotedSet(postUpvotes);
        const sub = await isSubscribed(t.id, user.id);
        if (!cancelled) setSubscribed(sub);
      } else {
        if (!cancelled) setSubscribed(false);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, user?.id]);

  const handleToggleSubscribe = async () => {
    if (!isAuthed) { navigate('/login'); return; }
    if (!thread || subscribeBusy) return;
    setSubscribeBusy(true);
    const prev = subscribed;
    setSubscribed(!prev);
    const { subscribed: now, error } = await toggleSubscription(thread.id, user.id);
    if (error) {
      setSubscribed(prev);
      alert('Could not update subscription: ' + (error.message || 'unknown error'));
    } else {
      setSubscribed(now);
    }
    setSubscribeBusy(false);
  };

  const { category, group } = findCategoryMeta(thread?.category_id);

  const enrichedPosts = useMemo(() => {
    const byId = {};
    posts.forEach((p) => { byId[p.id] = p; });
    return posts.map((p) => (p.quoted_post_id ? { ...p, __quoted: byId[p.quoted_post_id] } : p));
  }, [posts]);

  const handleThreadUpvote = async () => {
    if (!isAuthed) { navigate('/login'); return; }
    if (!thread) return;
    setThreadUpvoted((v) => !v);
    setThread((t) => t ? { ...t, upvote_count: (t.upvote_count || 0) + (threadUpvoted ? -1 : 1) } : t);
    const { error } = await toggleThreadUpvote(thread.id, user.id);
    if (error) {
      setThreadUpvoted((v) => !v);
      setThread((t) => t ? { ...t, upvote_count: (t.upvote_count || 0) + (threadUpvoted ? 1 : -1) } : t);
    }
  };

  const handlePostUpvote = async (postId) => {
    if (!isAuthed) { navigate('/login'); return; }
    const wasUpvoted = postUpvotedSet.has(postId);
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
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Thread not found
              </div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                No row in <code>forum_threads</code> matched slug: <code style={{ background: 'var(--wood-cream)', padding: '1px 6px', borderRadius: 4 }}>{slug}</code>
              </div>
              {loadError && (
                <div style={{ fontSize: 12, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: 10 }}>
                  DB error: {loadError.message || String(loadError)}
                  {loadError.code ? ' (code ' + loadError.code + ')' : ''}
                </div>
              )}
              <div style={{ fontSize: 12 }}>
                Likely cause: the <code>migration-forum-system.sql</code> hasn't been run yet, or RLS is blocking reads. {' '}
                <Link to="/forums" style={{ color: 'var(--wood-warm)' }}>Back to Forums →</Link>
              </div>
            </div>
          )}
          {thread && (
            <>
              <ThreadModToolbar
                thread={thread}
                onChange={(patch) => setThread((t) => (t ? { ...t, ...patch } : t))}
              />
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
                subscribed={subscribed}
                onToggleSubscribe={handleToggleSubscribe}
                subscribeBusy={subscribeBusy}
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

              <RichReplyBox
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
          <SponsorSidebar />
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

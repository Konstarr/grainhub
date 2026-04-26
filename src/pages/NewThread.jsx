import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
// Lazy so the TipTap editor bundle (~300KB) only ships when this
// composer page is actually opened, not on every initial site load.
const RichReplyBox = lazy(() => import('../components/forums/RichReplyBox.jsx'));

const EditorFallback = (
  <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: 13 }}>
    Loading editor...
  </div>
);
import ForumSearchBar from '../components/forums/ForumSearchBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FORUM_GROUPS } from '../data/forumsData.js';
import { createThread } from '../lib/forumDb.js';
import { checkFields } from '../lib/wordFilter.js';
import { logFilterViolation } from '../lib/forumAdminDb.js';
import { listTopicsForCategory, setThreadTopic } from '../lib/forumTopicsDb.js';
import '../styles/newThread.css';

/**
 * Full-screen "Start a new thread" composer.
 * - Title (required)
 * - Category (grouped dropdown)
 * - Body (RichReplyBox with markdown, emoji, file upload)
 * - Publish to inserts into forum_threads + opening post, then navigates to
 *   the new thread.
 */
export default function NewThread() {
  const { user, profile, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select a category if one was passed via ?category=... from the
  // category page "Start a thread" button.
  const prefillCategory = searchParams.get('category') || '';
  const prefillTopic = searchParams.get('topic') || '';

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(prefillCategory);
  const [topicId, setTopicId] = useState(prefillTopic);
  const [topicOptions, setTopicOptions] = useState([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!categoryId) { setTopicOptions([]); return; }
    (async () => {
      const { data } = await listTopicsForCategory(categoryId);
      if (!cancelled) setTopicOptions(data || []);
    })();
    return () => { cancelled = true; };
  }, [categoryId]);

  const categoryOptions = useMemo(() => {
    const opts = [];
    FORUM_GROUPS.forEach((g) => {
      g.categories.forEach((c) => {
        opts.push({ id: c.id, group: g.name, name: c.name, icon: c.icon });
      });
    });
    return opts;
  }, []);

  const canSubmit =
    isAuthed &&
    title.trim().length >= 6 &&
    categoryId &&
    body.trim().length >= 10 &&
    !busy;

  const submit = async () => {
    if (!canSubmit) return;
    // Word-filter check before hitting the network
    const filterResult = checkFields([title, body]);
    if (!filterResult.ok) {
      setErr('Your thread contains language we do not allow on Millwork.io. Please remove it and try again.');
      // Log fire-and-forget so admins see it in /admin/forums/log
      logFilterViolation('thread', title + '\n\n' + body).catch(() => {});
      return;
    }
    setBusy(true);
    setErr(null);
    const { data, error } = await createThread({
      authorId: user.id,
      categoryId,
      title,
      body,
    });
    if (error || !data?.thread) {
      setBusy(false);
      const msg = error?.message || 'Could not create thread';
      setErr(msg);
      if (/blocked_language/i.test(msg)) {
        logFilterViolation('thread', title + '\n\n' + body).catch(() => {});
      }
      return;
    }
    if (topicId) {
      await setThreadTopic(data.thread.id, topicId).catch(() => null);
    }
    setBusy(false);
    navigate('/forums/thread/' + data.thread.slug);
  };

  if (!isAuthed) {
    return (
      <>
        <PageBack backTo="/forums" backLabel="Back to Forums" />
        <div className="nt-wrap">
          <div className="nt-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h1 className="nt-title">Sign in to start a thread</h1>
            <p className="nt-subtitle">
              Members can post questions, share builds, and get help from the community.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <Link to="/login" className="act-btn primary">Sign in</Link>
              <Link to="/signup" className="act-btn">Create an account</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBack
        backTo="/forums"
        backLabel="Back to Forums"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: 'New Thread' },
        ]}
      />

      <div className="nt-wrap">
        <header className="nt-header">
          <div className="nt-eyebrow">Start a new discussion</div>
          <h1 className="nt-title">What&apos;s on your mind?</h1>
          <p className="nt-subtitle">
            Be specific. Clear titles and useful details get better answers faster.
          </p>
        </header>

        <div className="nt-search">
          <div className="nt-search-title">
            <span aria-hidden="true">🔎</span> Has someone already asked this?
          </div>
          <ForumSearchBar size="lg" placeholder="Search existing threads first..." />
        </div>

        <div className="nt-guidelines">
          <div className="nt-guidelines-title">
            <span aria-hidden="true">📋</span> Posting guidelines
          </div>
          <ul className="nt-guidelines-list">
            <li><strong>Search first.</strong> A duplicate thread fragments the answer and may be closed.</li>
            <li><strong>Pick the right category</strong> so the people who know find your post.</li>
            <li><strong>Be specific.</strong> Include species, sizes, brands, photos, and what you&apos;ve already tried.</li>
            <li><strong>Be respectful.</strong> No personal attacks, slurs, or harassment - staff moderate.</li>
            <li><strong>No spam, doxxing, or off-topic ads.</strong> Sponsorships have their own program.</li>
            <li><strong>Mark answers as solved</strong> when your question is resolved - it helps the next person.</li>
          </ul>
        </div>

        <div className="nt-card">
          <label className="nt-field">
            <span className="nt-label">Title</span>
            <input
              type="text"
              className="nt-input"
              placeholder='e.g. Best dust collection hose for an 18" planer?'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
            />
            <span className="nt-hint">
              {title.length}/180 - A good title is a short, specific question.
            </span>
          </label>

          <label className="nt-field">
            <span className="nt-label">Category</span>
            <select
              className="nt-select"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setTopicId(''); }}
            >
              <option value="">Pick a category...</option>
              {FORUM_GROUPS.map((g) => (
                <optgroup key={g.id} label={g.name}>
                  {g.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? c.icon + ' ' : ''}{c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {topicOptions.length > 0 && (
            <label className="nt-field">
              <span className="nt-label">Topic <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></span>
              <select
                className="nt-select"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">No specific topic</option>
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon ? t.icon + ' ' : ''}{t.name}{t.is_official ? ' (official)' : ''}
                  </option>
                ))}
              </select>
              <span className="nt-hint">
                File this thread under a specific product or vendor topic so the right people see it.
              </span>
            </label>
          )}

          <div className="nt-field">
            <span className="nt-label">Body</span>
            <Suspense fallback={EditorFallback}>
              <RichReplyBox
                value={body}
                onChange={setBody}
                onSubmit={submit}
                busy={busy}
                disabled={busy}
                signedIn={true}
                quoteSnippet={null}
                onCancelQuote={() => null}
              />
            </Suspense>
          </div>

          {err && (
            <div className="nt-error">
              {err}
            </div>
          )}

          <div className="nt-footer">
            <div className="nt-tips">
              <strong>Tips:</strong> include what you&apos;ve tried, photos, measurements, and the outcome you want.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/forums" className="act-btn">Cancel</Link>
              <button
                type="button"
                className="act-btn primary"
                onClick={submit}
                disabled={!canSubmit}
                title={canSubmit ? 'Publish thread' : 'Fill in title, category, and body (min 10 chars)'}
              >
                {busy ? 'Publishing...' : 'Publish thread'}
              </button>
            </div>
          </div>

          {profile && (
            <div className="nt-postingas">
              Posting as <strong>{profile.full_name || profile.username}</strong>
              {profile.trade ? ' - ' + profile.trade : ''}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

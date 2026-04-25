import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import RichReplyBox from '../components/forums/RichReplyBox.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FORUM_GROUPS } from '../data/forumsData.js';
import { createThread } from '../lib/forumDb.js';
import { checkFields } from '../lib/wordFilter.js';
import { logFilterViolation } from '../lib/forumAdminDb.js';
import '../styles/newThread.css';

/**
 * Full-screen "Start a new thread" composer.
 * - Title (required)
 * - Category (grouped dropdown)
 * - Body (RichReplyBox with markdown, emoji, file upload)
 * - Publish → inserts into forum_threads + opening post, then navigates to
 *   the new thread.
 */
export default function NewThread() {
  const { user, profile, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select a category if one was passed via ?category=... from the
  // category page "Start a thread" button.
  const prefillCategory = searchParams.get('category') || '';

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(prefillCategory);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

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
      setErr('Your thread contains language we don\'t allow on GrainHub. Please remove it and try again.');
      // Log fire-and-forget so admins see it in /admin/forums/log
      logFilterViolation('thread', `${title}\n\n${body}`).catch(() => {});
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
    setBusy(false);
    if (error || !data?.thread) {
      const msg = error?.message || 'Could not create thread';
      setErr(msg);
      // Server-side filter / rate-limit rejections are logged here.
      if (/blocked_language/i.test(msg)) {
        logFilterViolation('thread', `${title}\n\n${body}`).catch(() => {});
      }
      return;
    }
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

        <div className="nt-card">
          <label className="nt-field">
            <span className="nt-label">Title</span>
            <input
              type="text"
              className="nt-input"
              placeholder="e.g. Best dust collection hose for an 18&quot; planer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
            />
            <span className="nt-hint">
              {title.length}/180 · A good title is a short, specific question.
            </span>
          </label>

          <label className="nt-field">
            <span className="nt-label">Category</span>
            <select
              className="nt-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Pick a category…</option>
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

          <div className="nt-field">
            <span className="nt-label">Body</span>
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
                {busy ? 'Publishing…' : 'Publish thread'}
              </button>
            </div>
          </div>

          {profile && (
            <div className="nt-postingas">
              Posting as <strong>{profile.full_name || profile.username}</strong>
              {profile.trade ? ' · ' + profile.trade : ''}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

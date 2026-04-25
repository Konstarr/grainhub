import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { updatePost } from '../../lib/forumDb.js';
import { checkText } from '../../lib/wordFilter.js';

/**
 * Self-contained edit-or-display switch for a forum post body.
 * Encapsulates the textarea + save/cancel state so PostCard stays
 * tiny.
 *
 * Props:
 *   post     — { id, body, created_at, updated_at }
 *   canEdit  — boolean, true when the viewer is the author
 *   onUpdate — callback fired with the patched fields ({body, updated_at})
 *              after a successful save, so the caller can patch local
 *              post state.
 */
export default function EditablePostBody({ post, canEdit, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // updated_at differs from created_at when the post has been edited.
  // The DB trigger `forum_posts_touch` keeps these in sync on every
  // UPDATE; on INSERT they're identical down to the second.
  const wasEdited =
    post.updated_at &&
    post.created_at &&
    Math.abs(new Date(post.updated_at).getTime() - new Date(post.created_at).getTime()) > 1500;

  const handleSave = async () => {
    if (!draft.trim()) {
      setErr('Post can\'t be empty.');
      return;
    }
    if (!checkText(draft).ok) {
      setErr('Your edit contains language we don\'t allow on GrainHub.');
      return;
    }
    setBusy(true);
    setErr(null);
    const { data, error } = await updatePost(post.id, draft);
    setBusy(false);
    if (error) {
      setErr(error.message || 'Could not save the edit.');
      return;
    }
    onUpdate?.({ body: data.body, updated_at: data.updated_at });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(post.body || '');
    setEditing(false);
    setErr(null);
  };

  if (editing) {
    return (
      <div className="post-edit-shell">
        <textarea
          className="post-edit-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={Math.min(20, Math.max(6, (draft.match(/\n/g) || []).length + 4))}
          maxLength={20000}
          autoFocus
          disabled={busy}
        />
        {err && <div className="post-edit-err">{err}</div>}
        <div className="post-edit-actions">
          <button
            type="button"
            className="post-edit-cancel"
            onClick={handleCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="post-edit-save"
            onClick={handleSave}
            disabled={busy || !draft.trim()}
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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

      {/* "Edited" footer + Edit button row. Author-only — gated by
          canEdit. The footer renders for everyone if wasEdited. */}
      {(wasEdited || canEdit) && (
        <div className="post-edit-meta">
          {wasEdited && (
            <span className="post-edited-label" title={new Date(post.updated_at).toLocaleString()}>
              ✎ Edited {formatEditedTime(post.updated_at)}
            </span>
          )}
          {canEdit && (
            <button
              type="button"
              className="post-edit-btn"
              onClick={() => { setDraft(post.body || ''); setEditing(true); }}
            >
              Edit
            </button>
          )}
        </div>
      )}
    </>
  );
}

function formatEditedTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return min + 'm ago';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h ago';
  const day = Math.floor(hr / 24);
  if (day < 30) return day + 'd ago';
  return d.toLocaleDateString();
}

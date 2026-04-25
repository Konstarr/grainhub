import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  setThreadLocked,
  setThreadPinned,
  setThreadSolved,
  setThreadCategory,
  deleteThread,
} from '../../lib/forumAdminDb.js';
import { FORUM_GROUPS } from '../../data/forumsData.js';

/**
 * Inline moderation toolbar shown on /forums/thread/:slug to staff
 * (moderator / admin / owner). Bypasses the admin panel entirely so
 * mods can act on a thread while reading it.
 *
 * Props:
 *   thread         — the current thread row (id, is_locked, is_pinned, is_solved)
 *   onChange       — callback fired after a successful action with
 *                    the patched fields. Caller patches local state.
 */
export default function ThreadModToolbar({ thread, onChange }) {
  const { isModerator } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [err,  setErr]  = useState(null);

  if (!isModerator || !thread) return null;

  const run = async (action, fn, patch) => {
    setBusy(action);
    setErr(null);
    const { error } = await fn();
    setBusy(null);
    if (error) {
      setErr(error.message || 'Action failed.');
      return;
    }
    onChange?.(patch);
  };

  const handleDelete = async () => {
    if (!window.confirm(
      `Permanently delete "${thread.title}"?\n\nThis cascades to every reply on the thread. This cannot be undone.`,
    )) return;
    setBusy('delete');
    setErr(null);
    const { error } = await deleteThread(thread.id);
    setBusy(null);
    if (error) {
      setErr(error.message || 'Could not delete thread.');
      return;
    }
    // Drop the user back at the forums index since the thread is gone.
    navigate('/forums', { replace: true });
  };

  const handleMove = async (e) => {
    const newCategoryId = e.target.value;
    if (!newCategoryId || newCategoryId === thread.category_id) return;
    const target = findCategoryName(newCategoryId);
    if (!window.confirm(
      `Move "${thread.title}" to "${target}"?`,
    )) {
      // Reset the select back to the current value
      e.target.value = thread.category_id;
      return;
    }
    setBusy('move');
    setErr(null);
    const { error } = await setThreadCategory(thread.id, newCategoryId);
    setBusy(null);
    if (error) {
      setErr(error.message || 'Could not move thread.');
      e.target.value = thread.category_id;
      return;
    }
    onChange?.({ category_id: newCategoryId });
  };

  return (
    <div className="thread-mod-toolbar">
      <span className="thread-mod-label">
        <span aria-hidden="true">🛡</span> Moderator tools
      </span>
      <div className="thread-mod-actions">
        <ModBtn
          busy={busy === 'lock'}
          onClick={() => run(
            'lock',
            () => setThreadLocked(thread.id, !thread.is_locked),
            { is_locked: !thread.is_locked },
          )}
        >
          {thread.is_locked ? 'Unlock' : 'Lock'}
        </ModBtn>
        <ModBtn
          busy={busy === 'pin'}
          onClick={() => run(
            'pin',
            () => setThreadPinned(thread.id, !thread.is_pinned),
            { is_pinned: !thread.is_pinned },
          )}
        >
          {thread.is_pinned ? 'Unpin' : 'Pin'}
        </ModBtn>
        <ModBtn
          busy={busy === 'solved'}
          onClick={() => run(
            'solved',
            () => setThreadSolved(thread.id, !thread.is_solved),
            { is_solved: !thread.is_solved },
          )}
        >
          {thread.is_solved ? 'Mark unsolved' : 'Mark solved'}
        </ModBtn>
        <ModBtn
          busy={busy === 'delete'}
          danger
          onClick={handleDelete}
        >
          Delete thread
        </ModBtn>

        {/* Move-to-category dropdown. Grouped by FORUM_GROUPS so
            the option list mirrors the sidebar taxonomy. The
            current category is preselected; picking a different
            one fires handleMove(). */}
        <select
          className="thread-mod-select"
          value={thread.category_id || ''}
          onChange={handleMove}
          disabled={busy === 'move'}
          aria-label="Move thread to category"
        >
          <option value="" disabled>
            {busy === 'move' ? 'Moving…' : 'Move to category…'}
          </option>
          {FORUM_GROUPS.map((g) => (
            <optgroup key={g.id} label={g.name}>
              {(g.categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {err && <div className="thread-mod-err">{err}</div>}
    </div>
  );
}

/** Look up the display name for a category id across FORUM_GROUPS. */
function findCategoryName(categoryId) {
  for (const g of FORUM_GROUPS) {
    for (const c of (g.categories || [])) {
      if (c.id === categoryId) return c.name;
    }
  }
  return categoryId;
}

function ModBtn({ children, onClick, busy, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={'thread-mod-btn ' + (danger ? 'thread-mod-btn-danger' : '')}
    >
      {busy ? '…' : children}
    </button>
  );
}

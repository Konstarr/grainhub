import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  setThreadLocked,
  setThreadPinned,
  setThreadSolved,
  deleteThread,
} from '../../lib/forumAdminDb.js';

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
      </div>
      {err && <div className="thread-mod-err">{err}</div>}
    </div>
  );
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

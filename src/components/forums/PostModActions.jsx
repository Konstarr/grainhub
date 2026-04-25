import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { softDeletePost, restorePost } from '../../lib/forumAdminDb.js';

/**
 * Inline mod actions for an individual forum post, rendered next to
 * Quote / Like / Report. Shown only to staff (moderator+).
 *
 * Soft-delete sets is_deleted=true so the body persists in the DB
 * for audit but is hidden from public view. Restore flips it back.
 *
 * Props:
 *   post     — { id, is_deleted }
 *   onChange — callback with patch ({ is_deleted: bool }) on success
 */
export default function PostModActions({ post, onChange }) {
  const { isModerator } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!isModerator || !post) return null;

  const handleToggle = async () => {
    if (post.is_deleted) {
      setBusy(true);
      const { error } = await restorePost(post.id);
      setBusy(false);
      if (error) {
        // eslint-disable-next-line no-alert
        alert('Could not restore post: ' + (error.message || 'unknown error'));
        return;
      }
      onChange?.({ is_deleted: false });
      return;
    }
    if (!window.confirm('Soft-delete this post? Body stays in the DB for audit but will be hidden from public view.')) return;
    setBusy(true);
    const { error } = await softDeletePost(post.id);
    setBusy(false);
    if (error) {
      // eslint-disable-next-line no-alert
      alert('Could not delete post: ' + (error.message || 'unknown error'));
      return;
    }
    onChange?.({ is_deleted: true });
  };

  return (
    <button
      type="button"
      className="post-mod-btn"
      onClick={handleToggle}
      disabled={busy}
      title={post.is_deleted ? 'Restore post' : 'Soft-delete post (mod)'}
    >
      {busy ? '…' : post.is_deleted ? '↺ Restore' : '🛡 Delete'}
    </button>
  );
}

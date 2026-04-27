import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import {
  fetchMyNotifications,
  fetchMyUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeMyNotifications,
} from '../../lib/notificationsDb.js';

const ICON_BY_KIND = {
  thread_reply:       '💬',
  subscribed_reply:   '🔔',
  community_post:     '📣',
  connection_request: '🤝',
  dm:                 '✉️',
};

function timeAgo(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return 'just now';
  if (ms < 60 * 60 * 1000) return Math.floor(ms / 60000) + 'm';
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  // Initial unread count + a polling fallback in case realtime drops.
  useEffect(() => {
    if (!userId) { setUnread(0); setItems([]); return; }
    let cancelled = false;
    const tick = async () => {
      const n = await fetchMyUnreadNotificationCount();
      if (!cancelled) setUnread(n);
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [userId]);

  // Realtime: bump unread + prepend the row to the dropdown list.
  useEffect(() => {
    if (!userId) return undefined;
    const channel = subscribeMyNotifications(userId, (row) => {
      setUnread((n) => n + 1);
      setItems((prev) => [row, ...prev].slice(0, 30));
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [userId]);

  // Fetch the panel contents the first time it opens (and refresh on each open).
  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await fetchMyNotifications(30);
      if (!cancelled) {
        setItems(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, userId]);

  // Click-outside / Escape close.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleItemClick = async (n) => {
    setOpen(false);
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
      markNotificationRead(n.id);
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
    await markAllNotificationsRead();
  };

  if (!userId) return null;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="nav-bell-btn"
      >
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>
        {unread > 0 && (
          <span className="nav-bell-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="nav-bell-panel"
        >
          <div className="nav-bell-header">
            <span style={{ fontWeight: 600 }}>Notifications</span>
            <button
              type="button"
              className="nav-bell-mark-all"
              onClick={handleMarkAllRead}
              disabled={unread === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="nav-bell-body">
            {loading && items.length === 0 && (
              <div className="nav-bell-empty">Loading…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="nav-bell-empty">No notifications yet.</div>
            )}
            {items.map((n) => (
              <button
                type="button"
                key={n.id}
                className={'nav-bell-item' + (n.is_read ? '' : ' unread')}
                onClick={() => handleItemClick(n)}
              >
                <span className="nav-bell-icon" aria-hidden="true">
                  {ICON_BY_KIND[n.kind] || '🔔'}
                </span>
                <span className="nav-bell-text">
                  <span className="nav-bell-title">{n.title || 'Notification'}</span>
                  {n.body && <span className="nav-bell-snippet">{n.body}</span>}
                  <span className="nav-bell-time">{timeAgo(n.created_at)}</span>
                </span>
                {!n.is_read && <span className="nav-bell-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

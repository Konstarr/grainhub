import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
} from '../lib/messagingDb.js';
import '../styles/messaging.css';

const POLL_MS = 8000;

function initials(p) {
  const name = p?.business_name || p?.full_name || p?.username || '??';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
function displayName(p) { return p?.business_name || p?.full_name || p?.username || 'Unknown'; }

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
function formatDayDivider(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function MessageThread() {
  const { id } = useParams();
  const { user } = useAuth();

  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const loadAll = async () => {
    if (!id || !user?.id) return;
    const { data: c, error: cErr } = await getConversation(id, user.id);
    if (cErr || !c) { setError(cErr?.message || 'Conversation not found'); setLoading(false); return; }
    setConv(c);
    const { data: m } = await fetchMessages(id, { limit: 200 });
    setMessages(m || []);
    setLoading(false);
    // Mark incoming messages as read
    markConversationRead(id, user.id).catch(() => null);
  };

  // Initial + on-focus load
  useEffect(() => {
    setLoading(true);
    loadAll();
    const onFocus = () => loadAll();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line
  }, [id, user?.id]);

  // Poll for new messages while the tab is open
  useEffect(() => {
    if (!id || !user?.id) return;
    let cancelled = false;
    const tick = setInterval(async () => {
      const { data, error } = await fetchMessages(id, { limit: 200 });
      if (cancelled || error) return;
      const next = Array.isArray(data) ? data : [];
      setMessages((prev) => {
        // Only update if the newest id changed (avoids re-renders on idle polls)
        const prevLast = prev[prev.length - 1]?.id;
        const nextLast = next[next.length - 1]?.id;
        if (prevLast === nextLast && prev.length === next.length) return prev;
        return next;
      });
    }, POLL_MS);
    return () => { cancelled = true; clearInterval(tick); };
  }, [id, user?.id]);

  // Auto-scroll to bottom when new messages arrive — but ONLY if the
  // user was already near the bottom. If they scrolled up to read old
  // messages, new arrivals shouldn't yank the viewport away from them.
  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || !user?.id || !id || sending) return;
    setSending(true);
    const { data, error } = await sendMessage({ conversationId: id, senderId: user.id, body });
    setSending(false);
    if (error) { alert('Could not send: ' + (error.message || 'unknown')); return; }
    if (data) setMessages((prev) => [...prev, data]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <>
        <PageBack backTo="/messages" backLabel="Back to Messages" />
        <div className="msg-wrap"><div className="msg-empty">Loading…</div></div>
      </>
    );
  }

  if (error || !conv) {
    return (
      <>
        <PageBack backTo="/messages" backLabel="Back to Messages" />
        <div className="msg-wrap">
          <div className="msg-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Conversation not available</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {error || 'This conversation may have been removed or you no longer have access.'}
            </div>
            <div style={{ marginTop: 14 }}>
              <Link to="/messages" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>← Back to Messages</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const other = conv.other;

  // Group messages by day for dividers
  const grouped = [];
  let lastDay = '';
  messages.forEach((m) => {
    const day = formatDayDivider(m.created_at);
    if (day !== lastDay) {
      grouped.push({ divider: day, _id: 'div-' + day });
      lastDay = day;
    }
    grouped.push(m);
  });

  return (
    <>
      <PageBack
        backTo="/messages"
        backLabel="Back to Messages"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Messages', to: '/messages' },
          { label: displayName(other) },
        ]}
      />

      <div className="msg-wrap">
        <div className="chat-shell">
          <div className="chat-header">
            <Link to={'/profile/' + (other?.username || '')} className="msg-avatar" style={{ textDecoration: 'none' }}>
              {other?.avatar_url ? <img src={other.avatar_url} alt="" /> : initials(other)}
            </Link>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="chat-header-name">
                <Link to={'/profile/' + (other?.username || '')} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {displayName(other)}
                </Link>
              </div>
              <div className="chat-header-handle">@{other?.username || 'member'}</div>
            </div>
            {other?.account_type === 'business' && (
              <span style={{ fontSize: 10, color: '#185FA5', background: '#E6F1FB', padding: '2px 9px', borderRadius: 999, fontWeight: 600 }}>
                Business
              </span>
            )}
          </div>

          <div className="chat-stream" ref={streamRef}>
            {grouped.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: 13 }}>
                No messages yet. Say hi — messages are private and only seen by the two of you.
              </div>
            )}
            {grouped.map((m) =>
              m.divider ? (
                <div key={m._id} className="chat-day-divider">{m.divider}</div>
              ) : (
                <div
                  key={m.id}
                  className={'chat-msg ' + (m.sender_id === user.id ? 'me' : 'them')}
                >
                  {m.body}
                  <div className="chat-msg-time">{formatTime(m.created_at)}</div>
                </div>
              )
            )}
          </div>

          <div className="chat-composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
              rows={1}
              maxLength={4000}
            />
            <button
              type="button"
              className="chat-send"
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

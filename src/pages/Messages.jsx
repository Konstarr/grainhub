import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchConversations,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  acceptConnection,
  declineConnection,
  cancelConnection,
  markConversationRead,
} from '../lib/messagingDb.js';
import '../styles/messaging.css';

function initials(person) {
  const name = person?.business_name || person?.full_name || person?.username || '??';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function displayName(person) {
  return person?.business_name || person?.full_name || person?.username || 'Unknown';
}

function timeAgo(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  const d = Math.floor(h / 24);
  if (d < 7) return d + 'd';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * /messages — inbox with three tabs:
 *   Conversations | Requests (inbound) | Sent (outbound pending)
 */
export default function Messages() {
  const { user } = useAuth();
  const [tab, setTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [{ data: convs }, { data: inc }, { data: out }] = await Promise.all([
      fetchConversations(user.id),
      fetchIncomingRequests(user.id),
      fetchOutgoingRequests(user.id),
    ]);
    setConversations(convs || []);
    setIncoming(inc || []);
    setOutgoing(out || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [user?.id]);

  const handleAccept = async (id) => {
    setBusyId(id);
    const { error } = await acceptConnection(id);
    setBusyId(null);
    if (error) { alert('Could not accept: ' + (error.message || 'unknown')); return; }
    load();
  };

  const handleDecline = async (id) => {
    if (!confirm('Decline this request? They won\u2019t be able to re-request for 30 days.')) return;
    setBusyId(id);
    const { error } = await declineConnection(id);
    setBusyId(null);
    if (error) { alert('Could not decline: ' + (error.message || 'unknown')); return; }
    load();
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    setBusyId(id);
    const { error } = await cancelConnection(id);
    setBusyId(null);
    if (error) { alert('Could not cancel: ' + (error.message || 'unknown')); return; }
    load();
  };

  return (
    <>
      <PageBack backTo="/" backLabel="Back" crumbs={[{ label: 'Home', to: '/' }, { label: 'Messages' }]} />

      <div className="msg-wrap">
        <div className="msg-header">
          <h1 className="msg-title">Messages</h1>
          <div className="msg-tabs">
            <button
              type="button"
              className={'msg-tab ' + (tab === 'conversations' ? 'active' : '')}
              onClick={() => setTab('conversations')}
            >
              Conversations
              {conversations.length > 0 && <span className="msg-tab-badge">{conversations.length}</span>}
            </button>
            <button
              type="button"
              className={'msg-tab ' + (tab === 'requests' ? 'active' : '')}
              onClick={() => setTab('requests')}
            >
              Requests
              {incoming.length > 0 && <span className="msg-tab-badge">{incoming.length}</span>}
            </button>
            <button
              type="button"
              className={'msg-tab ' + (tab === 'sent' ? 'active' : '')}
              onClick={() => setTab('sent')}
            >
              Sent
              {outgoing.length > 0 && <span className="msg-tab-badge">{outgoing.length}</span>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="msg-card"><div className="msg-empty">Loading…</div></div>
        ) : tab === 'conversations' ? (
          <div className="msg-card">
            {conversations.length === 0 ? (
              <div className="msg-empty">
                <div style={{ fontSize: 30, marginBottom: 6 }}>💬</div>
                <div>No conversations yet. Connect with someone first — open their profile and hit the Connect button.</div>
              </div>
            ) : (
              conversations.map((c) => {
                const unread = c.last_message_at && c.last_sender_id && c.last_sender_id !== user.id;
                return (
                  <Link
                    key={c.id}
                    to={'/messages/' + c.id}
                    className={'msg-row ' + (unread ? 'unread' : '')}
                    onClick={() => markConversationRead(c.id, user.id)}
                  >
                    <div className="msg-avatar">
                      {c.other?.avatar_url ? <img src={c.other.avatar_url} alt="" /> : initials(c.other)}
                    </div>
                    <div className="msg-row-body">
                      <div className="msg-row-title">
                        {displayName(c.other)}
                        {c.other?.account_type === 'business' && (
                          <span style={{ fontSize: 10, color: '#185FA5', background: '#E6F1FB', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>
                            Business
                          </span>
                        )}
                      </div>
                      <div className="msg-row-handle">@{c.other?.username || 'member'}</div>
                    </div>
                    <div className="msg-row-meta">
                      {timeAgo(c.last_message_at || c.created_at)}
                      {unread && <span className="msg-unread-dot" title="Unread" />}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        ) : tab === 'requests' ? (
          <div className="msg-card">
            {incoming.length === 0 ? (
              <div className="msg-empty">No pending requests.</div>
            ) : (
              incoming.map((r) => (
                <div key={r.id} className="msg-row">
                  <Link to={'/profile/' + (r.requester?.username || '')} className="msg-avatar" style={{ textDecoration: 'none' }}>
                    {r.requester?.avatar_url ? <img src={r.requester.avatar_url} alt="" /> : initials(r.requester)}
                  </Link>
                  <div className="msg-row-body">
                    <Link to={'/profile/' + (r.requester?.username || '')} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="msg-row-title">{displayName(r.requester)}</div>
                      <div className="msg-row-handle">@{r.requester?.username}</div>
                    </Link>
                    <div className="msg-row-preview">Wants to connect · {timeAgo(r.created_at)}</div>
                  </div>
                  <div className="msg-req-actions">
                    <button
                      type="button"
                      className="msg-req-btn accept"
                      onClick={() => handleAccept(r.id)}
                      disabled={busyId === r.id}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="msg-req-btn"
                      onClick={() => handleDecline(r.id)}
                      disabled={busyId === r.id}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="msg-card">
            {outgoing.length === 0 ? (
              <div className="msg-empty">You haven't sent any requests.</div>
            ) : (
              outgoing.map((r) => (
                <div key={r.id} className="msg-row">
                  <Link to={'/profile/' + (r.addressee?.username || '')} className="msg-avatar" style={{ textDecoration: 'none' }}>
                    {r.addressee?.avatar_url ? <img src={r.addressee.avatar_url} alt="" /> : initials(r.addressee)}
                  </Link>
                  <div className="msg-row-body">
                    <Link to={'/profile/' + (r.addressee?.username || '')} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="msg-row-title">{displayName(r.addressee)}</div>
                      <div className="msg-row-handle">@{r.addressee?.username}</div>
                    </Link>
                    <div className="msg-row-preview">Waiting for response · {timeAgo(r.created_at)}</div>
                  </div>
                  <div className="msg-req-actions">
                    <button
                      type="button"
                      className="msg-req-btn"
                      onClick={() => handleCancel(r.id)}
                      disabled={busyId === r.id}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

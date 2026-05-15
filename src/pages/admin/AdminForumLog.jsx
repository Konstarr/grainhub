import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listModerationLog,
  listFilterViolations,
} from '../../lib/forumAdminDb.js';

/**
 * /admin/forums/log — moderation history + filter-violation log.
 *
 * Two tabs:
 *   • Mod actions — populated by triggers on forum_threads /
 *     forum_posts when a moderator/admin locks/pins/solves/deletes.
 *   • Filter violations — populated by the client (via
 *     log_filter_violation RPC) when a user submission is rejected
 *     by the word filter.
 */
export default function AdminForumLog() {
  const [tab, setTab] = useState('actions'); // 'actions' | 'violations'
  const [actions, setActions] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [a, v] = await Promise.all([
        listModerationLog({ limit: 200 }),
        listFilterViolations({ limit: 200 }),
      ]);
      if (cancelled) return;
      setActions(a.data);
      setViolations(v.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout
      title="Moderation log"
      subtitle="Mod actions and filter violations across forums."
      actions={
        <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back to forum mod.
        </Link>
      }
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        <Tab active={tab === 'actions'} onClick={() => setTab('actions')} count={actions.length}>
          Mod actions
        </Tab>
        <Tab active={tab === 'violations'} onClick={() => setTab('violations')} count={violations.length}>
          Filter violations
        </Tab>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : tab === 'actions' ? (
        <ActionsTable rows={actions} />
      ) : (
        <ViolationsTable rows={violations} />
      )}
    </AdminLayout>
  );
}

function Tab({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        background: active ? 'var(--wood-warm)' : 'var(--white)',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: '1px solid ' + (active ? 'var(--wood-warm)' : 'var(--border)'),
        borderRadius: 999,
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        cursor: 'pointer',
      }}
    >
      {children} <span style={{ opacity: 0.7 }}>({count})</span>
    </button>
  );
}

function ActionsTable({ rows }) {
  if (rows.length === 0) {
    return <Empty>No moderation actions yet.</Empty>;
  }
  return (
    <div style={tableShell}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>When</th>
            <th style={th}>Moderator</th>
            <th style={th}>Action</th>
            <th style={th}>Target</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={trBorder}>
              <td style={tdMuted}>{formatTime(r.created_at)}</td>
              <td style={td}>
                {r.actor?.username
                  ? <Link to={'/profile/' + r.actor.username} style={linkStyle}>
                      {r.actor.full_name || '@' + r.actor.username}
                    </Link>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </td>
              <td style={td}><ActionPill action={r.action} /></td>
              <td style={td}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.target_type}</span>{' '}
                {r.summary && <span style={{ color: 'var(--text-primary)' }}>{r.summary}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ViolationsTable({ rows }) {
  if (rows.length === 0) {
    return <Empty>🎉 No filter violations recorded.</Empty>;
  }
  return (
    <div style={tableShell}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>When</th>
            <th style={th}>User</th>
            <th style={th}>Where</th>
            <th style={th}>Matched</th>
            <th style={th}>Attempted text</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={trBorder}>
              <td style={tdMuted}>{formatTime(r.created_at)}</td>
              <td style={td}>
                {r.user?.username
                  ? <Link to={'/profile/' + r.user.username} style={linkStyle}>
                      {r.user.full_name || '@' + r.user.username}
                    </Link>
                  : <span style={{ color: 'var(--text-muted)' }}>anon</span>}
              </td>
              <td style={tdMuted}>{r.target_type}</td>
              <td style={td}>
                {r.matched_word
                  ? <code style={{ background: '#fef2f2', padding: '1px 6px', borderRadius: 4, color: '#991b1b' }}>
                      {r.matched_word}
                    </code>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </td>
              <td style={{ ...td, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.attempted_text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionPill({ action }) {
  const palette = {
    thread_locked:    { bg: '#FEF3F0', fg: '#991b1b' },
    thread_unlocked:  { bg: '#ECF6E4', fg: '#1B4332' },
    thread_pinned:    { bg: '#FDF6E8', fg: '#92551E' },
    thread_unpinned:  { bg: '#F4F4F4', fg: '#666' },
    thread_solved:    { bg: '#ECF6E4', fg: '#1B4332' },
    thread_unsolved:  { bg: '#F4F4F4', fg: '#666' },
    thread_deleted:   { bg: '#FEF3F0', fg: '#991b1b' },
    post_soft_deleted:{ bg: '#FEF3F0', fg: '#991b1b' },
    post_restored:    { bg: '#ECF6E4', fg: '#1B4332' },
  };
  const c = palette[action] || { bg: '#F4F4F4', fg: '#666' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.4,
      fontFamily: 'Montserrat, sans-serif',
    }}>{action.replace(/_/g, ' ')}</span>
  );
}

function Empty({ children }) {
  return (
    <div style={{
      padding: '2rem', textAlign: 'center', color: 'var(--text-muted)',
      background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 10,
    }}>
      {children}
    </div>
  );
}

/* Show real local date + time so admins can correlate with logs.
   Example: "Apr 25, 2026, 2:43 PM". */
function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const tableShell = {
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  overflow: 'hidden',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const theadRow = {
  background: '#FDFBF5',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};
const th = { textAlign: 'left', padding: '0.6rem 0.85rem' };
const td = { padding: '0.6rem 0.85rem', verticalAlign: 'middle' };
const tdMuted = { ...td, color: 'var(--text-muted)', fontSize: 12 };
const trBorder = { borderTop: '1px solid var(--border-light)' };
const linkStyle = { color: 'var(--text-secondary)', textDecoration: 'none' };

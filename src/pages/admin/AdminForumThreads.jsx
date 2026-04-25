import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  listForumThreadsForAdmin,
  setThreadLocked,
  setThreadPinned,
  setThreadSolved,
  deleteThread,
} from '../../lib/forumAdminDb.js';

const PAGE_SIZE = 50;

/**
 * /admin/forums/threads — table of threads with filters and inline
 * mod actions. Pin/lock/solved toggles act in place. Delete confirms.
 */
export default function AdminForumThreads() {
  const [search, setSearch] = useState('');
  const [state,  setState]  = useState('all');
  const [sort,   setSort]   = useState('newest');
  const [page,   setPage]   = useState(0);

  const [rows,    setRows]    = useState([]);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId,  setBusyId]  = useState(null);
  const [err,     setErr]     = useState(null);

  const reload = async () => {
    setLoading(true);
    const { data, count, error } = await listForumThreadsForAdmin({
      search, state, sort, limit: PAGE_SIZE, offset: page * PAGE_SIZE,
    });
    setRows(data);
    setCount(count);
    setErr(error?.message || null);
    setLoading(false);
  };

  // Reload on filter changes (debounce search slightly via a setTimeout).
  useEffect(() => {
    const t = setTimeout(reload, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, state, sort, page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const onAction = async (thread, action) => {
    setBusyId(thread.id);
    setErr(null);
    let result;
    if (action === 'pin')    result = await setThreadPinned(thread.id, !thread.is_pinned);
    if (action === 'lock')   result = await setThreadLocked(thread.id, !thread.is_locked);
    if (action === 'solved') result = await setThreadSolved(thread.id, !thread.is_solved);
    if (action === 'delete') {
      if (!window.confirm(`Permanently delete "${thread.title}"? This cascades to all replies.`)) {
        setBusyId(null);
        return;
      }
      result = await deleteThread(thread.id);
    }
    setBusyId(null);
    if (result?.error) {
      setErr(result.error.message || 'Action failed.');
      return;
    }
    reload();
  };

  return (
    <AdminLayout
      title="Forum threads"
      subtitle="Browse, lock, pin, mark solved, or delete threads."
      actions={
        <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back to forum mod.
        </Link>
      }
    >
      <FilterBar
        search={search} onSearch={(v) => { setPage(0); setSearch(v); }}
        state={state}   onState={(v)  => { setPage(0); setState(v); }}
        sort={sort}     onSort={(v)   => setSort(v)}
      />

      {err && <div className="cart-err" style={{ marginBottom: '1rem' }}>{err}</div>}

      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{
              background: '#FDFBF5',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              <th style={th}>Thread</th>
              <th style={{ ...th, width: 130 }}>Author</th>
              <th style={{ ...th, width: 110 }}>State</th>
              <th style={{ ...th, width: 90, textAlign: 'right' }}>Replies</th>
              <th style={{ ...th, width: 200 }}>Created</th>
              <th style={{ ...th, width: 240 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No threads match these filters.</td></tr>
            ) : (
              rows.map((t) => (
                <ThreadRow
                  key={t.id} thread={t}
                  busy={busyId === t.id}
                  onAction={onAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && count > PAGE_SIZE && (
        <Pager page={page} setPage={setPage} totalPages={totalPages} count={count} />
      )}
    </AdminLayout>
  );
}

function FilterBar({ search, onSearch, state, onState, sort, onSort }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '1rem',
    }}>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by title…"
        style={{
          flex: 1, minWidth: 220,
          padding: '0.55rem 0.85rem',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'inherit',
        }}
      />
      <select value={state} onChange={(e) => onState(e.target.value)} style={selectStyle}>
        <option value="all">All states</option>
        <option value="locked">Locked only</option>
        <option value="pinned">Pinned only</option>
        <option value="solved">Solved only</option>
      </select>
      <select value={sort} onChange={(e) => onSort(e.target.value)} style={selectStyle}>
        <option value="newest">Newest first</option>
        <option value="last_reply">Last reply first</option>
      </select>
    </div>
  );
}

function ThreadRow({ thread, busy, onAction }) {
  const author = thread.author || {};
  const created = thread.created_at ? new Date(thread.created_at).toLocaleDateString() : '—';
  return (
    <tr style={{ borderTop: '1px solid var(--border-light)' }}>
      <td style={td}>
        <Link
          to={'/forums/thread/' + thread.slug}
          style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
          target="_blank"
          rel="noreferrer"
        >
          {thread.title}
        </Link>
      </td>
      <td style={td}>
        {author.username ? (
          <Link to={'/profile/' + author.username} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {author.full_name || '@' + author.username}
          </Link>
        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
      </td>
      <td style={td}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {thread.is_pinned && <Pill color="amber">Pinned</Pill>}
          {thread.is_locked && <Pill color="red">Locked</Pill>}
          {thread.is_solved && <Pill color="green">Solved</Pill>}
          {!thread.is_pinned && !thread.is_locked && !thread.is_solved && (
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Open</span>
          )}
        </div>
      </td>
      <td style={{ ...td, textAlign: 'right', color: 'var(--text-secondary)' }}>{thread.reply_count || 0}</td>
      <td style={{ ...td, color: 'var(--text-secondary)' }}>{created}</td>
      <td style={td}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <ActionBtn onClick={() => onAction(thread, 'pin')}    busy={busy}>{thread.is_pinned ? 'Unpin' : 'Pin'}</ActionBtn>
          <ActionBtn onClick={() => onAction(thread, 'lock')}   busy={busy}>{thread.is_locked ? 'Unlock' : 'Lock'}</ActionBtn>
          <ActionBtn onClick={() => onAction(thread, 'solved')} busy={busy}>{thread.is_solved ? 'Unsolve' : 'Solve'}</ActionBtn>
          <ActionBtn onClick={() => onAction(thread, 'delete')} busy={busy} danger>Delete</ActionBtn>
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ children, onClick, busy, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        padding: '4px 9px',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 600,
        background: danger ? '#fef2f2' : '#fff',
        color: danger ? '#991b1b' : 'var(--text-secondary)',
        border: '1px solid ' + (danger ? '#fecaca' : 'var(--border)'),
        borderRadius: 6,
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, color }) {
  const map = {
    amber: { bg: '#FDF6E8', fg: '#92551E', bd: '#E5C77A' },
    red:   { bg: '#FEF3F0', fg: '#991b1b', bd: '#FCA5A5' },
    green: { bg: '#ECF6E4', fg: '#2D5016', bd: '#C9E0B6' },
  };
  const c = map[color] || map.amber;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 999,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: 0.4,
      background: c.bg,
      color: c.fg,
      border: '1px solid ' + c.bd,
      fontFamily: 'Montserrat, sans-serif',
      textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function Pager({ page, setPage, totalPages, count }) {
  return (
    <div style={{
      marginTop: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 13,
      color: 'var(--text-muted)',
    }}>
      <span>{count.toLocaleString()} threads · page {page + 1} of {totalPages}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={pagerBtn}
        >← Prev</button>
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          style={pagerBtn}
        >Next →</button>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', padding: '0.65rem 0.85rem' };
const td = { padding: '0.65rem 0.85rem', verticalAlign: 'middle' };
const selectStyle = {
  padding: '0.55rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 13.5,
  fontFamily: 'inherit',
  background: 'var(--white)',
};
const pagerBtn = {
  padding: '6px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  fontWeight: 600,
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  cursor: 'pointer',
};

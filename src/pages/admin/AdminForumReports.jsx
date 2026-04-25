import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listForumReports,
  setReportStatus,
  setThreadLocked,
  softDeletePost,
} from '../../lib/forumAdminDb.js';

/**
 * /admin/forums/reports — moderation queue.
 *
 * Default view: open reports for forum threads + posts. Each row
 * shows the report reason, who flagged it, a snippet of the
 * targeted content, and quick actions:
 *   • Mark reviewing (acknowledges that a mod has eyes on it)
 *   • Resolve   (took action — log + close)
 *   • Dismiss   (no violation)
 *
 * Inline shortcuts for the most common follow-up actions:
 *   • Lock thread (if target is a thread)
 *   • Soft-delete post (if target is a post)
 */
export default function AdminForumReports() {
  const { user } = useAuth();
  const [filter,  setFilter]  = useState('open');
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId,  setBusyId]  = useState(null);
  const [err,     setErr]     = useState(null);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await listForumReports({ status: filter });
    setRows(data);
    setErr(error?.message || null);
    setLoading(false);
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [filter]);

  const handleStatus = async (report, status) => {
    setBusyId(report.id);
    setErr(null);
    const { error } = await setReportStatus(report.id, status, user?.id);
    setBusyId(null);
    if (error) {
      setErr(error.message || 'Could not update report.');
      return;
    }
    reload();
  };

  const handleLockTarget = async (report) => {
    if (report.target_type !== 'thread') return;
    setBusyId(report.id);
    const { error } = await setThreadLocked(report.target_id, true);
    setBusyId(null);
    if (error) setErr(error.message || 'Could not lock thread.');
    else reload();
  };

  const handleDeletePostTarget = async (report) => {
    if (report.target_type !== 'post') return;
    if (!window.confirm('Soft-delete this post? The body stays in the DB for audit but will be hidden from public view.')) return;
    setBusyId(report.id);
    const { error } = await softDeletePost(report.target_id);
    setBusyId(null);
    if (error) setErr(error.message || 'Could not delete post.');
    else reload();
  };

  return (
    <AdminLayout
      title="Forum reports"
      subtitle="Triage and resolve user-submitted reports."
      actions={
        <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back to forum mod.
        </Link>
      }
    >
      <FilterTabs value={filter} onChange={setFilter} />

      {err && <div className="cart-err" style={{ marginBottom: '1rem' }}>{err}</div>}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          background: 'var(--white)',
          border: '1px dashed var(--border)',
          borderRadius: 10,
        }}>
          {filter === 'open' ? '🎉 No open reports — the community is clean.' : 'No reports in this status.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r) => (
            <ReportCard
              key={r.id} report={r}
              busy={busyId === r.id}
              onStatus={handleStatus}
              onLock={handleLockTarget}
              onDeletePost={handleDeletePostTarget}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function FilterTabs({ value, onChange }) {
  const tabs = [
    { id: 'open',      label: 'Open' },
    { id: 'reviewing', label: 'Reviewing' },
    { id: 'resolved',  label: 'Resolved' },
    { id: 'dismissed', label: 'Dismissed' },
    { id: 'all',       label: 'All' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', flexWrap: 'wrap' }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            padding: '6px 14px',
            background: value === t.id ? 'var(--wood-warm)' : 'var(--white)',
            color: value === t.id ? '#fff' : 'var(--text-secondary)',
            border: '1px solid ' + (value === t.id ? 'var(--wood-warm)' : 'var(--border)'),
            borderRadius: 999,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
            cursor: 'pointer',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ReportCard({ report, busy, onStatus, onLock, onDeletePost }) {
  const target = report.target;
  const reporter = report.reporter || {};
  const created = report.created_at ? new Date(report.created_at).toLocaleString() : '';

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '1rem 1.1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <TargetTypePill type={report.target_type} />
            <ReasonPill reason={report.reason} />
            <StatusPill status={report.status} />
          </div>

          {/* Snippet of targeted content */}
          {target ? (
            <ReportTarget targetType={report.target_type} target={target} />
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Target was deleted before review.
            </div>
          )}

          {report.details && (
            <div style={{
              marginTop: 8,
              padding: '0.55rem 0.75rem',
              background: '#FDFBF5',
              borderLeft: '3px solid var(--wood-warm)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              <strong>Reporter notes:</strong> {report.details}
            </div>
          )}

          <div style={{
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            Reported by{' '}
            {reporter.username ? (
              <Link to={'/profile/' + reporter.username} style={{ color: 'var(--text-secondary)' }}>
                {reporter.full_name || '@' + reporter.username}
              </Link>
            ) : 'unknown'}
            {' · '}
            {created}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch', minWidth: 130 }}>
          {report.status === 'open' && (
            <ActionBtn onClick={() => onStatus(report, 'reviewing')} busy={busy}>Mark reviewing</ActionBtn>
          )}
          {(report.status === 'open' || report.status === 'reviewing') && (
            <>
              <ActionBtn onClick={() => onStatus(report, 'resolved')}  busy={busy} variant="success">Resolve</ActionBtn>
              <ActionBtn onClick={() => onStatus(report, 'dismissed')} busy={busy}>Dismiss</ActionBtn>

              {report.target_type === 'thread' && target && !target.is_locked && (
                <ActionBtn onClick={() => onLock(report)} busy={busy}>Lock thread</ActionBtn>
              )}
              {report.target_type === 'post' && target && !target.is_deleted && (
                <ActionBtn onClick={() => onDeletePost(report)} busy={busy} variant="danger">Delete post</ActionBtn>
              )}
            </>
          )}
          {(report.status === 'resolved' || report.status === 'dismissed') && (
            <ActionBtn onClick={() => onStatus(report, 'open')} busy={busy}>Reopen</ActionBtn>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportTarget({ targetType, target }) {
  if (targetType === 'thread') {
    return (
      <Link
        to={'/forums/thread/' + target.slug}
        target="_blank" rel="noreferrer"
        style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
      >
        {target.title}
      </Link>
    );
  }
  if (targetType === 'post') {
    const snippet = (target.body || '').slice(0, 240);
    return (
      <div>
        <Link
          to={target.thread ? '/forums/thread/' + target.thread.slug : '#'}
          target="_blank" rel="noreferrer"
          style={{ color: 'var(--text-secondary)', fontSize: 12.5, textDecoration: 'none' }}
        >
          In: {target.thread?.title || 'thread'}
        </Link>
        <div style={{
          marginTop: 4,
          padding: '0.55rem 0.75rem',
          background: '#FDFBF5',
          borderRadius: 6,
          fontSize: 13,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>
          {snippet}{(target.body || '').length > 240 && '…'}
        </div>
      </div>
    );
  }
  return null;
}

function ActionBtn({ children, onClick, busy, variant }) {
  const palette = {
    danger:  { bg: '#fef2f2', fg: '#991b1b', bd: '#fecaca' },
    success: { bg: '#ECF6E4', fg: '#2D5016', bd: '#C9E0B6' },
    default: { bg: '#fff',    fg: 'var(--text-secondary)', bd: 'var(--border)' },
  };
  const c = palette[variant] || palette.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        padding: '5px 11px',
        fontSize: 12,
        fontFamily: 'inherit',
        fontWeight: 600,
        background: c.bg,
        color: c.fg,
        border: '1px solid ' + c.bd,
        borderRadius: 6,
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  );
}

function TargetTypePill({ type }) {
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 999,
      background: type === 'thread' ? '#E6F1FB' : '#FDF6E8',
      color: type === 'thread' ? '#185FA5' : '#92551E',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, sans-serif',
    }}>{type}</span>
  );
}

function ReasonPill({ reason }) {
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 6,
      background: '#fef2f2',
      color: '#991b1b',
      fontSize: 11,
      fontWeight: 600,
    }}>{reason || 'reported'}</span>
  );
}

function StatusPill({ status }) {
  const map = {
    open:      { bg: '#FEF3F0', fg: '#991b1b' },
    reviewing: { bg: '#FDF6E8', fg: '#92551E' },
    resolved:  { bg: '#ECF6E4', fg: '#2D5016' },
    dismissed: { bg: 'var(--border-light)', fg: 'var(--text-muted)' },
  };
  const c = map[status] || map.open;
  return (
    <span style={{
      marginLeft: 'auto',
      padding: '2px 8px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, sans-serif',
    }}>{status}</span>
  );
}

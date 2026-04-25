import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { fetchForumAdminStats } from '../../lib/forumAdminDb.js';

/**
 * /admin/forums — landing page for forum moderation.
 *
 * Shows headline counters, quick links to the threads table and
 * the reports queue, and a brief explanation of what each tool
 * does so first-time mods aren't lost.
 */
export default function AdminForums() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchForumAdminStats();
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout
      title="Forum moderation"
      subtitle="Triage reports, manage threads, and keep the community on track."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <Stat label="Total threads"          value={stats?.totalThreads}  loading={loading} />
        <Stat label="Total posts"            value={stats?.totalPosts}    loading={loading} />
        <Stat label="New threads (7d)"       value={stats?.threads7d}     loading={loading} />
        <Stat label="New posts (7d)"         value={stats?.posts7d}       loading={loading} />
        <Stat
          label="Open reports"
          value={stats?.openReports}
          loading={loading}
          urgent={stats?.openReports > 0}
        />
        <Stat
          label="Reviewing"
          value={stats?.reviewingReports}
          loading={loading}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <ToolCard
          to="/admin/forums/reports"
          icon="🚩"
          title="Reports queue"
          desc="User-submitted reports for inappropriate content. Triage and resolve."
          badge={stats?.openReports}
        />
        <ToolCard
          to="/admin/forums/threads"
          icon="💬"
          title="Threads"
          desc="Browse, lock, pin, unpin, mark solved, or delete threads."
        />
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '0.85rem 1.1rem',
        background: '#FDFBF5',
        border: '1px dashed var(--border)',
        borderRadius: 10,
        fontSize: 12.5,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        Heads up: deletions are permanent for threads (cascades to posts). Prefer
        locking + pinning a "Closed by mods" message when the conversation has
        run its course but is worth keeping in the archive.
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value, loading, urgent }) {
  return (
    <div style={{
      background: urgent ? '#FEF3F0' : 'var(--white)',
      border: '1px solid ' + (urgent ? '#FCA5A5' : 'var(--border)'),
      borderRadius: 10,
      padding: '0.85rem 1rem',
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 4,
        fontFamily: 'Montserrat, sans-serif',
      }}>{label}</div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: urgent ? '#991b1b' : 'var(--text-primary)',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing: -0.3,
      }}>
        {loading ? '…' : (value ?? 0).toLocaleString()}
      </div>
    </div>
  );
}

function ToolCard({ to, icon, title, desc, badge }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.1rem 1.25rem',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s, transform 0.1s',
        position: 'relative',
      }}
    >
      {badge > 0 && (
        <span style={{
          position: 'absolute',
          top: 12, right: 12,
          background: '#dc2626',
          color: '#fff',
          borderRadius: 999,
          padding: '2px 9px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
        }}>{badge}</span>
      )}
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 4,
        fontFamily: 'Montserrat, sans-serif',
        color: 'var(--text-primary)',
      }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{desc}</div>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import RequireAuth from './RequireAuth.jsx';

/**
 * Gate a route behind staff (moderator / admin / owner) privileges.
 * - Anonymous visitors hit the normal signup/login gate via RequireAuth.
 * - Signed-in members without staff role see a friendly "no access" card.
 *
 * Usage: <RequireStaff><AdminPage /></RequireStaff>
 * Accepts an optional `level` prop: 'mod' | 'admin' | 'owner' (default 'mod').
 */
export default function RequireStaff({ children, level = 'mod' }) {
  return (
    <RequireAuth>
      <StaffGate level={level}>{children}</StaffGate>
    </RequireAuth>
  );
}

function StaffGate({ children, level }) {
  const { isModerator, isAdmin, isOwner, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  const allowed =
    (level === 'mod'   && isModerator) ||
    (level === 'admin' && isAdmin) ||
    (level === 'owner' && isOwner);

  if (allowed) return children;

  const needed =
    level === 'owner' ? 'the owner' :
    level === 'admin' ? 'an admin'  :
                        'a staff member';

  return (
    <div style={{ maxWidth: 560, margin: '4rem auto', padding: '2.5rem 2rem', textAlign: 'center', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14 }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px', color: 'var(--text-primary)' }}>
        Staff access only
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
        This area is reserved for {needed}. Your role is <strong>{role}</strong>.
        If you think this is a mistake, ask an owner to promote you in the admin panel.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '0.55rem 1.1rem',
          background: 'linear-gradient(135deg, #8A5030, #6B3D20)',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}

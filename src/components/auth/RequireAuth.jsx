import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/signup.css';

// -----------------------------------------------------------------------------
// RequireAuth
// -----------------------------------------------------------------------------
// Wraps any route that should only render for signed-in users. If the visitor
// is signed in, renders the children as normal. If not, renders a branded
// "Create a free account to continue" gate — NOT a redirect, so the URL stays
// put and the Nav + Layout chrome is unchanged. The signup + login buttons
// carry the intended URL forward via location.state.from so the user lands
// back on this page after they authenticate.
// -----------------------------------------------------------------------------

export default function RequireAuth({ children }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  // When the gate renders, snap the viewport to the top of the page. Without
  // this, a visitor who scrolled halfway down an index page and then clicked
  // into a detail route would see the gate card mid-scroll, or worse — below
  // the fold. This runs on every path change so the gate always opens focused.
  useEffect(() => {
    if (!isAuthed && !loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isAuthed, loading, location.pathname]);

  // While the Supabase session is still being resolved on first paint, show
  // nothing rather than flashing the gate. (Auth check is async on mount.)
  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        Loading…
      </div>
    );
  }

  if (isAuthed) {
    return children;
  }

  const from = location.pathname + location.search;

  return (
    <div className="signup-page-wrapper">
      <div
        className="signup-page-body"
        style={{ gridTemplateColumns: '1fr', maxWidth: '620px', textAlign: 'center' }}
      >
        <div className="signup-right-panel">
          <div className="signup-form-card">
            <div className="signup-form-body" style={{ padding: '3rem 2.5rem' }}>
              <div className="signup-form-header" style={{ textAlign: 'center' }}>
                <div
                  className="signup-free-badge"
                  style={{ margin: '0 auto 1rem' }}
                >
                  🪵 Free Forever — No Credit Card
                </div>
                <h2 style={{ marginBottom: '0.75rem' }}>
                  Pull up a stool. The shop's open inside.
                </h2>
                <p style={{ maxWidth: '460px', margin: '0 auto', lineHeight: 1.6 }}>
                  Millwork.io is built by woodworkers, for woodworkers — a home
                  for the questions you'd ask the old-timer at the next bench,
                  the tips you'd share over coffee, and the wins worth showing
                  off. Thousands of millwork pros already hang out here every
                  day. Come join us — it takes about 30 seconds and it's
                  always free.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '2rem',
                }}
              >
                <Link
                  to="/signup"
                  state={{ from }}
                  className="signup-submit-btn"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  Create My Free Account →
                </Link>

                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Already part of the crew?{' '}
                  <Link
                    to="/login"
                    state={{ from }}
                    style={{ color: 'var(--wood-warm)', fontWeight: 600 }}
                  >
                    Log in
                  </Link>
                </div>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <div>
                  <div style={{ fontSize: '18px', marginBottom: '0.25rem' }}>💬</div>
                  Ask &amp; answer in the forums
                </div>
                <div>
                  <div style={{ fontSize: '18px', marginBottom: '0.25rem' }}>📚</div>
                  Full wiki &amp; news archive
                </div>
                <div>
                  <div style={{ fontSize: '18px', marginBottom: '0.25rem' }}>🛠️</div>
                  Supplier, job &amp; listing details
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

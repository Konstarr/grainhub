import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/signup.css';

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Already logged in? Bounce wherever they were headed.
  if (user) {
    navigate(redirectTo, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn({ email, password });
    setSubmitting(false);
    if (error) {
      setAuthError(error.message || 'Could not sign you in. Check your email and password.');
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="signup-page-wrapper">
      <div
        className="signup-page-body"
        style={{ gridTemplateColumns: '1fr', maxWidth: '520px' }}
      >
        <div className="signup-right-panel">
          <div className="signup-form-card">
            <div className="signup-form-body">
              <div className="signup-form-header">
                <div className="signup-free-badge">🔒 Welcome Back</div>
                <h2>Log in to GrainHub</h2>
                <p>Pick up where you left off.</p>
              </div>

              <form className="signup-form-grid" onSubmit={handleSubmit}>
                <div className="signup-field">
                  <label className="signup-field-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    className="signup-field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="signup-password-wrap">
                    <input
                      className="signup-field-input"
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="signup-password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div
                    style={{
                      background: 'rgba(220,53,69,0.08)',
                      border: '1px solid rgba(220,53,69,0.25)',
                      color: '#B02A37',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                  >
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="signup-submit-btn"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}
                >
                  {submitting ? 'Signing in…' : 'Log In →'}
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  New to GrainHub?{' '}
                  <Link to="/signup" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>
                    Create a free account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

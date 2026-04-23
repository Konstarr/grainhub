import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import {
  ROLE_OPTIONS,
  STATE_OPTIONS,
  REFERRAL_OPTIONS,
  SHOP_TYPE_OPTIONS,
  FORM_FOOTER_PERKS,
} from '../../data/signupData.js';

export default function SignupForm() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 1 form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2 form state
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [shopType, setShopType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [referral, setReferral] = useState('');

  const checkPasswordStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    setPasswordStrength(val.length > 0 ? labels[score] : '');
    return score;
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
  };

  const getPasswordStrengthClass = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const handleGoStep2 = () => {
    setAuthError('');
    if (!firstName.trim() || !email.trim() || !username.trim() || password.length < 8) {
      setAuthError('Please fill in your name, email, username, and a password of 8+ characters.');
      return;
    }
    if (!termsAccepted) {
      setAuthError('Please accept the Terms of Service to continue.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 → Step 3: actually create the account.
  const handleGoStep3 = async () => {
    setAuthError('');
    setSubmitting(true);
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const { error, data } = await signUp({
      email,
      password,
      fullName,
      username: username.trim().toLowerCase(),
    });
    if (error) {
      setSubmitting(false);
      setAuthError(error.message || 'Could not create your account. Please try again.');
      return;
    }
    // If Supabase email confirmation is ON, data.user exists but data.session is null.
    // If email confirmation is OFF, the user is signed in immediately.
    // Either way, patch the rest of the profile info (best-effort — fails silently
    // if the user isn't logged in yet, which is fine; they can fill it in later).
    if (data?.user?.id) {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          trade: shopType || null,
          location: [city, state].filter(Boolean).join(', ') || null,
          bio: role || null,
        })
        .eq('id', data.user.id);
    }
    setSubmitting(false);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShopType = (value) => {
    setShopType(value);
  };

  // Prevent accidental form submits (the old mock behavior).
  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  // If already logged in, bounce home.
  if (user && currentStep !== 3) {
    navigate('/', { replace: true });
  }

  const strengthScore = getPasswordStrengthClass(password);

  return (
    <div className="signup-right-panel">
      <div className="signup-form-card">
        {/* STEP TABS */}
        <div className="signup-step-tabs">
          <div className={`signup-step-tab ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}>
            <div className="signup-step-num">{currentStep > 1 ? '✓' : '1'}</div>
            <span>Account</span>
            <div className="signup-step-connector"></div>
          </div>
          <div className={`signup-step-tab ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}>
            <div className="signup-step-num">{currentStep > 2 ? '✓' : '2'}</div>
            <span>Your Shop</span>
            <div className="signup-step-connector"></div>
          </div>
          <div className={`signup-step-tab ${currentStep === 3 ? 'active' : ''}`}>
            <div className="signup-step-num">3</div>
            <span>Done</span>
          </div>
        </div>

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="signup-step-container active">
            <div className="signup-form-body">
              <div className="signup-form-header">
                <div className="signup-free-badge">✓ Always Free · No Credit Card</div>
                <h2>Create your account</h2>
                <p>Takes about 60 seconds. You'll be in the forums immediately.</p>
              </div>

              {/* OAUTH */}
              <div className="signup-oauth-row">
                <button type="button" className="signup-oauth-btn">
                  <span className="signup-oauth-icon">🔵</span>
                  Continue with Google
                </button>
                <button type="button" className="signup-oauth-btn">
                  <span className="signup-oauth-icon">🍎</span>
                  Continue with Apple
                </button>
              </div>

              <div className="signup-divider">or sign up with email</div>

              <form className="signup-form-grid" onSubmit={handleFormSubmit}>
                <div className="signup-field-row">
                  <div className="signup-field">
                    <label className="signup-field-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      className="signup-field-input"
                      type="text"
                      placeholder="Tom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="signup-field">
                    <label className="signup-field-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      className="signup-field-input"
                      type="text"
                      placeholder="Kowalski"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    className="signup-field-input"
                    type="email"
                    placeholder="tom@heritagemill.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">
                    Username <span className="required">*</span>
                  </label>
                  <input
                    className="signup-field-input"
                    type="text"
                    placeholder="TomKowalski"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="signup-helper-text">
                    This is how you'll appear in forums and discussions
                  </div>
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="signup-password-wrap">
                    <input
                      className="signup-field-input"
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={handlePasswordChange}
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
                  <div className="signup-strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`signup-strength-seg ${
                          i <= strengthScore
                            ? strengthScore === 1
                              ? 'filled-weak'
                              : strengthScore === 2
                              ? 'filled-fair'
                              : strengthScore === 3
                              ? 'filled-good'
                              : 'filled-strong'
                            : ''
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="signup-strength-label">
                    {passwordStrength ? `${passwordStrength} password` : ''}
                  </div>
                </div>

                <div className="signup-terms-row">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    I agree to GrainHub's{' '}
                    <a href="#">Terms of Service</a> and{' '}
                    <a href="#">Privacy Policy</a>. I understand GrainHub is a professional
                    community and agree to keep it that way.
                  </label>
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

                <button type="button" className="signup-submit-btn" onClick={handleGoStep2}>
                  Continue — Set Up Your Shop Profile →
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginTop: '0.5rem',
                  }}
                >
                  Already have an account? <Link to="/login" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>Log in</Link>
                </div>
              </form>
            </div>

            <div className="signup-form-footer-perks">
              {FORM_FOOTER_PERKS.map((perk) => (
                <div key={perk.text} className="signup-ffp-item">
                  <span className="signup-ffp-check">{perk.check}</span>
                  {perk.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="signup-step-container active">
            <div className="signup-form-body">
              <div className="signup-form-header">
                <h2>Tell us about your shop</h2>
                <p>
                  This helps us show you the most relevant content and connect you with the right
                  people. You can always update this later.
                </p>
              </div>

              <div className="signup-form-grid">
                <div className="signup-field">
                  <label className="signup-field-label">
                    Your Role <span className="required">*</span>
                  </label>
                  <select
                    className="signup-field-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">Shop / Company Name</label>
                  <input
                    className="signup-field-input"
                    type="text"
                    placeholder="Heritage Millwork Co."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <div className="signup-helper-text">
                    Leave blank if you're between shops or an independent
                  </div>
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">
                    Shop Specialty <span className="required">*</span>
                  </label>
                  <div className="signup-shop-type-grid">
                    {SHOP_TYPE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`signup-shop-type-opt ${shopType === opt.value ? 'selected' : ''}`}
                        onClick={() => handleSelectShopType(opt.value)}
                      >
                        <input
                          type="radio"
                          name="shop-type"
                          value={opt.value}
                          checked={shopType === opt.value}
                          onChange={(e) => handleSelectShopType(e.target.value)}
                        />
                        <span className="signup-shop-type-icon">{opt.icon}</span>
                        <span className="signup-shop-type-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="signup-field-row">
                  <div className="signup-field">
                    <label className="signup-field-label">City</label>
                    <input
                      className="signup-field-input"
                      type="text"
                      placeholder="Denver"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="signup-field">
                    <label className="signup-field-label">State / Province</label>
                    <select
                      className="signup-field-select"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      {STATE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="signup-field">
                  <label className="signup-field-label">How did you hear about GrainHub?</label>
                  <select
                    className="signup-field-select"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                  >
                    {REFERRAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" className="signup-back-btn" onClick={handleGoStep1} disabled={submitting}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="signup-submit-btn"
                    style={{ flex: 1, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}
                    onClick={handleGoStep3}
                    disabled={submitting}
                  >
                    {submitting ? 'Creating account…' : 'Create My Free Account →'}
                  </button>
                </div>

                <div className="signup-skip-text">
                  You can skip this and fill it in later from your profile settings.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {currentStep === 3 && (
          <div className="signup-step-container active">
            <div className="signup-success-state show">
              <div className="signup-success-icon">🎉</div>
              <div className="signup-success-title">Welcome to GrainHub!</div>
              <div className="signup-success-sub">
                Your account is ready. Check your email (
                <strong>{email || 'your email'}</strong>) to verify, then you're in.
                <br />
                <br />
                While you wait — the forums are open. You can post, read, and reply immediately.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                <Link to="/forums" className="signup-success-btn" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                  Go to the Forums →
                </Link>
                <Link
                  to="/wiki"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--wood-warm)',
                    border: '1.5px solid var(--wood-warm)',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Browse the Wiki
                </Link>
                <Link
                  to="/marketplace"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Explore the Marketplace
                </Link>
              </div>

              <div
                style={{
                  background: 'var(--wood-paper)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: '8px',
                  }}
                >
                  Want even more? Upgrade to Pro
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginBottom: '10px',
                  }}
                >
                  Unlock all 98 business templates, estimating calculators, ad-free forums, and
                  priority placement. $19/month — cancel anytime.
                </div>
                <button
                  type="button"
                  style={{
                    background: 'var(--wood-dark)',
                    color: 'var(--wood-cream)',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  See Pro Features
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 '10px', marginBottom: '1.5rem' }}>
                <Link to="/forums" className="signup-success-btn" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                  Go to the Forums →
                </Link>
                <Link
                  to="/wiki"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--wood-warm)',
                    border: '1.5px solid var(--wood-warm)',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Browse the Wiki
                </Link>
                <Link
                  to="/marketplace"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Explore the Marketplace
                </Link>
              </div>

              <div
                style={{
                  background: 'var(--wood-paper)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: '8px',
                  }}
                >
                  Want even more? Upgrade to Pro
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginBottom: '10px',
                  }}
                >
                  Unlock all 98 business templates, estimating calculators, ad-free forums, and
                  priority placement. $19/month — cancel anytime.
                </div>
                <button
                  type="button"
                  style={{
                    background: 'var(--wood-dark)',
                    color: 'var(--wood-cream)',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  See Pro Features
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

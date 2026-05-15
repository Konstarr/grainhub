import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { TERMS_VERSION } from '../../lib/termsVersion.js';
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
  // 'picker' step lets the user choose Individual vs Business before the form
  const [currentStep, setCurrentStep] = useState('picker');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Individual vs Business
  const [accountType, setAccountType] = useState('individual');

  // Step 1 form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms,   setAgreeTerms]   = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRules,   setAgreeRules]   = useState(false);

  // Step 2 form state
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [shopType, setShopType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [referral, setReferral] = useState('');

  // Business-only fields (only collected if accountType === 'business')
  const [businessName, setBusinessName]           = useState('');
  const [businessWebsite, setBusinessWebsite]     = useState('');
  const [businessContactEmail, setBusinessContactEmail] = useState('');
  const [businessPhone, setBusinessPhone]         = useState('');
  const [businessTrade, setBusinessTrade]         = useState('');
  const [businessSize, setBusinessSize]           = useState('');

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
    if (!agreeTerms || !agreePrivacy || !agreeRules) {
      setAuthError('Please accept the Terms of Service, Privacy Policy, and Community Rules to continue.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 → Step 3: actually create the account.
  const handleGoStep3 = async () => {
    setAuthError('');
    if (accountType === 'business' && !businessName.trim()) {
      setAuthError('Business name is required for business accounts.');
      return;
    }
    setSubmitting(true);
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const { error, data } = await signUp({
      email,
      password,
      fullName,
      username: username.trim().toLowerCase(),
      accountType,
      businessName,
      businessWebsite,
      businessContactEmail,
      businessPhone,
      businessTrade,
      businessSize,
    });
    if (error) {
      setSubmitting(false);
      setAuthError(error.message || 'Could not create your account. Please try again.');
      return;
    }
    // If Supabase email confirmation is ON, data.user exists but data.session is null.
    // If email confirmation is OFF, the user is signed in immediately.
    // Patch the rest of the profile info. This can fail if RLS requires the
    // user to be signed in (email-confirm mode) — in that case the primary
    // signup still succeeded so we log but don't fail the flow.
    if (data?.user?.id) {
      const { error: patchErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          trade: shopType || null,
          location: [city, state].filter(Boolean).join(', ') || null,
          bio: role || null,
          terms_version:     TERMS_VERSION,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);
      if (patchErr) {
        // eslint-disable-next-line no-console
        console.warn('[signup] profile patch deferred:', patchErr.message);
      }
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

  // Note: no automatic redirect for logged-in users. We previously
  // bounced already-signed-in users back home, but that fought with
  // dev testing (signing up flows while logged in as an admin) and
  // with the multi-step flow itself (the redirect re-fired on every
  // step change). If a logged-in user lands here, let them see it —
  // Supabase will reject duplicate-email signups naturally.

  const strengthScore = getPasswordStrengthClass(password);

  return (
    <div className="signup-right-panel">
      <div className="signup-form-card">
        {/* ACCOUNT TYPE PICKER */}
        {currentStep === 'picker' && (
          <div className="signup-step-container active">
            <div className="signup-form-body">
              <div className="signup-form-header">
                <div className="signup-free-badge">✓ Free to join</div>
                <h2>How will you use AWI Florida Chapter?</h2>
                <p>Pick the type that fits best. You can always upgrade your plan later.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <AccountTypeCard
                  title="Individual"
                  tag="Makers &amp; pros"
                  iconKind="individual"
                  bullets={[
                    'Post in forums and ask questions',
                    'Buy and sell in the marketplace',
                    'Apply to jobs, save listings',
                    'Build a portfolio and reputation',
                  ]}
                  selected={accountType === 'individual'}
                  onClick={() => setAccountType('individual')}
                />
                <AccountTypeCard
                  title="Business"
                  tag="Companies &amp; brands"
                  iconKind="business"
                  bullets={[
                    'Everything in Individual',
                    'List your company in Suppliers',
                    'Post jobs and recruit at scale',
                    'Run sponsorships and ads',
                  ]}
                  selected={accountType === 'business'}
                  onClick={() => setAccountType('business')}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="signup-submit-btn"
                  onClick={() => { setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Continue &rarr;
                </button>
              </div>

              <div style={{ marginTop: '1rem', fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>Log in</Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP TABS */}
        {currentStep !== 'picker' && (
        <div className="signup-step-tabs">
          <div className={`signup-step-tab ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}>
            <div className="signup-step-num">{currentStep > 1 ? '✓' : '1'}</div>
            <span>Account</span>
            <div className="signup-step-connector"></div>
          </div>
          <div className={`signup-step-tab ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}>
            <div className="signup-step-num">{currentStep > 2 ? '✓' : '2'}</div>
            <span>{accountType === 'business' ? 'Your Business' : 'Your Shop'}</span>
            <div className="signup-step-connector"></div>
          </div>
          <div className={`signup-step-tab ${currentStep === 3 ? 'active' : ''}`}>
            <div className="signup-step-num">3</div>
            <span>Done</span>
          </div>
        </div>
        )}

        {/* Account type strip + change link, visible while filling out steps */}
        {currentStep !== 'picker' && currentStep !== 3 && (
          <div style={{
            background: 'var(--wood-cream, #FBF6EC)',
            padding: '0.55rem 0.9rem',
            borderRadius: 8,
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 0 1rem',
          }}>
            <span>
              Creating a <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{accountType}</strong> account
              {accountType === 'business' ? ' — includes sponsorship eligibility' : ''}
            </span>
            <button
              type="button"
              onClick={() => setCurrentStep('picker')}
              style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                color: 'var(--wood-warm)', fontWeight: 600, fontSize: 12.5,
              }}
            >
              Change
            </button>
          </div>
        )}

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="signup-step-container active">
            <div className="signup-form-body">
              <div className="signup-form-header">
                <div className="signup-free-badge">✓ Always Free · No Credit Card</div>
                <h2>Create your account</h2>
                <p>Takes about 60 seconds. You'll be in the forums immediately.</p>
              </div>

              {/* OAUTH — Supabase handles the provider handshake; we
                  just pass the account type through in queryParams so
                  we can pick it up in the callback and patch the
                  profile row with the right account_type + metadata. */}
              <OAuthRow accountType={accountType} onError={setAuthError} />

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

                <div className="signup-terms-stack">
                  <div className="signup-terms-row">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label htmlFor="agree-terms">
                      I have read and agree to the{' '}
                      <Link to="/terms" target="_blank" rel="noreferrer">Terms of Service</Link>.
                    </label>
                  </div>
                  <div className="signup-terms-row">
                    <input
                      type="checkbox"
                      id="agree-privacy"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                    />
                    <label htmlFor="agree-privacy">
                      I have read and agree to the{' '}
                      <Link to="/privacy" target="_blank" rel="noreferrer">Privacy Policy</Link>.
                    </label>
                  </div>
                  <div className="signup-terms-row">
                    <input
                      type="checkbox"
                      id="agree-rules"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                    />
                    <label htmlFor="agree-rules">
                      I will follow AWI Florida Chapter's{' '}
                      <Link to="/community-rules" target="_blank" rel="noreferrer">Community Rules</Link>.
                    </label>
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
                <h2>{accountType === 'business' ? 'Tell us about your business' : 'Tell us about your shop'}</h2>
                <p>
                  {accountType === 'business'
                    ? 'Business accounts unlock sponsorship eligibility, job posting, and marketplace listings. You can update any of this later.'
                    : 'This helps us show you the most relevant content and connect you with the right people. You can always update this later.'}
                </p>
              </div>

              {accountType === 'business' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <BusinessFields
                    businessName={businessName} setBusinessName={setBusinessName}
                    businessWebsite={businessWebsite} setBusinessWebsite={setBusinessWebsite}
                    businessContactEmail={businessContactEmail} setBusinessContactEmail={setBusinessContactEmail}
                    businessPhone={businessPhone} setBusinessPhone={setBusinessPhone}
                    businessTrade={businessTrade} setBusinessTrade={setBusinessTrade}
                    businessSize={businessSize} setBusinessSize={setBusinessSize}
                  />
                </div>
              )}

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
                  <label className="signup-field-label">How did you hear about AWI Florida Chapter?</label>
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
              <div className="signup-success-title">Welcome to AWI Florida Chapter!</div>
              <div className="signup-success-sub">
                Your account is ready. Check your email (
                <strong>{email || 'your email'}</strong>) to verify, then you're in.
                <br />
                <br />
                While you wait — the forums are open. You can post, read, and reply immediately.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                <Link
                  to={accountType === 'business' ? '/account/subscription?persona=business' : '/account/subscription'}
                  className="signup-success-btn"
                  style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
                >
                  {accountType === 'business' ? 'See business plans & role packs' : 'Pick a membership plan'} →
                </Link>
                <Link
                  to="/forums"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '11px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif',sans-serif",
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Skip — start with Free
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

/* Account type selector card used on the picker step.
 * Refined version: roomy layout, proper SVG icons that match the wood
 * palette, cleaner typography, a subtle brown ring instead of a heavy
 * colored background when selected. */
function AccountTypeCard({ title, tag, iconKind, bullets, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        position: 'relative',
        textAlign: 'left',
        background: 'var(--white)',
        border: '1.5px solid ' + (selected ? 'var(--wood-warm, #8a5030)' : 'var(--border)'),
        borderRadius: 14,
        padding: '1.5rem 1.35rem 1.4rem',
        cursor: 'pointer',
        transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 120ms ease',
        fontFamily: 'inherit',
        boxShadow: selected
          ? '0 0 0 4px rgba(138, 80, 48, 0.1), 0 6px 18px rgba(138, 80, 48, 0.08)'
          : '0 1px 3px rgba(43, 26, 14, 0.04)',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--wood-light)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(43, 26, 14, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(43, 26, 14, 0.04)';
        }
      }}
    >
      {/* Selected check — pulls to top-right, subtle */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--wood-warm)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(138, 80, 48, 0.3)',
        }}>✓</div>
      )}

      {/* Icon — custom SVG in a warm-tinted square */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: selected ? 'linear-gradient(135deg, #6B3F1F, #A0522D)' : 'var(--wood-cream, #F5EAD6)',
        color: selected ? '#fff' : 'var(--wood-warm)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.9rem',
        transition: 'background 140ms ease, color 140ms ease',
      }}>
        {iconKind === 'individual' ? <IconIndividual /> : <IconBusiness />}
      </div>

      <div style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.2px',
        lineHeight: 1.2,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginTop: 3,
      }}>
        {tag}
      </div>

      <ul style={{
        margin: '1rem 0 0',
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gap: 6,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            paddingLeft: 20,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 3,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'rgba(138, 80, 48, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wood-warm)',
              fontSize: 9,
              fontWeight: 800,
            }}>✓</span>
            {b}
          </li>
        ))}
      </ul>
    </button>
  );
}

/* Clean inline SVG icons matching the wood palette (currentColor). */
function IconIndividual() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
    </svg>
  );
}
function IconBusiness() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="15" rx="1.5" />
      <path d="M3 10h18" />
      <path d="M8 6V4h8v2" />
      <path d="M10 14h4M10 17h4" />
    </svg>
  );
}

/**
 * OAuth sign-in row. Uses supabase.auth.signInWithOAuth() — Supabase
 * handles the provider handshake entirely, so we just hand it a
 * provider slug and a redirect URL. The chosen account_type is
 * stashed in sessionStorage so the OAuth callback can patch the
 * freshly-created profile with the right business/individual flag.
 *
 * Enabling a provider = 3 steps, all outside this file:
 *   1) Register an OAuth app in the provider's developer portal
 *      (Google Cloud Console / Entra / LinkedIn / Apple Dev Portal).
 *   2) Paste the client ID + secret into Supabase Dashboard →
 *      Authentication → Providers.
 *   3) Set the Redirect URL in the provider to:
 *      https://<your-supabase-project>.supabase.co/auth/v1/callback
 *
 * Buttons for providers that aren't configured yet will simply
 * surface the provider's "unsupported_provider" error in the form
 * error state — no code changes needed to toggle a provider on.
 */
function OAuthRow({ accountType, onError }) {
  const [busy, setBusy] = useState(null);

  const go = async (provider) => {
    setBusy(provider);
    onError && onError('');
    try {
      // Remember the persona so the callback page can write the
      // right account_type onto the freshly-created profile row.
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('signup:accountType', accountType || 'individual');
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) {
        setBusy(null);
        onError && onError(error.message || 'Could not start sign-in.');
      }
      // On success, the browser has already redirected — no cleanup needed.
    } catch (e) {
      setBusy(null);
      onError && onError(e?.message || 'Sign-in failed.');
    }
  };

  const providers = [
    { id: 'google',   name: 'Google',    logo: <LogoGoogle /> },
    { id: 'azure',    name: 'Microsoft', logo: <LogoMicrosoft /> },
    { id: 'linkedin_oidc', name: 'LinkedIn', logo: <LogoLinkedIn /> },
    { id: 'apple',    name: 'Apple',     logo: <LogoApple /> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          className="signup-oauth-btn"
          onClick={() => go(p.id)}
          disabled={busy !== null}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--white)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy && busy !== p.id ? 0.55 : 1,
            transition: 'border-color 0.12s, background 0.12s',
          }}
          onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.borderColor = 'var(--wood-warm)'; e.currentTarget.style.background = '#FDFBF5'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
        >
          {busy === p.id ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Redirecting…</span>
          ) : (
            <>
              <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{p.logo}</span>
              <span>{p.name}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Brand-accurate SVG logos (no external deps) ── */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.2 36.1 44 30.6 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
function LogoMicrosoft() {
  return (
    <svg viewBox="0 0 23 23" width="18" height="18" aria-hidden="true">
      <rect width="10" height="10" x="1"  y="1"  fill="#F25022"/>
      <rect width="10" height="10" x="12" y="1"  fill="#7FBA00"/>
      <rect width="10" height="10" x="1"  y="12" fill="#00A4EF"/>
      <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
    </svg>
  );
}
function LogoLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.62 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z"/>
    </svg>
  );
}
function LogoApple() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

/* Inline business-fields block used inside step 2 when accountType === 'business'. */
export function BusinessFields({
  businessName, setBusinessName,
  businessWebsite, setBusinessWebsite,
  businessContactEmail, setBusinessContactEmail,
  businessPhone, setBusinessPhone,
  businessTrade, setBusinessTrade,
  businessSize, setBusinessSize,
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="signup-field-row">
        <div className="signup-field">
          <label className="signup-field-label">
            Business Name <span className="required">*</span>
          </label>
          <input
            className="signup-field-input"
            type="text"
            placeholder="Acme Millwork LLC"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div className="signup-field">
          <label className="signup-field-label">Website</label>
          <input
            className="signup-field-input"
            type="text"
            placeholder="https://…"
            value={businessWebsite}
            onChange={(e) => setBusinessWebsite(e.target.value)}
          />
        </div>
      </div>
      <div className="signup-field-row">
        <div className="signup-field">
          <label className="signup-field-label">Contact email (if different)</label>
          <input
            className="signup-field-input"
            type="email"
            placeholder="hello@yourcompany.com"
            value={businessContactEmail}
            onChange={(e) => setBusinessContactEmail(e.target.value)}
          />
        </div>
        <div className="signup-field">
          <label className="signup-field-label">Phone</label>
          <input
            className="signup-field-input"
            type="tel"
            placeholder="(555) 123-4567"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
         />
        </div>
      </div>
      <div className="signup-field-row">
        <div className="signup-field">
          <label className="signup-field-label">Primary trade</label>
          <select
            className="signup-field-input"
            value={businessTrade}
            onChange={(e) => setBusinessTrade(e.target.value)}
          >
            <option value="">Select…</option>
            <option value="Cabinetmaking">Cabinetmaking</option>
            <option value="Millwork">Millwork</option>
            <option value="Flooring">Flooring</option>
            <option value="Finishing">Finishing</option>
            <option value="CNC">CNC / Tooling</option>
            <option value="Supply / Distribution">Supply / Distribution</option>
            <option value="General">General</option>
          </select>
        </div>
        <div className="signup-field">
          <label className="signup-field-label">Company size</label>
          <select
            className="signup-field-input"
            value={businessSize}
            onChange={(e) => setBusinessSize(e.target.value)}
          >
            <option value="">Select…</option>
            <option value="1-9">1 – 9</option>
            <option value="10-49">10 – 49</option>
            <option value="50-249">50 – 249</option>
            <option value="250+">250+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

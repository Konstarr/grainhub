import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

/**
 * Admin → /admin/users → Create Member
 *
 * Actually creates a Supabase auth account from the admin panel and
 * sets the member's tier/company/region via the admin_update_profile RPC.
 *
 * Flow:
 *   1. Admin fills in email, name, tier, company, region.
 *   2. We generate a temporary password.
 *   3. We snapshot the admin's session, call supabase.auth.signUp(), and
 *      immediately restore the admin's session in case Supabase is
 *      configured without email confirmation (which would otherwise
 *      sign the new user into the admin's browser tab).
 *   4. We call admin_update_profile() with the new user's id to set
 *      chapter-specific fields the auth trigger doesn't know about.
 *   5. Success view shows the temp password and a "Send welcome email"
 *      mailto so the admin can mail it from their own inbox.
 *
 * If "Confirm email" is enabled in Supabase Auth settings (the default),
 * Supabase automatically sends a confirmation email; the new member
 * confirms via the link, then signs in with the temp password and is
 * expected to change it from their profile page.
 */
const TIERS = [
  { value: 'manufacturer', label: 'Manufacturer Member ($575/yr)' },
  { value: 'supplier',     label: 'Supplier Member ($575/yr)' },
  { value: 'guest',        label: 'Guest (free, read-only)' },
];

const REGIONS = [
  '', 'South Florida', 'Treasure Coast', 'Central Florida', 'Tampa Bay',
  'Southwest Florida', 'North Florida / Jacksonville', 'Panhandle',
];

// Crypto-strong-ish temp password generator
function genTempPassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits  = '23456789';
  const symbols = '!@#$%';
  const all = letters + digits + symbols;
  let pw = '';
  // Force at least one of each kind
  pw += letters[Math.floor(Math.random() * letters.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 0; i < 9; i++) pw += all[Math.floor(Math.random() * all.length)];
  // Shuffle
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

export default function InviteMemberModal({ open, onClose, fromName }) {
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [tier, setTier]         = useState('manufacturer');
  const [company, setCompany]   = useState('');
  const [region, setRegion]     = useState('');
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');
  const [done, setDone]         = useState(null); // { tempPassword, newUserId } on success

  if (!open) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://awiflorida.org';

  const reset = () => {
    setEmail(''); setName(''); setTier('manufacturer'); setCompany('');
    setRegion(''); setBusy(false); setErr(''); setDone(null);
  };
  const close = () => { reset(); onClose && onClose(); };

  const createAccount = async () => {
    setErr('');
    if (!/.+@.+\..+/.test(email)) { setErr('Enter a valid email address.'); return; }
    if (!name.trim())            { setErr('Enter the member\'s full name.'); return; }
    setBusy(true);

    try {
      // 1. Snapshot the admin's current session so we can restore it if
      //    Supabase Auth is configured without email confirmation
      //    (in which case signUp will sign the *new* user in instead).
      const { data: adminSessionData } = await supabase.auth.getSession();
      const adminSession = adminSessionData?.session || null;

      // 2. Create the auth user with metadata the auth trigger picks up.
      const tempPassword = genTempPassword();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: tempPassword,
        options: {
          data: {
            full_name: name.trim(),
            account_type: tier === 'guest' ? 'individual' : 'business',
          },
          emailRedirectTo: origin + '/login',
        },
      });
      if (error) throw error;
      const newUserId = data?.user?.id;
      if (!newUserId) throw new Error('Account created but user id missing in response.');

      // 3. If signUp returned a session (email-confirmation OFF), restore
      //    the admin's session so the admin doesn't get logged out.
      if (data.session && adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      // 4. Wait briefly for the on_auth_user_created trigger to write the
      //    profile row, then set chapter-specific fields via admin RPC.
      await new Promise((r) => setTimeout(r, 400));
      const patch = {
        full_name: name.trim(),
        membership_tier: tier,
        business_name: company.trim() || null,
        region: region || null,
        member_since: new Date().toISOString().slice(0, 10),
      };
      const { error: rpcErr } = await supabase.rpc('admin_update_profile', {
        target_id: newUserId,
        patch,
      });
      // RPC failure isn't fatal — the account exists, admin can edit
      // the profile manually from /admin/users. Just surface the error.
      if (rpcErr) {
        console.warn('admin_update_profile failed:', rpcErr.message);
      }

      setDone({ tempPassword, newUserId, rpcWarning: rpcErr?.message || null });
    } catch (e) {
      setErr(e.message || 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  };

  // ───────── SUCCESS VIEW ─────────
  if (done) {
    const welcomeBody =
      `Hi ${name},\n\n` +
      `Welcome to the AWI Florida Chapter — your member account is ready.\n\n` +
      `Sign-in details\n` +
      `• Site: ${origin}/login\n` +
      `• Email: ${email}\n` +
      `• Temporary password: ${done.tempPassword}\n\n` +
      `If Supabase is configured to require email confirmation, you will first receive a confirmation email at this address — click the link in that email to activate the account, then sign in with the temporary password above.\n\n` +
      `Once you are signed in, please change your password from your profile page.\n\n` +
      `Membership tier: ${TIERS.find((t) => t.value === tier)?.label.split(' (')[0]}\n` +
      (region ? `Region: ${region}\n` : '') +
      (company ? `Company: ${company}\n` : '') +
      `\nThe chapter board roster, events, and member directory are all at ${origin}.\n\n` +
      `Best,\n${fromName || 'AWI Florida Chapter Board'}`;

    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Welcome to the AWI Florida Chapter — your account is ready')}&body=${encodeURIComponent(welcomeBody)}`;

    return (
      <Backdrop onClose={close}>
        <Card>
          <Header title="✓ Account created" onClose={close} />
          <p style={textStyle}>
            <strong>{email}</strong> has been added as a chapter member.
            Supabase has automatically sent them a confirmation email (if email confirmation is enabled).
          </p>

          <div style={{
            background: '#F5F5EE', border: '1px solid #DDE5D8',
            borderRadius: 8, padding: '12px 14px', margin: '14px 0',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Temporary password
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{
                flex: 1, fontSize: 16, color: '#1B3A2E',
                fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
              }}>
                {done.tempPassword}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(done.tempPassword)}
                style={smallBtn}
              >Copy</button>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              The new member should change this from their profile page after signing in.
            </div>
          </div>

          {done.rpcWarning && (
            <div style={{
              background: '#FFF6E0', border: '1px solid #E8C067',
              borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#8C7A35', marginBottom: 12,
            }}>
              Note: tier/company/region were not applied automatically ({done.rpcWarning}). You can set them by clicking the member's row in the list.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={close} style={ghostBtn}>Done</button>
            <a href={mailto} style={primaryAnchor}>
              Send welcome email →
            </a>
          </div>
        </Card>
      </Backdrop>
    );
  }

  // ───────── FORM VIEW ─────────
  const canCreate = !!email && /.+@.+\..+/.test(email) && name.trim();

  return (
    <Backdrop onClose={close}>
      <Card>
        <Header title="Create member account" onClose={close} />
        <p style={textStyle}>
          Creates a Supabase auth account with a temporary password and applies the chapter tier on their profile.
          Supabase will send a confirmation email automatically if email confirmation is enabled.
        </p>

        <div style={{ display: 'grid', gap: 10, marginTop: 14, marginBottom: 14 }}>
          <Field label="Email" required>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle} autoFocus />
          </Field>
          <Field label="Full name" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
          </Field>
          <Field label="Membership tier">
            <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle}>
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Company / Shop name">
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ABC Millwork, Inc." style={inputStyle} />
          </Field>
          <Field label="Region">
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle}>
              {REGIONS.map((r) => <option key={r || 'none'} value={r}>{r || '— select —'}</option>)}
            </select>
          </Field>
        </div>

        {err && (
          <div style={{
            background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca',
            padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12,
          }}>{err}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={close} style={ghostBtn} disabled={busy}>Cancel</button>
          <button
            type="button"
            onClick={createAccount}
            disabled={!canCreate || busy}
            style={{
              ...primaryBtn,
              opacity: !canCreate || busy ? 0.6 : 1,
              cursor: !canCreate || busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Creating…' : 'Create account →'}
          </button>
        </div>
      </Card>
    </Backdrop>
  );
}

/* ── Subcomponents ─────────────────────────────────────────── */
function Backdrop({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, padding: 16,
      background: 'rgba(27,58,46,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  );
}
function Card({ children }) {
  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      width: '100%', maxWidth: 540,
      background: '#fff', borderRadius: 14,
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      padding: '24px 24px 20px',
    }}>{children}</div>
  );
}
function Header({ title, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8C7A35' }}>
          AWI Florida Chapter
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 22, color: '#1B3A2E', fontWeight: 600 }}>{title}</h2>
      </div>
      <button type="button" onClick={onClose} aria-label="Close" style={{
        background: 'transparent', border: 'none', fontSize: 22,
        color: '#6B7280', cursor: 'pointer', padding: 4, marginRight: -8, marginTop: -4,
      }}>×</button>
    </div>
  );
}
function Field({ label, required, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#9B2222', marginLeft: 4 }}>•</span>}
      </div>
      {children}
    </label>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '8px 10px',
  border: '1px solid #DDE5D8', borderRadius: 6,
  fontSize: 14, fontFamily: 'inherit', color: '#1F2937',
};
const textStyle = { fontSize: 13.5, color: '#475569', lineHeight: 1.55, marginTop: 0 };
const primaryBtn = {
  background: '#2D6A4F', color: '#F5EAD6',
  border: 'none', borderRadius: 8,
  padding: '10px 16px', fontWeight: 700, fontSize: 14,
};
const primaryAnchor = {
  background: '#2D6A4F', color: '#F5EAD6',
  textDecoration: 'none', padding: '10px 16px',
  borderRadius: 8, fontWeight: 700, fontSize: 14, display: 'inline-block',
};
const ghostBtn = {
  background: 'transparent', color: '#475569',
  border: '1px solid #DDE5D8', borderRadius: 8,
  padding: '9px 14px', fontWeight: 600, cursor: 'pointer',
};
const smallBtn = {
  background: '#fff', border: '1px solid #DDE5D8',
  padding: '4px 10px', borderRadius: 6, fontSize: 12,
  fontWeight: 600, color: '#2D6A4F', cursor: 'pointer',
};

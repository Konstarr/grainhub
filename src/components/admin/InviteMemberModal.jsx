import { useState } from 'react';

/**
 * Admin → /admin/users → Invite Member
 *
 * Opens a small modal that collects the prospective member's details,
 * then generates a pre-filled invitation email the admin can send via
 * their own mail client. The invite link points at /signup with query
 * params (email, name, tier hint, company, region) that the signup
 * form picks up and pre-populates so the recipient just clicks and
 * confirms.
 *
 * After the new member completes signup, an admin can use the existing
 * AdminUserEdit page to verify and finalize the membership tier.
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

export default function InviteMemberModal({ open, onClose, fromName }) {
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [tier, setTier]         = useState('manufacturer');
  const [company, setCompany]   = useState('');
  const [region, setRegion]     = useState('');
  const [copied, setCopied]     = useState(false);

  if (!open) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://awiflorida.org';
  const params = new URLSearchParams();
  if (email)   params.set('email',   email);
  if (name)    params.set('name',    name);
  if (tier)    params.set('tier',    tier);
  if (company) params.set('company', company);
  if (region)  params.set('region',  region);
  const inviteUrl = `${origin}/signup?${params.toString()}`;

  const tierLabel = TIERS.find((t) => t.value === tier)?.label || tier;

  const emailBody =
    `Hi ${name || 'there'},\n\n` +
    `On behalf of the AWI Florida Chapter board, I'd like to invite you to join the chapter as a ${tierLabel.split(' (')[0]}.\n\n` +
    `To get started, please click the link below to set up your member account. Your info will be pre-filled — you just need to confirm and create a password:\n\n` +
    `${inviteUrl}\n\n` +
    `What you get with chapter membership:\n` +
    `• Listed in the AWI Florida member directory\n` +
    `• Member rate on every chapter event\n` +
    `• Voting rights in chapter elections\n` +
    `• Access to chapter forums by FL region and by topic\n` +
    `• Direct access to other chapter members across Florida\n\n` +
    `Annual dues are $575 and are paid directly to the chapter treasurer once your account is set up.\n\n` +
    `If you have questions about membership or the chapter, our website is at ${origin} and the full board roster is at ${origin}/board.\n\n` +
    `Looking forward to having you in the chapter.\n\n` +
    `Best,\n${fromName || 'AWI Florida Chapter Board'}`;

  const subject  = encodeURIComponent('AWI Florida Chapter — membership invitation');
  const mailto   = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
  const canSend  = !!email && /.+@.+\..+/.test(email);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) { /* ignore */ }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(27,58,46,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540,
          background: '#fff', borderRadius: 14,
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          padding: '24px 24px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8C7A35' }}>
              AWI Florida Chapter
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, color: '#1B3A2E', fontWeight: 600 }}>
              Invite a new member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', fontSize: 22,
              color: '#6B7280', cursor: 'pointer', padding: 4, marginRight: -8, marginTop: -4,
            }}
            aria-label="Close"
          >×</button>
        </div>

        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, marginTop: 0, marginBottom: 16 }}>
          Fill in what you know, click <strong>Send invite email</strong>, and your mail client will open with a pre-written message. The recipient signs up at the link, and their info is pre-populated. You can finalize their tier afterward on this page.
        </p>

        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          <Field label="Email *" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              style={input}
              autoFocus
            />
          </Field>
          <Field label="Full name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              style={input}
            />
          </Field>
          <Field label="Membership tier">
            <select value={tier} onChange={(e) => setTier(e.target.value)} style={input}>
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Company / Shop name">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="ABC Millwork, Inc."
              style={input}
            />
          </Field>
          <Field label="Region">
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={input}>
              {REGIONS.map((r) => (
                <option key={r || 'none'} value={r}>{r || '— select —'}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Generated link preview */}
        <div style={{
          background: '#F5F5EE', border: '1px solid #DDE5D8',
          borderRadius: 8, padding: '10px 12px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Invite link
          </div>
          <code style={{
            flex: 1, minWidth: 200, fontSize: 12, color: '#1B3A2E',
            wordBreak: 'break-all', fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
          }}>
            {inviteUrl.length > 80 ? inviteUrl.slice(0, 80) + '…' : inviteUrl}
          </code>
          <button
            type="button"
            onClick={copyLink}
            style={{
              background: '#fff', border: '1px solid #DDE5D8',
              padding: '4px 10px', borderRadius: 6, fontSize: 12,
              fontWeight: 600, color: '#2D6A4F', cursor: 'pointer',
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', color: '#475569',
              border: '1px solid #DDE5D8', borderRadius: 8,
              padding: '9px 14px', fontWeight: 600, cursor: 'pointer',
            }}
          >Cancel</button>
          <a
            href={canSend ? mailto : undefined}
            onClick={(e) => { if (!canSend) e.preventDefault(); }}
            style={{
              background: canSend ? '#2D6A4F' : '#9CA3AF',
              color: '#F5EAD6', textDecoration: 'none',
              padding: '10px 16px', borderRadius: 8, fontWeight: 700,
              fontSize: 14, display: 'inline-block',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            Send invite email →
          </a>
        </div>
      </div>
    </div>
  );
}

const input = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #DDE5D8',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1F2937',
};

function Field({ label, required, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: '#9B2222', marginLeft: 4 }}>•</span>}
      </div>
      {children}
    </label>
  );
}

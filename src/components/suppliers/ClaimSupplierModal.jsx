import { useState } from 'react';
import { submitSupplierClaim } from '../../lib/supplierClaimsDb.js';

/**
 * Claim flow modal. If the email domain matches the supplier's
 * website domain, the RPC auto-approves; otherwise it goes to
 * the admin review queue.
 */
export default function ClaimSupplierModal({ supplier, onClose, onClaimed }) {
  const [email, setEmail] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null); // { status }

  if (!supplier) return null;

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) { setErr('Please enter a work email at this business.'); return; }
    setSubmitting(true); setErr('');
    const { data, error } = await submitSupplierClaim({
      supplierId: supplier.id,
      email,
      evidence,
    });
    setSubmitting(false);
    if (error) {
      const msg = error.message || 'Could not submit claim.';
      const friendly = msg.includes('already_claimed') ? 'This business has already been claimed.'
        : msg.includes('claim_already_pending') ? 'You already have a pending claim for this business.'
        : msg.includes('invalid_email') ? 'Please enter a valid email address.'
        : msg;
      setErr(friendly);
      return;
    }
    setDone(data);
    if (typeof onClaimed === 'function') onClaimed(data);
  };

  return (
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="claim-modal-header">
          <strong>Claim {supplier.name}</strong>
          <button type="button" className="claim-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {done ? (
          <div className="claim-modal-body">
            {done.status === 'auto_approved' ? (
              <>
                <p style={{ marginTop: 0 }}>
                  ✅ <strong>Claim approved.</strong> Your email domain matched the business website,
                  so you're now the verified owner of this listing.
                </p>
                <p>You can now edit the logo, description, website, phone, email, and address.</p>
              </>
            ) : (
              <>
                <p style={{ marginTop: 0 }}>
                  📨 <strong>Claim submitted for review.</strong> Our team will verify and respond within
                  a couple business days. You'll see the status on this page when it changes.
                </p>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="claim-btn primary" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <form className="claim-modal-body" onSubmit={submit}>
            <p style={{ marginTop: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Enter a work email at <strong>{supplier.name}</strong>. If it matches the business
              website domain, you'll be verified instantly. Otherwise the claim goes to admin review.
            </p>

            <label className="claim-field">
              <span>Work email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                autoFocus
                required
              />
            </label>

            <label className="claim-field">
              <span>Notes for review (optional)</span>
              <textarea
                rows={3}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g. role at the company, link to your bio on the business website, etc."
                maxLength={1000}
              />
            </label>

            {err && <div className="claim-error">{err}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="claim-btn ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="claim-btn primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

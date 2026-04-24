import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { submitReport } from '../../lib/forumDb.js';

/**
 * Shared report modal. Renders only when `open` is true. Writes a row to the
 * `reports` table via submitReport(). Shows a success confirmation on submit.
 *
 * Props:
 *   open        – boolean, whether the modal is visible
 *   onClose     – fn() to close the modal
 *   targetType  – 'thread' | 'post' | 'profile'
 *   targetId    – uuid of the thing being reported
 */
const REASONS = [
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'harassment', label: 'Harassment or personal attack' },
  { value: 'misinformation', label: 'Misinformation or unsafe advice' },
  { value: 'off_topic', label: 'Off-topic / wrong category' },
  { value: 'scam', label: 'Scam, phishing, or fraud' },
  { value: 'other', label: 'Other (explain below)' },
];

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const { user, isAuthed } = useAuth();
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  // Reset state every time the modal re-opens for a fresh target.
  useEffect(() => {
    if (open) {
      setReason('spam');
      setDetails('');
      setBusy(false);
      setDone(false);
      setErr(null);
    }
  }, [open, targetType, targetId]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const targetLabel = targetType === 'thread' ? 'thread'
    : targetType === 'post' ? 'post'
    : targetType === 'profile' ? 'profile'
    : 'item';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthed) {
      setErr('You must be signed in to report.');
      return;
    }
    if (!targetType || !targetId) {
      setErr('Missing target. Close and try again.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await submitReport({
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        details: details.trim() || null,
      });
      setDone(true);
    } catch (ex) {
      setErr(ex?.message || 'Failed to submit report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(20,10,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white, #fff)', borderRadius: 12, padding: '1.5rem',
          maxWidth: 480, width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {done ? (
          <>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 8 }}>
              Report submitted
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Thanks for flagging this {targetLabel}. A moderator will take a look shortly.
            </p>
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={onClose}
                style={pillBtn('solid')}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22 }}>
                Report this {targetLabel}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Reports are reviewed by moderators. We won't share your identity with the reported member.
            </p>

            <label style={labelStyle}>Reason</label>
            <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
              {REASONS.map((r) => (
                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <label style={labelStyle}>Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Add context that will help the moderator..."
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
                border: '1px solid var(--border)', fontFamily: 'inherit',
                fontSize: 14, resize: 'vertical', marginBottom: 6,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginBottom: 14 }}>
              {details.length}/1000
            </div>

            {err && (
              <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={pillBtn('ghost')} disabled={busy}>
                Cancel
              </button>
              <button type="submit" style={pillBtn('solid')} disabled={busy}>
                {busy ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-muted)',
  marginBottom: 6,
};

function pillBtn(variant) {
  if (variant === 'solid') {
    return {
      background: 'var(--wood-warm, #8A5030)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '0.55rem 1.1rem',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    };
  }
  return {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    padding: '0.55rem 1.1rem',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

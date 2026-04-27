import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchSupplierReviews,
  fetchMySupplierReview,
  submitSupplierReview,
  deleteSupplierReview,
} from '../../lib/supplierClaimsDb.js';
import { SAMPLE_REVIEWS } from '../../data/supplierProfileData.js';

function StarPicker({ value, onChange, readOnly = false }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, fontSize: 18, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={readOnly ? undefined : () => onChange?.(n)}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            color: n <= (value || 0) ? '#E0A02B' : '#D6CCB8',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h ago';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd ago';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReviewsCard({ supplier }) {
  const { user, isAuthed } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [mine, setMine] = useState(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!supplier?.id) return;
    let cancelled = false;
    (async () => {
      const [{ data: rs }, { data: m }] = await Promise.all([
        fetchSupplierReviews(supplier.id, { limit: 50 }),
        fetchMySupplierReview(supplier.id),
      ]);
      if (cancelled) return;
      setReviews(rs || []);
      setMine(m || null);
      if (m) { setRating(m.rating); setBody(m.body || ''); }
    })();
    return () => { cancelled = true; };
  }, [supplier?.id]);

  // Demo fallback when no real supplier (legacy /suppliers/profile route).
  if (!supplier) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch"><span className="ch-title">Reviews</span></div>
        <div className="cb">
          {(SAMPLE_REVIEWS || []).map((r, i) => (
            <div key={i} className="rev">
              <div className="rev-head">
                <strong>{r.author}</strong>
                <span style={{ color: '#E0A02B' }}>{'★'.repeat(r.rating || 5)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</span>
              </div>
              <div>{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isOwner = supplier.claimed_by && user?.id === supplier.claimed_by;
  const canSubmit = isAuthed && !isOwner;

  const submit = async (e) => {
    e?.preventDefault();
    if (!rating) { setErr('Pick a star rating first.'); return; }
    setSubmitting(true); setErr('');
    const { error } = await submitSupplierReview({ supplierId: supplier.id, rating, body });
    setSubmitting(false);
    if (error) {
      const m = error.message || '';
      setErr(m.includes('cannot_review_own') ? "You can't review your own listing."
           : m.includes('invalid_rating') ? 'Please pick 1–5 stars.'
           : m.includes('auth_required') ? 'Please sign in to leave a review.'
           : (m || 'Could not save review.'));
      return;
    }
    const [{ data: rs }, { data: m2 }] = await Promise.all([
      fetchSupplierReviews(supplier.id, { limit: 50 }),
      fetchMySupplierReview(supplier.id),
    ]);
    setReviews(rs || []);
    setMine(m2 || null);
  };

  const onDelete = async () => {
    if (!mine?.id) return;
    if (!window.confirm('Delete your review?')) return;
    const { error } = await deleteSupplierReview(mine.id);
    if (error) { setErr(error.message || 'Delete failed.'); return; }
    setMine(null); setRating(0); setBody('');
    const { data: rs } = await fetchSupplierReviews(supplier.id, { limit: 50 });
    setReviews(rs || []);
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="ch">
        <span className="ch-title">Reviews</span>
        <span className="ch-link" style={{ pointerEvents: 'none' }}>
          {supplier.review_count
            ? `${Number(supplier.rating || 0).toFixed(1)} ★ · ${supplier.review_count} review${supplier.review_count === 1 ? '' : 's'}`
            : 'No reviews yet'}
        </span>
      </div>

      {canSubmit && (
        <form className="cb" style={{ borderBottom: '1px solid var(--border-light)' }} onSubmit={submit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{mine ? 'Update your review' : 'Leave a review'}</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            maxLength={2000}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-light)', fontFamily: 'inherit', fontSize: 14 }}
          />
          {err && <div className="claim-error" style={{ marginTop: 8 }}>{err}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            {mine && <button type="button" className="claim-btn ghost" onClick={onDelete}>Delete</button>}
            <button type="submit" className="claim-btn primary" disabled={submitting}>
              {submitting ? 'Saving…' : (mine ? 'Update review' : 'Post review')}
            </button>
          </div>
        </form>
      )}

      {!isAuthed && (
        <div className="cb" style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 13 }}>
          Sign in to leave a review.
        </div>
      )}
      {isOwner && (
        <div className="cb" style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 13 }}>
          You own this listing. You can't review your own business.
        </div>
      )}

      <div className="cb">
        {reviews.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No reviews yet — be the first.</div>
        ) : reviews.map((r) => (
          <div key={r.id} className="rev" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
            <div className="rev-head" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <strong>{r.reviewer?.full_name || r.reviewer?.username || 'Anonymous'}</strong>
              <StarPicker value={r.rating} readOnly />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</span>
            </div>
            {r.body && <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

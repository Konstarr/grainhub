import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  fetchSupplierBySlug,
  fetchMyClaimForSupplier,
} from '../../lib/supplierClaimsDb.js';
import ClaimSupplierModal from './ClaimSupplierModal.jsx';
import EditMySupplierModal from './EditMySupplierModal.jsx';

/**
 * Self-contained claim/edit card. Pass `slug` and it figures out
 * which CTA to render: "Claim this business", "Edit my listing",
 * "Pending review", or nothing if the user isn't signed in.
 */
export default function ClaimSection({ slug }) {
  const { user, isAuthed } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [myClaim, setMyClaim]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [showEdit, setShowEdit]   = useState(false);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: s } = await fetchSupplierBySlug(slug);
      if (cancelled) return;
      setSupplier(s);
      if (s && isAuthed) {
        const { data: c } = await fetchMyClaimForSupplier(s.id);
        if (!cancelled) setMyClaim(c);
      } else {
        setMyClaim(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, isAuthed, user?.id]);

  if (loading || !supplier) return null;

  const isOwner = !!user?.id && supplier.claimed_by === user.id;
  const isClaimedBySomeoneElse = !!supplier.claimed_by && !isOwner;
  const myStatus = myClaim?.status; // 'pending' | 'auto_approved' | 'approved' | 'rejected'

  const onClaimed = (res) => {
    // Optimistically refresh local state.
    if (res?.status === 'auto_approved') {
      setSupplier((s) => ({ ...s, claimed_by: user?.id, is_verified: true }));
      setMyClaim({ status: 'auto_approved' });
    } else if (res?.status === 'pending') {
      setMyClaim({ status: 'pending' });
    }
  };

  return (
    <div className="claim-card">
      {isOwner && (
        <>
          <div className="claim-card-row">
            <span className="claim-badge approved">✓ Verified business</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>You own this listing.</span>
          </div>
          <button type="button" className="claim-btn primary" onClick={() => setShowEdit(true)}>
            Edit my listing
          </button>
          {showEdit && (
            <EditMySupplierModal
              supplier={supplier}
              onClose={() => setShowEdit(false)}
              onSaved={() => fetchSupplierBySlug(slug).then(({ data }) => data && setSupplier(data))}
            />
          )}
        </>
      )}

      {!isOwner && isClaimedBySomeoneElse && (
        <div className="claim-card-row">
          <span className="claim-badge approved">✓ Verified business</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            This listing is owned by the business. Think the wrong person owns it? <a href="/contact">Report it</a>.
          </span>
        </div>
      )}

      {!isOwner && !isClaimedBySomeoneElse && (
        <>
          {!isAuthed && (
            <a className="claim-btn ghost" href={`/signup?next=/suppliers/${supplier.slug}`}>
              Sign in to claim this business
            </a>
          )}
          {isAuthed && myStatus === 'pending' && (
            <div className="claim-card-row">
              <span className="claim-badge pending">⏳ Claim pending review</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                We'll email you when admins finish reviewing.
              </span>
            </div>
          )}
          {isAuthed && myStatus === 'rejected' && (
            <div className="claim-card-row">
              <span className="claim-badge rejected">Claim rejected{myClaim?.reject_reason ? ` — ${myClaim.reject_reason}` : ''}</span>
              <button type="button" className="claim-btn ghost" onClick={() => setShowClaim(true)}>
                Try again
              </button>
            </div>
          )}
          {isAuthed && (!myStatus || (myStatus !== 'pending' && myStatus !== 'rejected')) && (
            <button type="button" className="claim-btn primary" onClick={() => setShowClaim(true)}>
              Claim this business
            </button>
          )}
          {showClaim && (
            <ClaimSupplierModal
              supplier={supplier}
              onClose={() => setShowClaim(false)}
              onClaimed={onClaimed}
            />
          )}
        </>
      )}
    </div>
  );
}

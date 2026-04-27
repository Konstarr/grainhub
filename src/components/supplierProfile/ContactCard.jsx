import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { startConversation } from '../../lib/messagingDb.js';
import { CONTACT_INFO } from '../../data/supplierProfileData.js';

export default function ContactCard({ supplier }) {
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Real supplier values, fall back to demo when no supplier (legacy route).
  const name    = supplier?.name    || 'Blum';
  const website = supplier?.website || CONTACT_INFO.website;
  const phone   = supplier?.phone   || CONTACT_INFO.phone;
  const email   = supplier?.email   || CONTACT_INFO.email;
  const address = supplier?.address || CONTACT_INFO.address;
  const hours   = supplier?.hours   || CONTACT_INFO.hours;
  const ownerId = supplier?.claimed_by || null;

  const onSendMessage = async () => {
    if (!supplier) return;
    if (!isAuthed) { navigate(`/signup?next=/suppliers/${supplier.slug}`); return; }
    if (!ownerId) {
      // Not claimed: open mail client as a fallback.
      if (email) window.location.href = `mailto:${email}?subject=Inquiry%20-%20${encodeURIComponent(name)}`;
      else setErr("This business hasn't been claimed yet — try the email or phone above.");
      return;
    }
    if (ownerId === user?.id) { setErr("That's you."); return; }
    setBusy(true); setErr('');
    try {
      const { data, error } = await startConversation(ownerId);
      setBusy(false);
      if (error || !data?.id) { setErr(error?.message || 'Could not start conversation.'); return; }
      navigate(`/messages/${data.id}`);
    } catch (e) {
      setBusy(false);
      setErr(e?.message || 'Could not start conversation.');
    }
  };

  return (
    <div className="contact" id="contact">
      <div className="contact-head">
        <div className="contact-head-title">Contact {name}</div>
        <div className="contact-head-sub">
          {ownerId ? 'Verified business — message goes to the owner.' : 'Unclaimed listing — use the contact info below.'}
        </div>
      </div>
      <div className="contact-rows">
        {website && (
          <div className="cro">
            <span className="cro-icon">🌐</span>
            <div>
              <div className="cro-lbl">Website</div>
              <div className="cro-val">
                <a href={website.startsWith('http') ? website : 'https://' + website} target="_blank" rel="noreferrer">{website}</a>
              </div>
            </div>
          </div>
        )}
        {phone && (
          <div className="cro">
            <span className="cro-icon">📞</span>
            <div>
              <div className="cro-lbl">Phone</div>
              <div className="cro-val"><a href={`tel:${phone}`}>{phone}</a></div>
            </div>
          </div>
        )}
        {email && (
          <div className="cro">
            <span className="cro-icon">📧</span>
            <div>
              <div className="cro-lbl">Email</div>
              <div className="cro-val"><a href={`mailto:${email}`}>{email}</a></div>
            </div>
          </div>
        )}
        {address && (
          <div className="cro">
            <span className="cro-icon">📍</span>
            <div>
              <div className="cro-lbl">Address</div>
              <div className="cro-val">{address}</div>
            </div>
          </div>
        )}
        {hours && (
          <div className="cro">
            <span className="cro-icon">🕐</span>
            <div>
              <div className="cro-lbl">Hours</div>
              <div className="cro-val">{hours}</div>
            </div>
          </div>
        )}
      </div>
      {err && <div className="claim-error" style={{ margin: '10px 14px' }}>{err}</div>}
      <div className="contact-btns">
        <button className="cta1" type="button" onClick={onSendMessage} disabled={busy}>
          {busy ? 'Opening…' : (ownerId ? 'Send a message →' : 'Email this business →')}
        </button>
      </div>
    </div>
  );
}

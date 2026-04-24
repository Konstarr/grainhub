import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createCommunity } from '../lib/communityDb.js';
import '../styles/communities.css';

/**
 * /communities/new — create a community.
 *
 * Minimal first version: name + description + public/private + icon URL.
 * An inline image upload could be added later; for now a URL field
 * keeps it simple and works with any hosted image.
 */
export default function CommunityNew() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const canSubmit = name.trim().length >= 3 && !busy;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    const { data, error } = await createCommunity({ name, description, iconUrl, isPublic });
    setBusy(false);
    if (error || !data) { setErr(error?.message || 'Could not create community.'); return; }
    navigate(`/c/${data.slug}`, { replace: true });
  };

  return (
    <>
      <PageBack
        backTo="/communities"
        backLabel="Back to Communities"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Communities', to: '/communities' },
          { label: 'New' },
        ]}
      />

      <div className="comm-wrap" style={{ maxWidth: 720 }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
          Start a community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 1.5rem' }}>
          Give it a name and a short pitch. You'll be the owner and can invite
          mods after.
        </p>

        {!isAuthed ? (
          <div className="comm-empty">
            You need to <Link to="/login" style={{ color: 'var(--wood-warm)', fontWeight: 600 }}>sign in</Link> to start a community.
          </div>
        ) : (
          <form onSubmit={submit} className="comm-form">
            <label className="comm-field">
              <span className="comm-field-label">Community name *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cabinet Makers of Ontario"
                className="comm-input"
                maxLength={60}
                required
              />
              <span className="comm-field-hint">{name.length}/60 · at least 3 characters</span>
            </label>

            <label className="comm-field">
              <span className="comm-field-label">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this community about? Who should join?"
                className="comm-input"
                rows={4}
                maxLength={280}
              />
              <span className="comm-field-hint">{description.length}/280</span>
            </label>

            <label className="comm-field">
              <span className="comm-field-label">Icon URL (optional)</span>
              <input
                type="url"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://… (a square image works best)"
                className="comm-input"
              />
              <span className="comm-field-hint">Leave blank to use auto-generated initials.</span>
            </label>

            <label className="comm-toggle">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>
                <strong>Public</strong> · anyone can find and join this community
              </span>
            </label>

            {err && <div className="comm-error">{err}</div>}

            <div className="comm-form-actions">
              <Link to="/communities" className="comm-btn ghost">Cancel</Link>
              <button type="submit" className="comm-btn primary" disabled={!canSubmit}>
                {busy ? 'Creating…' : 'Create community'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

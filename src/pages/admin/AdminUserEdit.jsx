import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import CoverImageUploader from '../../components/admin/CoverImageUploader.jsx';
import { getProfile, updateProfileAdmin } from '../../lib/adminDb.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLE_OPTIONS = [
  { value: 'member',    label: 'Member' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin',     label: 'Admin' },
  { value: 'owner',     label: 'Owner' },
];

const TIER_OPTIONS = [
  { value: '',          label: '—' },
  { value: 'silver',    label: 'Silver' },
  { value: 'gold',      label: 'Gold' },
  { value: 'platinum',  label: 'Platinum' },
];

/**
 * /admin/users/:id — full edit form for any user profile.
 * Groups every permission / visibility / notification toggle into
 * clear sections. Admins (and owner) can write anything; moderators
 * only the moderation flags.
 */
export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [okMsg, setOkMsg]     = useState(null);
  const [form, setForm]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getProfile(id);
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message || 'User not found');
        setLoading(false);
        return;
      }
      setForm(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    // Don't try to write readonly / audit cols
    const patch = { ...form };
    delete patch.id;
    delete patch.created_at;
    delete patch.updated_at;
    delete patch.reputation;
    delete patch.post_count;
    delete patch.thread_count;
    delete patch.joined_at;
    // Normalize empty strings for tier
    if (patch.sponsor_tier === '') patch.sponsor_tier = null;
    const { data, error } = await updateProfileAdmin(id, patch);
    setSaving(false);
    if (error) { setError(error.message || 'Save failed'); return; }
    if (data) setForm(data);
    setOkMsg('Saved.');
    setTimeout(() => setOkMsg(null), 2500);
  };

  if (loading) {
    return (
      <AdminLayout title="Loading…">
        <div className="adm-card">Loading user…</div>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout title="User not found">
        <div className="adm-card">{error || 'No profile matched this id.'}</div>
      </AdminLayout>
    );
  }

  const displayName = form.full_name || form.username;

  return (
    <AdminLayout
      title={displayName}
      subtitle={'@' + form.username + ' · ' + (form.role || 'member')}
      actions={<Link to="/admin/users" className="adm-btn">← All users</Link>}
    >
      {error && <div className="adm-error" style={{ marginBottom: 12 }}>{error}</div>}
      {okMsg && <div className="adm-ok" style={{ marginBottom: 12 }}>{okMsg}</div>}

      {/* ------------- Identity ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Identity
        </div>
        <div className="adm-form-grid">
          <Field label="Username" value={form.username || ''} onChange={set('username')} />
          <Field label="Display name" value={form.full_name || ''} onChange={set('full_name')} />
          <Field label="Trade" value={form.trade || ''} onChange={set('trade')} />
          <Field label="Location" value={form.location || ''} onChange={set('location')} />
          <Field label="Website" value={form.website || ''} onChange={set('website')} full />
          <div className="adm-field full">
            <label className="adm-label">Bio</label>
            <textarea
              className="adm-input"
              style={{ fontFamily: 'inherit', minHeight: 90 }}
              value={form.bio || ''}
              onChange={(e) => set('bio')(e.target.value)}
            />
          </div>
          <div className="adm-field full">
            <label className="adm-label">Avatar image</label>
            <CoverImageUploader
              value={form.avatar_url || ''}
              onChange={(url) => set('avatar_url')(url)}
              folder="avatars"
            />
          </div>
        </div>
      </div>

      {/* ------------- Role + moderation ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Role &amp; moderation
        </div>
        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Role</label>
            <select className="adm-select" value={form.role || 'member'} onChange={(e) => set('role')(e.target.value)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value} disabled={r.value === 'owner' && !isOwner}>
                  {r.label}{r.value === 'owner' && !isOwner ? ' (owner only)' : ''}
                </option>
              ))}
            </select>
            <div className="adm-hint">Higher roles require extra caution — Owner can promote admins.</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <CheckRow label="Verified (blue check badge)"
                    desc="Appears as a trust marker on their profile and posts."
                    checked={!!form.is_verified} onChange={toggle('is_verified')} />
          <CheckRow label="Suspended"
                    desc="Blocks login and hides all content."
                    checked={!!form.is_suspended} onChange={toggle('is_suspended')} danger />
          <CheckRow label="Shadowbanned"
                    desc="Content is visible to the user but hidden from everyone else."
                    checked={!!form.is_shadowbanned} onChange={toggle('is_shadowbanned')} danger />
        </div>

        <div className="adm-field full" style={{ marginTop: 14 }}>
          <label className="adm-label">Internal moderator note</label>
          <textarea
            className="adm-input"
            style={{ fontFamily: 'inherit', minHeight: 70 }}
            value={form.mod_note || ''}
            onChange={(e) => set('mod_note')(e.target.value)}
            placeholder="Not visible to the user. Reason for suspension, warning history, etc."
          />
        </div>
      </div>

      {/* ------------- Content permissions ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Content permissions
        </div>
        <CheckRow label="Can post to forums"        checked={!!form.can_post_forums}      onChange={toggle('can_post_forums')} />
        <CheckRow label="Can create marketplace listings" checked={!!form.can_post_marketplace} onChange={toggle('can_post_marketplace')} />
        <CheckRow label="Can post jobs"             checked={!!form.can_post_jobs}        onChange={toggle('can_post_jobs')} />
        <CheckRow label="Can submit events"         checked={!!form.can_submit_events}    onChange={toggle('can_submit_events')} />
      </div>

      {/* ------------- Visibility ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Profile visibility
        </div>
        <CheckRow label="Profile is public"        checked={!!form.profile_public}      onChange={toggle('profile_public')} />
        <CheckRow label="Show on leaderboard"      checked={!!form.show_on_leaderboard} onChange={toggle('show_on_leaderboard')} />
        <CheckRow label="Show email to members"    checked={!!form.email_visible}       onChange={toggle('email_visible')} />
      </div>

      {/* ------------- Notifications ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Notifications
        </div>
        <CheckRow label="Email digest"         checked={!!form.email_digest}     onChange={toggle('email_digest')} />
        <CheckRow label="Notify on @mentions"  checked={!!form.notify_mentions}  onChange={toggle('notify_mentions')} />
        <CheckRow label="Notify on replies"    checked={!!form.notify_replies}   onChange={toggle('notify_replies')} />
        <CheckRow label="Newsletter opt-in"    checked={!!form.newsletter_optin} onChange={toggle('newsletter_optin')} />
      </div>

      {/* ------------- Sponsor ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Sponsor
        </div>
        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Tier</label>
            <select
              className="adm-select"
              value={form.sponsor_tier || ''}
              onChange={(e) => set('sponsor_tier')(e.target.value || null)}
            >
              {TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="adm-hint">
              Sets what ad slots this user's uploaded media can appear in.
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label">Sponsor company</label>
            <input
              type="text"
              className="adm-input"
              value={form.sponsor_company || ''}
              onChange={(e) => set('sponsor_company')(e.target.value)}
              placeholder="e.g. Blum North America"
            />
          </div>
          <div className="adm-field full">
            <label className="adm-label">Notes</label>
            <textarea
              className="adm-input"
              style={{ fontFamily: 'inherit', minHeight: 70 }}
              value={form.sponsor_notes || ''}
              onChange={(e) => set('sponsor_notes')(e.target.value)}
              placeholder="Contract dates, contact, renewal reminders."
            />
          </div>
          <div className="adm-field full">
            <Link to="/admin/sponsors" className="adm-btn">
              → Manage this sponsor&apos;s media
            </Link>
          </div>
        </div>
      </div>

      {/* ------------- Save ------------- */}
      <div className="adm-footer" style={{ marginTop: 12 }}>
        <div className="adm-timestamp">
          {form.created_at ? 'Joined ' + new Date(form.created_at).toLocaleDateString() : ''}
          {form.updated_at ? ' · updated ' + new Date(form.updated_at).toLocaleDateString() : ''}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="adm-btn" onClick={() => navigate('/admin/users')} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="adm-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, placeholder, full }) {
  return (
    <div className={'adm-field' + (full ? ' full' : '')}>
      <label className="adm-label">{label}</label>
      <input
        type="text"
        className="adm-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckRow({ label, desc, checked, onChange, danger }) {
  return (
    <label
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '9px 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: checked ? (danger ? '#fef2f2' : 'var(--wood-cream, #FBF6EC)') : 'var(--white)',
        marginBottom: 6,
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginTop: 2, accentColor: danger ? '#9c2b2b' : 'var(--wood-warm)' }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: danger && checked ? '#991b1b' : 'var(--text-primary)' }}>
          {label}
        </div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
    </label>
  );
}

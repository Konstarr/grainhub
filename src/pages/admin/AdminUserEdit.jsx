import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import CoverImageUploader from '../../components/admin/CoverImageUploader.jsx';
import SponsorMediaEditor from '../../components/admin/SponsorMediaEditor.jsx';
import {
  getProfile,
  updateProfileAdmin,
  fetchSubscriptionPacks,
  setSubscriptionPack,
  removeSubscriptionPack,
  fetchUserAdminActivity,
} from '../../lib/adminDb.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  INDIVIDUAL_TIERS,
  BUSINESS_TIERS,
  ROLE_PACKS,
  formatPrice,
} from '../../lib/pricing.js';

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
  const [packs, setPacks]     = useState({});
  const [activity, setActivity] = useState({ communities: [], threads: [], posts: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data, error }, packRes, act] = await Promise.all([
        getProfile(id),
        fetchSubscriptionPacks(id),
        fetchUserAdminActivity(id, { limit: 10 }),
      ]);
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message || 'User not found');
        setLoading(false);
        return;
      }
      setForm(data);
      setPacks(packRes.data || {});
      setActivity(act);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Pack mutations — write-through to DB so there's no "save" step to
  // remember. Simple and matches the sponsor_tier row-level feel.
  const handlePackChange = async (packSlug, tierSlug) => {
    if (!tierSlug) {
      const { error: e } = await removeSubscriptionPack(id, packSlug);
      if (e) { alert('Could not remove pack: ' + e.message); return; }
      setPacks((p) => { const n = { ...p }; delete n[packSlug]; return n; });
    } else {
      const { error: e } = await setSubscriptionPack(id, packSlug, tierSlug);
      if (e) { alert('Could not set pack: ' + e.message); return; }
      setPacks((p) => ({ ...p, [packSlug]: tierSlug }));
    }
  };

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

      <div className="adm-user-grid">

      {/* ------------- Account type (admin override) ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Account type
        </div>
        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Type</label>
            <select
              className="adm-select"
              value={form.account_type || 'individual'}
              onChange={(e) => {
                const next = e.target.value;
                const prev = form.account_type || 'individual';
                if (next !== prev) {
                  const warn = next === 'individual'
                    ? 'Converting this account back to an individual will clear its sponsor tier and hide its business fields. Continue?'
                    : 'Promoting this account to a business will unlock sponsor + ad features. You can fill in business details below after saving. Continue?';
                  if (!confirm(warn)) return;
                }
                setForm((f) => {
                  const patch = { ...f, account_type: next };
                  // Clear sponsor tier when dropping back to individual
                  // (DB constraint would reject the save anyway).
                  if (next === 'individual') patch.sponsor_tier = null;
                  return patch;
                });
              }}
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
            <div className="adm-hint">
              Admin override. Normal users can&apos;t switch — this is here so you can promote a test
              account to a business or fix mis-categorised signups. Don&apos;t forget to save.
            </div>
          </div>
          <div className="adm-field">
            <div style={{
              padding: '0.7rem 0.9rem',
              background: form.account_type === 'business' ? '#E6F1FB' : 'var(--wood-cream, #FBF6EC)',
              border: '1px solid ' + (form.account_type === 'business' ? '#BFDCEF' : 'var(--border)'),
              borderRadius: 10, fontSize: 12.5, lineHeight: 1.55,
              color: form.account_type === 'business' ? '#185FA5' : 'var(--text-secondary)',
            }}>
              <strong style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                {form.account_type === 'business' ? 'Business account' : 'Individual account'}
              </strong>
              <div style={{ marginTop: 4 }}>
                {form.account_type === 'business'
                  ? 'Eligible for sponsorship + ads. Appears with a business chip anywhere on the site.'
                  : 'Personal account — can post, buy and sell, but not run ads or hold a sponsor tier.'}
              </div>
            </div>
          </div>
        </div>
      </div>

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
              noUrl
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

      {/* ------------- Business details (only for business accounts) ------------- */}
      {form.account_type === 'business' && (
        <div className="adm-card">
          <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
            Business details
          </div>
          <div className="adm-form-grid">
            <Field label="Business name"   value={form.business_name || ''}           onChange={set('business_name')} />
            <Field label="Website"         value={form.business_website || ''}        onChange={set('business_website')} />
            <Field label="Contact email"   value={form.business_contact_email || ''}  onChange={set('business_contact_email')} />
            <Field label="Phone"           value={form.business_phone || ''}          onChange={set('business_phone')} />
            <div className="adm-field">
              <label className="adm-label">Primary trade</label>
              <select className="adm-select" value={form.business_trade || ''} onChange={(e) => set('business_trade')(e.target.value)}>
                <option value="">—</option>
                <option>Cabinetmaking</option>
                <option>Millwork</option>
                <option>Flooring</option>
                <option>Finishing</option>
                <option>CNC</option>
                <option>Supply / Distribution</option>
                <option>General</option>
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Company size</label>
              <select className="adm-select" value={form.business_size || ''} onChange={(e) => set('business_size')(e.target.value)}>
                <option value="">—</option>
                <option value="1-9">1 – 9</option>
                <option value="10-49">10 – 49</option>
                <option value="50-249">50 – 249</option>
                <option value="250+">250+</option>
              </select>
            </div>
          </div>
          <CheckRow
            label="Business verified"
            desc="Confirms the business has been checked by staff. Shows a trust marker on their listings and ads."
            checked={!!form.business_verified}
            onChange={toggle('business_verified')}
          />
        </div>
      )}

      {/* ------------- Sponsor (business accounts only) ------------- */}
      <div className="adm-card">
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Plan &amp; packs
        </div>

        {/* Membership tier picker — applies to both account types. */}
        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-label">Membership tier</label>
            <select
              className="adm-select"
              value={form.membership_tier || 'free'}
              onChange={(e) => set('membership_tier')(e.target.value)}
            >
              {(form.account_type === 'business' ? BUSINESS_TIERS : INDIVIDUAL_TIERS).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.priceMonthly != null ? '(' + formatPrice(t.priceMonthly) + (t.priceMonthly > 0 ? '/mo' : '') + ')' : ''}
                </option>
              ))}
            </select>
            <div className="adm-hint">
              {form.account_type === 'business'
                ? 'Business-tier features: job posting caps, employee seats, analytics.'
                : 'Individual-tier features: forum posting, marketplace caps, ad-free browsing.'}
            </div>
          </div>
        </div>

        {/* Role packs — business accounts only */}
        {form.account_type === 'business' && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-primary)', marginBottom: 10 }}>
              Role packs
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {ROLE_PACKS.map((pack) => {
                const currentTier = packs[pack.id] || '';
                return (
                  <div key={pack.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 200px',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: currentTier ? '#FDFBF5' : 'transparent',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {pack.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {pack.forPersona}
                      </div>
                    </div>
                    <select
                      className="adm-select"
                      value={currentTier}
                      onChange={(e) => handlePackChange(pack.id, e.target.value || null)}
                    >
                      <option value="">— inactive —</option>
                      {pack.tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.priceMonthly != null ? '(' + formatPrice(t.priceMonthly) + '/mo)' : '(custom)'}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="adm-hint" style={{ marginTop: 8 }}>
              Pack changes save immediately. Removing a pack revokes its features at the next page load.
            </div>
          </div>
        )}
      </div>

      <div className="adm-card" style={{ padding: '1rem 1.25rem', marginBottom: 16 }}>
        <div className="adm-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 }}>
          Sponsor
        </div>

        {form.account_type !== 'business' ? (
          <div className="adm-empty" style={{ marginTop: 0 }}>
            Sponsorship is only available to business accounts. This user is an individual.
            {/* Admins can still change account_type if needed */}
          </div>
        ) : (
          <>
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
                  Sets what ad slots this sponsor&apos;s media can appear in.
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Sponsor company (display)</label>
                <input
                  type="text"
                  className="adm-input"
                  value={form.sponsor_company || ''}
                  onChange={(e) => set('sponsor_company')(e.target.value)}
                  placeholder="Leave blank to use Business name"
                />
              </div>
              <div className="adm-field full">
                <label className="adm-label">Internal notes</label>
                <textarea
                  className="adm-input"
                  style={{ fontFamily: 'inherit', minHeight: 70 }}
                  value={form.sponsor_notes || ''}
                  onChange={(e) => set('sponsor_notes')(e.target.value)}
                  placeholder="Contract dates, contact, renewal reminders."
                />
              </div>
            </div>

            {form.sponsor_tier && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Ad placements &amp; media
                </div>
                <SponsorMediaEditor ownerId={form.id} tier={form.sponsor_tier} />
              </div>
            )}
          </>
        )}
      </div>

      </div>

      <ActivityPanel activity={activity} />

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

function ActivityPanel({ activity }) {
  const { communities, threads, posts } = activity || {};
  const total = (communities?.length || 0) + (threads?.length || 0) + (posts?.length || 0);
  if (total === 0) {
    return (
      <div className="adm-card adm-activity">
        <div className="adm-activity-title">Activity</div>
        <div className="adm-empty" style={{ marginTop: 0 }}>
          No communities owned, threads, or posts yet.
        </div>
      </div>
    );
  }
  return (
    <div className="adm-card adm-activity">
      <div className="adm-activity-title">Activity</div>
      <div className="adm-activity-grid">
        <div>
          <div className="adm-activity-h">Communities owned ({communities.length})</div>
          {communities.length === 0 ? (
            <div className="adm-activity-empty">None</div>
          ) : (
            <ul className="adm-activity-list">
              {communities.map((c) => (
                <li key={c.id}>
                  <Link to={`/c/${c.slug}`} target="_blank" className="adm-activity-link">{c.name}</Link>
                  <span className="adm-activity-meta">{c.member_count || 0} members</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="adm-activity-h">Recent threads ({threads.length})</div>
          {threads.length === 0 ? (
            <div className="adm-activity-empty">No threads</div>
          ) : (
            <ul className="adm-activity-list">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link to={`/forums/thread/${t.slug}`} target="_blank" className="adm-activity-link">
                    {t.title}
                  </Link>
                  <span className="adm-activity-meta">
                    {t.reply_count || 0} replies · {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="adm-activity-h">Recent posts ({posts.length})</div>
          {posts.length === 0 ? (
            <div className="adm-activity-empty">No posts</div>
          ) : (
            <ul className="adm-activity-list">
              {posts.map((p) => (
                <li key={p.id}>
                  {p.thread?.slug ? (
                    <Link to={`/forums/thread/${p.thread.slug}`} target="_blank" className="adm-activity-link">
                      {(p.body || '').replace(/\s+/g, ' ').slice(0, 70) || '(empty)'}
                    </Link>
                  ) : (
                    <span>{(p.body || '').replace(/\s+/g, ' ').slice(0, 70)}</span>
                  )}
                  <span className="adm-activity-meta">
                    {p.is_deleted ? 'deleted · ' : ''}{new Date(p.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
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

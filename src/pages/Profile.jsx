import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import ReportModal from '../components/shared/ReportModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchProfileByHandle,
  fetchProfileBadges,
  fetchRecentThreadsByAuthor,
  updateOwnProfile,
} from '../lib/forumDb.js';

/**
 * /profile/:handle
 *
 * Public profile page: avatar, display name, bio, trade, location, website,
 * reputation, post count, thread count, joined date, badges, recent threads.
 *
 * If the logged-in user is viewing their own profile, an "Edit profile"
 * affordance reveals inline editing for bio / trade / location / website /
 * full_name / avatar_url. Username is not editable here.
 */
export default function Profile() {
  const { handle } = useParams();
  const { user, profile: mySelf, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState(null);
  const [form, setForm] = useState({ full_name: '', bio: '', trade: '', location: '', website: '', avatar_url: '' });

  const isMe = useMemo(
    () => !!profile && !!mySelf && profile.id === mySelf.id,
    [profile, mySelf]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const { data } = await fetchProfileByHandle(handle);
      if (cancelled) return;
      if (!data) {
        setProfile(null);
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        trade: data.trade || '',
        location: data.location || '',
        website: data.website || '',
        avatar_url: data.avatar_url || '',
      });
      const [{ data: b }, { data: t }] = await Promise.all([
        fetchProfileBadges(data.id),
        fetchRecentThreadsByAuthor(data.id, 10),
      ]);
      if (cancelled) return;
      setBadges(b || []);
      setThreads(t || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [handle]);

  const initials = (profile?.full_name || profile?.username || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const joined = profile?.joined_at || profile?.created_at;
  const joinedStr = joined ? new Date(joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : '';

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setEditBusy(true);
    setEditErr(null);
    const { data, error } = await updateOwnProfile(user.id, form);
    if (error) {
      setEditErr(error.message || 'Failed to save profile.');
      setEditBusy(false);
      return;
    }
    // Re-fetch the summary view so reputation/badge_count stay accurate.
    const { data: fresh } = await fetchProfileByHandle(profile.username);
    if (fresh) setProfile(fresh);
    if (refreshProfile) refreshProfile();
    setEditing(false);
    setEditBusy(false);
  };

  if (loading) {
    return (
      <>
        <PageBack backTo="/forums" backLabel="Back to Forums" crumbs={[{ label: 'Home', to: '/' }, { label: 'Forums', to: '/forums' }, { label: 'Profile' }]} />
        <div className="main-wrap"><div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading profile...</div></div>
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <PageBack backTo="/forums" backLabel="Back to Forums" crumbs={[{ label: 'Home', to: '/' }, { label: 'Forums', to: '/forums' }, { label: 'Profile' }]} />
        <div className="main-wrap">
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)', marginBottom: 8 }}>
              Member not found
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We couldn&apos;t find a profile with handle &quot;{handle}&quot;.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBack
        backTo="/forums"
        backLabel="Back to Forums"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: profile.full_name || profile.username },
        ]}
      />

      <div className="main-wrap">
        <div>
          {/* HEADER CARD */}
          <div style={headerCardStyle}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={avatarStyle(profile.avatar_url)}>
                {!profile.avatar_url && initials}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, margin: 0, color: 'var(--text-primary)' }}>
                    {profile.full_name || profile.username}
                  </h1>
                  <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>@{profile.username}</span>
                </div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, color: 'var(--text-muted)', fontSize: 14 }}>
                  {profile.trade && <span>🪵 {profile.trade}</span>}
                  {profile.location && <span>📍 {profile.location}</span>}
                  {joinedStr && <span>📅 Joined {joinedStr}</span>}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--wood-warm)' }}>
                      🔗 {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}
                </div>

                {profile.bio && !editing && (
                  <p style={{ marginTop: 12, color: 'var(--text-primary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {profile.bio}
                  </p>
                )}

                {!editing && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    {isMe ? (
                      <button type="button" style={pillBtn('solid')} onClick={() => setEditing(true)}>
                        Edit profile
                      </button>
                    ) : (
                      <button type="button" style={pillBtn('ghost')} onClick={() => setReportOpen(true)}>
                        Report member
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* STATS COLUMN */}
              <div style={{ display: 'flex', gap: 18, marginLeft: 'auto' }}>
                <Stat label="Reputation" value={profile.reputation || 0} highlight />
                <Stat label="Posts" value={profile.post_count || 0} />
                <Stat label="Threads" value={profile.thread_count || 0} />
              </div>
            </div>

            {/* EDIT FORM */}
            {editing && (
              <form onSubmit={handleSaveEdit} style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Display name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                  <Field label="Trade" value={form.trade} onChange={(v) => setForm({ ...form, trade: v })} placeholder="Cabinetmaker, Millwork Installer..." />
                  <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Portland, OR" />
                  <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://..." />
                  <Field label="Avatar URL" value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} placeholder="https://..." full />
                  <Field label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} textarea rows={4} full />
                </div>
                {editErr && (
                  <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: 13, marginTop: 12 }}>
                    {editErr}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                  <button type="button" style={pillBtn('ghost')} onClick={() => setEditing(false)} disabled={editBusy}>
                    Cancel
                  </button>
                  <button type="submit" style={pillBtn('solid')} disabled={editBusy}>
                    {editBusy ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* BADGES */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Badges</h2>
            {badges.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No badges yet. Earn them by posting threads, helping others, and getting upvoted.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {badges.map((row) => {
                  const b = row.badge || {};
                  return (
                    <div key={b.id || Math.random()} style={badgeCardStyle(b.tier)}>
                      <div style={{ fontSize: 28, lineHeight: 1 }}>{b.icon || '🏆'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{b.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RECENT THREADS */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Recent threads</h2>
            {threads.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {isMe ? "You haven't started any threads yet." : `${profile.full_name || profile.username} hasn't started any threads yet.`}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {threads.map((t) => (
                  <Link
                    key={t.id}
                    to={t.slug ? '/forums/thread/' + t.slug : '/forums'}
                    style={threadRowStyle}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.last_reply_at ? new Date(t.last_reply_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>▲ {t.upvote_count || 0}</span>
                      <span>💬 {t.reply_count || 0}</span>
                      <span>👁 {t.view_count || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — quick meta */}
        <aside className="right-col">
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>About</h2>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              <div><strong>@{profile.username}</strong></div>
              {profile.trade && <div style={{ color: 'var(--text-muted)' }}>{profile.trade}</div>}
              {profile.location && <div style={{ color: 'var(--text-muted)' }}>{profile.location}</div>}
              {joinedStr && <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>Member since {joinedStr}</div>}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Contribution</h2>
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              <Row label="Reputation" value={profile.reputation || 0} />
              <Row label="Posts" value={profile.post_count || 0} />
              <Row label="Threads started" value={profile.thread_count || 0} />
              <Row label="Badges earned" value={badges.length} />
            </div>
          </div>
        </aside>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="profile"
        targetId={profile.id}
      />
    </>
  );
}

// ---------------- presentation helpers ----------------

function Stat({ label, value, highlight }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 70 }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 26,
        color: highlight ? 'var(--wood-warm, #8A5030)' : 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{Number(value || 0).toLocaleString()}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, rows = 3, full }) {
  const common = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontFamily: 'inherit',
    fontSize: 14,
    background: 'var(--white, #fff)',
  };
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...common, resize: 'vertical' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={common} />
      )}
    </div>
  );
}

// ---------------- styles ----------------

const headerCardStyle = {
  background: 'var(--white, #fff)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1.5rem',
  marginBottom: 16,
};

const cardStyle = {
  background: 'var(--white, #fff)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1.25rem',
  marginBottom: 16,
};

const sectionTitleStyle = {
  fontFamily: "'DM Serif Display', serif",
  fontSize: 20,
  color: 'var(--text-primary)',
  margin: '0 0 12px 0',
  paddingBottom: 8,
  borderBottom: '2px solid var(--border)',
};

function avatarStyle(url) {
  const base = {
    width: 96,
    height: 96,
    borderRadius: '50%',
    background: url ? `url(${url}) center/cover no-repeat` : 'linear-gradient(135deg,#4A2A12,#8A5030)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Serif Display', serif",
    fontSize: 36,
    flexShrink: 0,
  };
  return base;
}

function badgeCardStyle(tier) {
  const tierBg = {
    bronze: 'linear-gradient(135deg, #f7e4cc, #e5c097)',
    silver: 'linear-gradient(135deg, #eaeaea, #c8c8c8)',
    gold:   'linear-gradient(135deg, #fff1c2, #f0c64a)',
  }[tier] || 'var(--wood-cream, #f5ead6)';
  return {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: '0.7rem 0.9rem',
    borderRadius: 10,
    background: tierBg,
    border: '1px solid var(--border)',
  };
}

const threadRowStyle = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  padding: '0.7rem 0.85rem',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--wood-cream, #FBF6EC)',
  textDecoration: 'none',
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

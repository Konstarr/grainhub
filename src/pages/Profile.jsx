import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import ReportModal from '../components/shared/ReportModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchProfileByHandle,
  fetchProfileBadges,
  fetchRecentThreadsByAuthor,
  updateOwnProfile,
} from '../lib/forumDb.js';
import '../styles/profile.css';

/**
 * /profile/:handle
 *
 * Public profile — hero banner + avatar, info chips, stats strip,
 * tabbed content (Overview / Threads / Badges), inline edit for own profile.
 */
export default function Profile() {
  const { handle } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile: mySelf, refreshProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [tab, setTab] = useState('overview'); // overview | threads | badges

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState(null);
  const [form, setForm] = useState({
    full_name: '', bio: '', trade: '', location: '', website: '', avatar_url: '',
  });

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
        fetchRecentThreadsByAuthor(data.id, 25),
      ]);
      if (cancelled) return;
      setBadges(b || []);
      setThreads(t || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [handle]);

  // Auto-open edit when Nav sends here via ?edit=1
  useEffect(() => {
    if (searchParams.get('edit') === '1' && isMe && !editing) {
      setEditing(true);
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, isMe, editing, setSearchParams]);

  const initials = (profile?.full_name || profile?.username || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const joined = profile?.joined_at || profile?.created_at;
  const joinedStr = joined
    ? new Date(joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '';
  const joinedYear = joined ? new Date(joined).getFullYear() : '';

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setEditBusy(true);
    setEditErr(null);
    const { error } = await updateOwnProfile(user.id, form);
    if (error) {
      setEditErr(error.message || 'Failed to save profile.');
      setEditBusy(false);
      return;
    }
    const { data: fresh } = await fetchProfileByHandle(profile.username);
    if (fresh) setProfile(fresh);
    if (refreshProfile) refreshProfile();
    setEditing(false);
    setEditBusy(false);
  };

  if (loading) {
    return (
      <>
        <PageBack
          backTo="/forums"
          backLabel="Back to Forums"
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Forums', to: '/forums' }, { label: 'Profile' }]}
        />
        <div className="profile-wrap">
          <div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading profile…</div>
        </div>
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <PageBack
          backTo="/forums"
          backLabel="Back to Forums"
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Forums', to: '/forums' }, { label: 'Profile' }]}
        />
        <div className="profile-wrap">
          <div className="pf-empty" style={{ padding: '3.5rem 1rem' }}>
            <div className="pf-empty-title">Member not found</div>
            <div>We could not find a profile with handle &ldquo;{handle}&rdquo;.</div>
          </div>
        </div>
      </>
    );
  }

  const websiteLabel = profile.website
    ? profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : '';

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

      <div className="profile-wrap">

        {/* ---------- HERO ---------- */}
        <div className="pf-hero">
          <div className="pf-cover" aria-hidden="true" />

          <div className="pf-hero-body">
            <div className="pf-avatar-frame">
              <div className="pf-avatar">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" />
                  : initials}
              </div>
            </div>

            <div className="pf-head">
              <div className="pf-identity">
                <div className="pf-displayname">
                  <h1 className="pf-name">{profile.full_name || profile.username}</h1>
                  <span className="pf-handle">@{profile.username}</span>
                </div>

                <div className="pf-chips">
                  {profile.trade && <span className="pf-chip"><IconTrade /> {profile.trade}</span>}
                  {profile.location && <span className="pf-chip"><IconPin /> {profile.location}</span>}
                  {joinedStr && <span className="pf-chip"><IconCal /> Joined {joinedStr}</span>}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="pf-chip pf-chip-link"
                    >
                      <IconLink /> {websiteLabel}
                    </a>
                  )}
                </div>
              </div>

              <div className="pf-actions">
                {isMe ? (
                  <>
                    <button type="button" className="pf-btn primary" onClick={() => setEditing((v) => !v)}>
                      {editing ? 'Close' : 'Edit profile'}
                    </button>
                    <Link to="/forums/new" className="pf-btn">New thread</Link>
                  </>
                ) : (
                  <>
                    <button type="button" className="pf-btn" disabled title="Coming soon">
                      Message
                    </button>
                    <button type="button" className="pf-btn ghost-danger" onClick={() => setReportOpen(true)}>
                      Report
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats strip */}
            <div className="pf-stats">
              <StatCell label="Reputation" value={profile.reputation || 0} accent sub="community score" />
              <StatCell label="Threads" value={profile.thread_count || 0} sub="started" />
              <StatCell label="Replies" value={profile.post_count || 0} sub="posts" />
              <StatCell label="Badges" value={badges.length} sub="earned" />
            </div>

            {/* Edit form */}
            {editing && isMe && (
              <form onSubmit={handleSaveEdit} className="pf-edit">
                <div className="pf-edit-grid">
                  <Field label="Display name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                  <Field label="Trade" value={form.trade} onChange={(v) => setForm({ ...form, trade: v })} placeholder="Cabinetmaker, Millwork Installer…" />
                  <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Portland, OR" />
                  <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://…" />
                  <Field label="Avatar URL" full value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} placeholder="https://…" />
                  <Field label="Bio" full textarea rows={4} value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} placeholder="Tell the community who you are and what you do…" />
                </div>
                {editErr && <div className="pf-error">{editErr}</div>}
                <div className="pf-edit-actions">
                  <button type="button" className="pf-btn" disabled={editBusy} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="pf-btn primary" disabled={editBusy}>
                    {editBusy ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ---------- TABS ---------- */}
        <div className="pf-tabs">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={tab === 'threads'} onClick={() => setTab('threads')}>
            Threads <span className="pf-tab-count">{threads.length}</span>
          </TabButton>
          <TabButton active={tab === 'badges'} onClick={() => setTab('badges')}>
            Badges <span className="pf-tab-count">{badges.length}</span>
          </TabButton>
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="pf-grid">
          <div>
            {tab === 'overview' && (
              <>
                <div className="pf-card">
                  <div className="pf-card-title">About</div>
                  {profile.bio ? (
                    <p className="pf-bio">{profile.bio}</p>
                  ) : (
                    <p className="pf-bio muted">
                      {isMe
                        ? "You haven't written a bio yet. Click Edit profile to introduce yourself."
                        : (profile.full_name || profile.username) + " hasn't added a bio yet."}
                    </p>
                  )}
                </div>

                <div className="pf-card">
                  <div className="pf-card-title">
                    <span>Recent threads</span>
                    {threads.length > 5 && (
                      <button type="button" className="pf-card-link" onClick={() => setTab('threads')}>
                        See all →
                      </button>
                    )}
                  </div>
                  <ThreadList items={threads.slice(0, 5)} emptyIsMe={isMe} profile={profile} />
                </div>

                <div className="pf-card">
                  <div className="pf-card-title">
                    <span>Featured badges</span>
                    {badges.length > 6 && (
                      <button type="button" className="pf-card-link" onClick={() => setTab('badges')}>
                        See all →
                      </button>
                    )}
                  </div>
                  <BadgesGrid items={badges.slice(0, 6)} isMe={isMe} />
                </div>
              </>
            )}

            {tab === 'threads' && (
              <div className="pf-card">
                <div className="pf-card-title">All threads ({threads.length})</div>
                <ThreadList items={threads} emptyIsMe={isMe} profile={profile} />
              </div>
            )}

            {tab === 'badges' && (
              <div className="pf-card">
                <div className="pf-card-title">Badges ({badges.length})</div>
                <BadgesGrid items={badges} isMe={isMe} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="pf-card">
              <div className="pf-card-title">Contribution</div>
              <div>
                <div className="pf-row"><span className="pf-row-label">Reputation</span><span className="pf-row-value">{(profile.reputation || 0).toLocaleString()}</span></div>
                <div className="pf-row"><span className="pf-row-label">Threads started</span><span className="pf-row-value">{(profile.thread_count || 0).toLocaleString()}</span></div>
                <div className="pf-row"><span className="pf-row-label">Replies posted</span><span className="pf-row-value">{(profile.post_count || 0).toLocaleString()}</span></div>
                <div className="pf-row"><span className="pf-row-label">Badges</span><span className="pf-row-value">{badges.length}</span></div>
                {joinedYear && (
                  <div className="pf-row"><span className="pf-row-label">Member since</span><span className="pf-row-value">{joinedYear}</span></div>
                )}
              </div>
            </div>

            {isMe && (
              <div className="pf-card">
                <div className="pf-card-title">Quick links</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <Link to="/forums?view=subscriptions" className="pf-btn" style={{ justifyContent: 'center' }}>My subscriptions</Link>
                  <Link to="/forums?view=my-posts" className="pf-btn" style={{ justifyContent: 'center' }}>My posts</Link>
                  <Link to="/forums/new" className="pf-btn primary" style={{ justifyContent: 'center' }}>Start a thread</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
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

/* ================= Subcomponents ================= */

function TabButton({ active, onClick, children }) {
  return (
    <button type="button" className={'pf-tab ' + (active ? 'active' : '')} onClick={onClick}>
      {children}
    </button>
  );
}

function StatCell({ label, value, sub, accent }) {
  return (
    <div className={'pf-stat ' + (accent ? 'pf-stat-accent' : '')}>
      <div className="pf-stat-value">{Number(value || 0).toLocaleString()}</div>
      <div className="pf-stat-label">{label}</div>
      {sub && <div className="pf-stat-sub">{sub}</div>}
    </div>
  );
}

function ThreadList({ items, emptyIsMe, profile }) {
  if (!items || items.length === 0) {
    return (
      <div className="pf-empty">
        <div className="pf-empty-title">
          {emptyIsMe ? "You haven't started any threads yet." : (profile?.full_name || profile?.username || 'This member') + " hasn't started any threads yet."}
        </div>
        {emptyIsMe && (
          <div style={{ marginTop: 10 }}>
            <Link to="/forums/new" className="pf-btn primary" style={{ display: 'inline-flex' }}>
              Start your first thread
            </Link>
          </div>
        )}
      </div>
    );
  }
  return (
    <div>
      {items.map((t) => (
        <Link
          key={t.id}
          to={t.slug ? '/forums/thread/' + t.slug : '/forums'}
          className="pf-thread"
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pf-thread-title">{t.title}</div>
            <div className="pf-thread-sub">
              {t.last_reply_at ? 'Last reply ' + new Date(t.last_reply_at).toLocaleDateString() : 'recently'}
            </div>
          </div>
          <div className="pf-thread-stats">
            <span className="pf-thread-stat"><IconArrow /> {t.upvote_count || 0}</span>
            <span className="pf-thread-stat"><IconReply /> {t.reply_count || 0}</span>
            <span className="pf-thread-stat"><IconEye /> {t.view_count || 0}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BadgesGrid({ items, isMe }) {
  if (!items || items.length === 0) {
    return (
      <div className="pf-empty">
        <div className="pf-empty-title">No badges yet</div>
        <div>
          {isMe
            ? 'Earn badges by posting threads, helping others, and racking up upvotes.'
            : 'Keep checking back — badges are earned over time.'}
        </div>
      </div>
    );
  }
  return (
    <div className="pf-badges">
      {items.map((row) => {
        const b = row.badge || {};
        return (
          <div key={b.id || Math.random()} className={'pf-badge tier-' + (b.tier || 'bronze')}>
            <div className="pf-badge-icon">{b.icon || '🏅'}</div>
            <div>
              <div className="pf-badge-name">{b.name || 'Badge'}</div>
              <div className="pf-badge-desc">{b.description || ''}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, rows = 3, full }) {
  return (
    <div className={'pf-field' + (full ? ' full' : '')}>
      <label className="pf-field-label">{label}</label>
      {textarea ? (
        <textarea
          className="pf-field-textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="pf-field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

/* ---------- Inline icons (no extra dep) ---------- */
const svgProps = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
function IconTrade() { return (<svg {...svgProps}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9L6.1 20l-3.2-3.2 8.6-8.6A6 6 0 0 1 19.4 0l-4.7 4.7z"/></svg>); }
function IconPin()   { return (<svg {...svgProps}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>); }
function IconCal()   { return (<svg {...svgProps}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>); }
function IconLink()  { return (<svg {...svgProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>); }
function IconArrow() { return (<svg {...svgProps}><polyline points="18 15 12 9 6 15"/></svg>); }
function IconReply() { return (<svg {...svgProps}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>); }
function IconEye()   { return (<svg {...svgProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>); }

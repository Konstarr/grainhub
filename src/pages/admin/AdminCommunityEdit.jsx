import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  adminGetCommunity,
  adminListCommunityMembers,
  adminSetCommunityOwner,
  adminSetMemberRole,
  adminRemoveMember,
  adminSearchProfilesForCommunity,
} from '../../lib/communityAdminDb.js';

/**
 * /admin/communities/:id - manage leadership for one community.
 *
 * Site admins can:
 *   - Promote / demote any member between member <-> mod
 *   - Transfer ownership to any existing member (or install a new
 *     owner from any GrainHub profile via the search picker)
 *   - Remove a member (except the owner, who must be transferred first)
 */
export default function AdminCommunityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);

  // Search state for the "install new owner" picker
  const [ownerQ, setOwnerQ] = useState('');
  const [ownerHits, setOwnerHits] = useState([]);
  const [ownerBusy, setOwnerBusy] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    const [c, m] = await Promise.all([
      adminGetCommunity(id),
      adminListCommunityMembers(id),
    ]);
    if (c.error) setErr(c.error.message || 'Could not load community');
    setCommunity(c.data || null);
    setMembers(m.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Live profile search for the install-owner picker
  useEffect(() => {
    const q = ownerQ.trim();
    if (q.length < 2) { setOwnerHits([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await adminSearchProfilesForCommunity(q);
      if (!cancelled) setOwnerHits(data || []);
    })();
    return () => { cancelled = true; };
  }, [ownerQ]);

  const owner = useMemo(
    () => members.find((m) => m.role === 'owner') || null,
    [members]
  );
  const mods    = useMemo(() => members.filter((m) => m.role === 'mod'), [members]);
  const regular = useMemo(() => members.filter((m) => m.role === 'member'), [members]);

  const handleSetRole = async (profileId, newRole) => {
    setBusyId(profileId); setErr(null);
    const { error } = await adminSetMemberRole(id, profileId, newRole);
    setBusyId(null);
    if (error) { setErr(error.message || 'Could not change role'); return; }
    await load();
  };

  const handleRemove = async (profileId, name) => {
    if (!confirm('Remove ' + (name || 'this member') + ' from the community? This cannot be undone.')) return;
    setBusyId(profileId); setErr(null);
    const { error } = await adminRemoveMember(id, profileId);
    setBusyId(null);
    if (error) { setErr(error.message || 'Could not remove member'); return; }
    await load();
  };

  const handleTransfer = async (profileId, name) => {
    if (!confirm('Transfer ownership to ' + (name || 'this member') + '? The current owner will be demoted to mod.')) return;
    setBusyId(profileId); setErr(null);
    const { error } = await adminSetCommunityOwner(id, profileId);
    setBusyId(null);
    if (error) { setErr(error.message || 'Could not transfer ownership'); return; }
    await load();
  };

  const handleInstallOwner = async (profile) => {
    if (!confirm('Install ' + (profile.full_name || profile.username) + ' as owner of this community? They will be added if not yet a member, and the current owner will be demoted to mod.')) return;
    setOwnerBusy(true); setErr(null);
    const { error } = await adminSetCommunityOwner(id, profile.id);
    setOwnerBusy(false);
    if (error) { setErr(error.message || 'Could not install owner'); return; }
    setOwnerQ(''); setOwnerHits([]);
    await load();
  };

  if (loading) {
    return (
      <AdminLayout title="Community" subtitle="Loading...">
        <div className="adm-card" style={{ padding: '2rem' }}>Loading community...</div>
      </AdminLayout>
    );
  }
  if (!community) {
    return (
      <AdminLayout title="Community" subtitle="Not found">
        <div className="adm-card" style={{ padding: '2rem' }}>
          Community not found. <Link to="/admin/communities">Back to communities</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={community.name}
      subtitle={'Slug: /c/' + community.slug + ' . ' + (community.member_count || 0) + ' members'}
      actions={
        <Link to={'/c/' + community.slug} className="adm-btn" target="_blank" rel="noreferrer">
          Open public page
        </Link>
      }
    >
      {err && <div className="adm-error" style={{ marginBottom: 16 }}>{err}</div>}

      {/* Owner section */}
      <div className="adm-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wood-warm)', marginBottom: '0.5rem' }}>
          Current owner
        </div>
        {owner ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MemberAvatar profile={owner.profile} size={42}/>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {owner.profile?.full_name || owner.profile?.username || 'Unknown'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  @{owner.profile?.username} {owner.profile?.business_name ? '. ' + owner.profile.business_name : ''}
                </div>
              </div>
            </div>
            <Link to={'/admin/users/' + owner.profile_id} className="adm-btn">
              View profile
            </Link>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>This community has no owner.</div>
        )}

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light, #e8d8c0)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: '0.4rem' }}>Install a new owner</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Search any GrainHub member. They will be added to the community at owner-level if they are not already a member; the current owner will be demoted to mod.
          </div>
          <input
            type="text"
            placeholder="Search by username or full name..."
            value={ownerQ}
            onChange={(e) => setOwnerQ(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
          />
          {ownerHits.length > 0 && (
            <div style={{ marginTop: 6, border: '1px solid var(--border-light, #e8d8c0)', borderRadius: 6, overflow: 'hidden' }}>
              {ownerHits.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={ownerBusy}
                  onClick={() => handleInstallOwner(p)}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: '0.6rem',
                    padding: '0.55rem 0.75rem', background: '#fff',
                    border: 'none', borderBottom: '1px solid #f0e6d2',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <MemberAvatar profile={p} size={28}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.full_name || p.username}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>@{p.username}</div>
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--wood-warm)', fontWeight: 700 }}>Install as owner</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mods */}
      <div className="adm-card" style={{ padding: 0, marginBottom: '1rem' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light, #e8d8c0)', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wood-warm)' }}>
          Moderators ({mods.length})
        </div>
        {mods.length === 0 ? (
          <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No moderators yet.</div>
        ) : (
          <table className="adm-table">
            <tbody>
              {mods.map((m) => (
                <MemberRow
                  key={m.profile_id}
                  member={m}
                  busy={busyId === m.profile_id}
                  onDemote={() => handleSetRole(m.profile_id, 'member')}
                  onTransfer={() => handleTransfer(m.profile_id, m.profile?.full_name || m.profile?.username)}
                  onRemove={() => handleRemove(m.profile_id, m.profile?.full_name || m.profile?.username)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Regular members */}
      <div className="adm-card" style={{ padding: 0 }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light, #e8d8c0)', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wood-warm)' }}>
          Members ({regular.length})
        </div>
        {regular.length === 0 ? (
          <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No regular members.</div>
        ) : (
          <table className="adm-table">
            <tbody>
              {regular.map((m) => (
                <MemberRow
                  key={m.profile_id}
                  member={m}
                  busy={busyId === m.profile_id}
                  onPromote={() => handleSetRole(m.profile_id, 'mod')}
                  onTransfer={() => handleTransfer(m.profile_id, m.profile?.full_name || m.profile?.username)}
                  onRemove={() => handleRemove(m.profile_id, m.profile?.full_name || m.profile?.username)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

function MemberAvatar({ profile, size = 32 }) {
  const initials = (profile?.full_name || profile?.username || '?')
    .split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}/>;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #8a5030, #5d3a1c)',
      color: '#fff', fontSize: size * 0.38, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function MemberRow({ member, busy, onPromote, onDemote, onTransfer, onRemove }) {
  const p = member.profile || {};
  return (
    <tr>
      <td style={{ paddingLeft: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MemberAvatar profile={p}/>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              {p.full_name || p.username || 'Unknown'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              @{p.username}{p.trade ? ' . ' + p.trade : ''}
            </div>
          </div>
        </div>
      </td>
      <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {onPromote && (
            <button type="button" className="adm-btn" onClick={onPromote} disabled={busy}>
              Promote to mod
            </button>
          )}
          {onDemote && (
            <button type="button" className="adm-btn" onClick={onDemote} disabled={busy}>
              Demote to member
            </button>
          )}
          {onTransfer && (
            <button type="button" className="adm-btn primary" onClick={onTransfer} disabled={busy}>
              Make owner
            </button>
          )}
          {onRemove && (
            <button type="button" className="adm-btn danger" onClick={onRemove} disabled={busy}>
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

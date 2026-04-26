import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCommunityBySlug,
  fetchMyMembership,
  fetchMyJoinRequest,
  fetchMyInvitation,
  fetchPendingJoinRequests,
  requestToJoinCommunity,
  cancelJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  acceptCommunityInvitation,
  declineCommunityInvitation,
  inviteToCommunity,
  searchProfilesToInvite,
  transferOwnership,
  leaveCommunity,
  kickCommunityMember,
  banCommunityMember,
  unbanCommunityMember,
  fetchCommunityBans,
  fetchCommunityMembers,
  fetchCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  togglePostLike,
  setPostPinned,
  fetchPostComments,
  createPostComment,
  deletePostComment,
} from '../lib/communityDb.js';
import { CommunityIcon } from './Communities.jsx';
import { safeImageUrl } from '../lib/urlSafety.js';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/communities.css';

const POST_TYPES = [
  { id: 'discussion',   label: 'Discussion',   icon: '💬', tint: 'tint-discussion' },
  { id: 'question',     label: 'Question',     icon: '❓',    tint: 'tint-question' },
  { id: 'showcase',     label: 'Showcase',     icon: '🔨', tint: 'tint-showcase' },
  { id: 'announcement', label: 'Announcement', icon: '📣', tint: 'tint-announcement' },
];
const TYPE_MAP = Object.fromEntries(POST_TYPES.map((t) => [t.id, t]));

const TABS = [
  { id: 'discussion', label: 'Discussion' },
  { id: 'about',      label: 'About' },
  { id: 'members',    label: 'Members' },
  { id: 'media',      label: 'Media' },
];

export default function CommunityHome() {
  const { slug } = useParams();
  const { user, isAuthed } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [myInvitation, setMyInvitation] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [bans, setBans] = useState([]);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('discussion');
  const [filterType, setFilterType] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    const { data } = await fetchCommunityBySlug(slug);
    if (!data) { setNotFound(true); setLoading(false); return; }
    setCommunity(data);
    const [m, r, p, mr, mi] = await Promise.all([
      fetchMyMembership(data.id),
      fetchCommunityMembers(data.id),
      fetchCommunityPosts(data.id, { myUserId: user?.id }),
      fetchMyJoinRequest(data.id),
      fetchMyInvitation(data.id),
    ]);
    setMembership(m.data || null);
    setMembers(r.data || []);
    setPosts(p.data || []);
    setMyRequest(mr.data || null);
    setMyInvitation(mi.data || null);
    const role = m.data?.role;
    if (role === 'mod' || role === 'owner') {
      const [pr, bb] = await Promise.all([
        fetchPendingJoinRequests(data.id),
        fetchCommunityBans(data.id),
      ]);
      setPendingRequests(pr.data || []);
      setBans(bb.data || []);
    } else {
      setPendingRequests([]);
      setBans([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug, user?.id]);
  useDocumentTitle(community?.name);

  const isMember = !!membership;
  const isOwner  = membership?.role === 'owner';
  const isMod    = membership?.role === 'mod' || isOwner;

  const handleApply = async () => {
    if (!community) return;
    setBusy(true);
    const { error } = await requestToJoinCommunity(community.id);
    setBusy(false);
    if (error) { alert(prettyMembershipError(error.message)); return; }
    await load();
  };
  const handleCancelMyRequest = async () => {
    if (!myRequest) return;
    setBusy(true);
    const { error } = await cancelJoinRequest(myRequest.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };
  const handleAcceptInvite = async () => {
    if (!myInvitation) return;
    setBusy(true);
    const { error } = await acceptCommunityInvitation(myInvitation.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };
  const handleDeclineInvite = async () => {
    if (!myInvitation) return;
    setBusy(true);
    const { error } = await declineCommunityInvitation(myInvitation.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };
  const handleLeave = async () => {
    if (!community || !isMember) return;
    if (isOwner) { setManageOpen(true); return; }
    if (!confirm('Leave this community? You can request to rejoin later.')) return;
    setBusy(true);
    const { error } = await leaveCommunity(community.id);
    setBusy(false);
    if (error) { alert(prettyMembershipError(error.message)); return; }
    await load();
  };

  const handleApprove = async (requestId) => {
    setBusy(true);
    const { error } = await approveJoinRequest(requestId);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };
  const handleReject = async (requestId) => {
    setBusy(true);
    const { error } = await rejectJoinRequest(requestId);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };
  const handleInvite = async (profileId) => {
    setBusy(true);
    const { error } = await inviteToCommunity(community.id, profileId);
    setBusy(false);
    if (error) { alert(prettyMembershipError(error.message)); return false; }
    await load();
    return true;
  };
  const handleKick = async (profileId, name) => {
    if (!confirm('Kick ' + (name || 'this member') + ' from the community?\n\nThey can re-apply later.')) return;
    setBusy(true);
    const { error } = await kickCommunityMember(community.id, profileId);
    setBusy(false);
    if (error) { alert(prettyMembershipError(error.message)); return; }
    await load();
  };
  const handleBan = async (profileId, name) => {
    const reason = prompt('Ban ' + (name || 'this member') + '?\n\nThey will be removed and blocked from re-applying or being invited until unbanned.\n\nOptional reason:', '');
    if (reason === null) return; // cancelled
    setBusy(true);
    const { error } = await banCommunityMember(community.id, profileId, reason || '');
    setBusy(false);
    if (error) { alert(prettyMembershipError(error.message)); return; }
    await load();
  };
  const handleUnban = async (profileId, name) => {
    if (!confirm('Lift the ban on ' + (name || 'this person') + '?')) return;
    setBusy(true);
    const { error } = await unbanCommunityMember(community.id, profileId);
    setBusy(false);
    if (error) { alert(error.message); return; }
    await load();
  };

  const handleTransfer = async (newOwnerId) => {
    if (!community || !newOwnerId) return false;
    if (!confirm('Transfer ownership?\n\nYou will become a regular member and the new owner takes full control of the community. They can promote you back to mod or owner if they choose.')) return false;
    setBusy(true);
    const { error } = await transferOwnership(community.id, newOwnerId);
    setBusy(false);
    if (error) { alert(error.message); return false; }
    await load();
    setManageOpen(false);
    return true;
  };

  const handleCreatePost = async ({ body, imageUrl, postType }) => {
    if (!community?.id) return { ok: false };
    const { data, error } = await createCommunityPost(community.id, { body, imageUrl, postType });
    if (error) return { ok: false, error: error.message };
    if (data) setPosts((prev) => [{ ...data, iLiked: false }, ...prev]);
    return { ok: true };
  };
  const handleLike = async (post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, iLiked: !p.iLiked, like_count: Math.max(0, (p.like_count || 0) + (p.iLiked ? -1 : 1)) }
          : p
      )
    );
    await togglePostLike({ postId: post.id, communityId: community.id, iLiked: post.iLiked });
  };
  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await deleteCommunityPost(postId);
    if (error) { alert(error.message); return; }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };
  const handlePin = async (post) => {
    const next = !post.is_pinned;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_pinned: next } : p)));
    const { error } = await setPostPinned(post.id, next);
    if (error) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_pinned: !next } : p)));
      alert(error.message);
    }
  };

  if (notFound) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap">
          <div className="comm-empty">We couldn't find a community at <code>/c/{slug}</code>.</div>
        </div>
      </>
    );
  }
  if (loading || !community) {
    return (
      <>
        <PageBack backTo="/communities" backLabel="Back to Communities" />
        <div className="comm-wrap"><div className="comm-empty">Loading...</div></div>
      </>
    );
  }

  return (
    <>
      <PageBack
        backTo="/communities"
        backLabel="Back to Communities"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Communities', to: '/communities' },
          { label: community.name },
        ]}
      />

      <div
        className="comm-banner comm-banner-soft"
        style={{
          backgroundImage: safeImageUrl(community.banner_url)
            ? `url("${safeImageUrl(community.banner_url)}")`
            : 'linear-gradient(135deg, #2C1A0E 0%, #6B3F1F 50%, #A0522D 100%)',
        }}
      >
        <div className="comm-banner-inner comm-banner-inner-rich">
          <CommunityIcon c={community} size={96} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="comm-home-title">{community.name}</h1>
            <div className="comm-home-sub">
              <span className="comm-dot-public">● Public group</span>
              <span className="dot">·</span>
              <span>{(community.member_count || 0).toLocaleString()} members</span>
            </div>
            {members.length > 0 && (
              <div className="comm-avatar-strip" aria-label="Some members of this community">
                {members.slice(0, 14).map((m) => (
                  <AvatarChip key={m.profile?.id} profile={m.profile} />
                ))}
                {members.length > 14 && (
                  <span className="comm-avatar-more">+{members.length - 14}</span>
                )}
              </div>
            )}
          </div>
          <div className="comm-home-actions">
            {isAuthed ? (
              <MembershipButton
                membership={membership}
                myRequest={myRequest}
                myInvitation={myInvitation}
                busy={busy}
                onApply={handleApply}
                onCancelRequest={handleCancelMyRequest}
                onAcceptInvite={handleAcceptInvite}
                onDeclineInvite={handleDeclineInvite}
                onLeave={handleLeave}
                onOpenManage={() => setManageOpen(true)}
              />
            ) : (
              <Link to="/login" className="comm-btn primary">Sign in to request access</Link>
            )}
          </div>
        </div>
      </div>

      <div className="comm-tabs">
        <div className="comm-tabs-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={'comm-tab ' + (tab === t.id ? 'active' : '')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="comm-feed-wrap">
        <div className="comm-feed-main">
          {tab === 'discussion' && (
            <DiscussionTab
              community={community}
              posts={posts}
              members={members}
              isMember={isMember}
              isAuthed={isAuthed}
              isMod={isMod}
              currentUserId={user?.id}
              filterType={filterType}
              setFilterType={setFilterType}
              onCreate={handleCreatePost}
              onLike={handleLike}
              onDelete={handleDeletePost}
              onPin={handlePin}
              myRequest={myRequest}
              myInvitation={myInvitation}
              onApply={handleApply}
              onCancelRequest={handleCancelMyRequest}
              onAcceptInvite={handleAcceptInvite}
              onDeclineInvite={handleDeclineInvite}
              busy={busy}
            />
          )}
          {tab === 'about' && <AboutTab community={community} />}
          {tab === 'members' && <MembersTab members={members} />}
          {tab === 'media' && <MediaTab posts={posts} />}
        </div>

        <aside className="comm-chat-side">
          <AboutCard community={community} />
          {isMod && (
            <PendingRequestsCard
              requests={pendingRequests}
              onApprove={handleApprove}
              onReject={handleReject}
              busy={busy}
            />
          )}
          <RecentMediaCard posts={posts} onSeeAll={() => setTab('media')} />
          <MemberPreviewCard members={members} onSeeAll={() => setTab('members')} />
        </aside>
      </div>

      {manageOpen && (
        <ManageMembershipModal
          community={community}
          members={members}
          isOwner={isOwner}
          isMod={isMod}
          pendingRequests={pendingRequests}
          bans={bans}
          busy={busy}
          onClose={() => setManageOpen(false)}
          onTransfer={handleTransfer}
          onInvite={handleInvite}
          onApprove={handleApprove}
          onReject={handleReject}
          onKick={handleKick}
          onBan={handleBan}
          onUnban={handleUnban}
        />
      )}
    </>
  );
}

function MembershipButton({
  membership, myRequest, myInvitation, busy,
  onApply, onCancelRequest, onAcceptInvite, onDeclineInvite, onLeave, onOpenManage,
}) {
  const role = membership?.role;
  if (myInvitation) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="comm-btn primary" onClick={onAcceptInvite} disabled={busy}>
          {busy ? '...' : 'Accept invite'}
        </button>
        <button type="button" className="comm-btn ghost-light" onClick={onDeclineInvite} disabled={busy}>
          Decline
        </button>
      </div>
    );
  }
  if (role === 'owner') {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          className="comm-btn ghost-light"
          style={{ pointerEvents: 'none', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          aria-label="You are the owner of this community"
        >
          <span style={{ fontSize: 13 }}>👑</span>
          Owner
        </span>
        <button type="button" className="comm-btn primary" onClick={onOpenManage} disabled={busy}>
          Manage
        </button>
      </div>
    );
  }
  if (role === 'mod') {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="comm-btn ghost-light" onClick={onOpenManage} disabled={busy} title="Approve requests, invite people">
          Manage
        </button>
        <button type="button" className="comm-btn ghost-light" onClick={onLeave} disabled={busy}>
          Joined ✓
        </button>
      </div>
    );
  }
  if (role === 'member') {
    return (
      <button type="button" className="comm-btn ghost-light" onClick={onLeave} disabled={busy} title="Click to leave">
        {busy ? '...' : 'Joined ✓'}
      </button>
    );
  }
  if (myRequest) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="comm-btn ghost-light" style={{ pointerEvents: 'none', cursor: 'default' }}>
          Request pending
        </span>
        <button type="button" className="comm-btn ghost-light" onClick={onCancelRequest} disabled={busy}>
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button type="button" className="comm-btn primary" onClick={onApply} disabled={busy}>
      {busy ? '...' : 'Request to join'}
    </button>
  );
}

function prettyMembershipError(message) {
  const m = String(message || '');
  if (m.includes('owner_must_transfer_first')) return 'You are the owner. Transfer ownership to another member before leaving.';
  if (m.includes('banned_from_community')) return "You've been banned from this community.";
  if (m.includes('invitee_banned')) return "That person is banned from this community. Lift the ban first.";
  if (m.includes('cannot_kick_owner')) return "Owners can't be kicked. Transfer ownership first.";
  if (m.includes('cannot_ban_owner')) return "Owners can't be banned. Transfer ownership first.";
  if (m.includes('already_member')) return 'They are already in this community.';
  if (m.includes('request_already_pending')) return 'A request is already pending for this user.';
  if (m.includes('invitation_already_pending')) return 'An invitation is already outstanding for that person.';
  if (m.includes('cannot_invite_self')) return "You can't invite yourself.";
  if (m.includes('forbidden')) return "You don't have permission to do that.";
  return m;
}

function DiscussionTab({
  community, posts, members, isMember, isAuthed, isMod, currentUserId,
  filterType, setFilterType, onCreate, onLike, onDelete, onPin,
  myRequest, myInvitation, onApply, onCancelRequest, onAcceptInvite, onDeclineInvite, busy,
}) {
  const pinned   = useMemo(() => posts.filter((p) => p.is_pinned), [posts]);
  const regular  = useMemo(() => posts.filter((p) => !p.is_pinned), [posts]);
  const filtered = filterType ? regular.filter((p) => p.post_type === filterType) : regular;

  if (!isMember) {
    if (!isAuthed) {
      return (
        <div className="comm-gate comm-gate-card">
          <div className="comm-gate-title">Members only</div>
          <div className="comm-gate-sub">Sign in and request access to see posts.</div>
          <Link to="/login" className="comm-btn primary">Sign in</Link>
        </div>
      );
    }
    if (myInvitation) {
      return (
        <div className="comm-gate comm-gate-card">
          <div className="comm-gate-title">You've been invited</div>
          <div className="comm-gate-sub">A community moderator has invited you to join.</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="comm-btn primary" onClick={onAcceptInvite} disabled={busy}>
              {busy ? '...' : 'Accept invite'}
            </button>
            <button type="button" className="comm-btn ghost-light" onClick={onDeclineInvite} disabled={busy}>
              Decline
            </button>
          </div>
        </div>
      );
    }
    if (myRequest) {
      return (
        <div className="comm-gate comm-gate-card">
          <div className="comm-gate-title">Request sent</div>
          <div className="comm-gate-sub">A moderator will review your request shortly. You'll see posts as soon as you're approved.</div>
          <button type="button" className="comm-btn ghost-light" onClick={onCancelRequest} disabled={busy}>
            Cancel request
          </button>
        </div>
      );
    }
    return (
      <div className="comm-gate comm-gate-card">
        <div className="comm-gate-title">Members only</div>
        <div className="comm-gate-sub">Posts here are visible to members. Request access and a moderator will review.</div>
        <button type="button" className="comm-btn primary" onClick={onApply} disabled={busy}>
          {busy ? '...' : 'Request to join'}
        </button>
      </div>
    );
  }

  return (
    <>
      <PostComposer onSubmit={onCreate} />
      <div className="comm-filter-row">
        <button type="button" className={'comm-filter-chip ' + (!filterType ? 'active' : '')} onClick={() => setFilterType(null)}>All</button>
        {POST_TYPES.map((t) => (
          <button key={t.id} type="button" className={'comm-filter-chip ' + (filterType === t.id ? 'active' : '')} onClick={() => setFilterType(t.id)}>
            <span style={{ marginRight: 5 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      {pinned.length > 0 && !filterType && (
        <div className="comm-pinned-group">
          <div className="comm-section-ribbon">📌 Pinned</div>
          {pinned.map((post) => (
            <PostCard key={post.id} post={post} community={community} currentUserId={currentUserId} canModerate={isMod} onLike={onLike} onDelete={onDelete} onPin={onPin} />
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="comm-empty" style={{ marginTop: 12 }}>
          {filterType ? `No ${TYPE_MAP[filterType].label.toLowerCase()} posts yet.` : 'No posts yet. Be the first to write something.'}
        </div>
      ) : (
        filtered.map((post) => (
          <PostCard key={post.id} post={post} community={community} currentUserId={currentUserId} canModerate={isMod} onLike={onLike} onDelete={onDelete} onPin={onPin} />
        ))
      )}
    </>
  );
}

function AboutTab({ community }) {
  return (
    <div className="post-card" style={{ padding: '1.2rem 1.35rem' }}>
      <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700 }}>About this community</h3>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>
        {community.description || "The founder hasn't written a description yet."}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 16 }}>
        <FactChip label="Members"   value={(community.member_count || 0).toLocaleString()} />
        <FactChip label="Posts"     value={(community.thread_count || 0).toLocaleString()} />
        <FactChip label="Visibility" value={community.is_public ? 'Public' : 'Private'} />
        <FactChip label="Founded"   value={new Date(community.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
      </div>
    </div>
  );
}
function FactChip({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', background: '#FDFBF5', border: '1px solid var(--border-light)', borderRadius: 10 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MembersTab({ members }) {
  const owners = members.filter((m) => m.role === 'owner');
  const mods   = members.filter((m) => m.role === 'mod');
  const regs   = members.filter((m) => m.role === 'member');
  return (
    <div className="post-card" style={{ padding: '1rem 1.1rem' }}>
      {owners.length > 0 && <RosterGroup label="Owner" rows={owners} />}
      {mods.length   > 0 && <RosterGroup label={'Moderators · ' + mods.length} rows={mods} />}
      {regs.length   > 0 && <RosterGroup label={'Members · ' + regs.length} rows={regs} />}
    </div>
  );
}

function MediaTab({ posts }) {
  const imgs = posts.filter((p) => p.image_url && !p.deleted_at);
  if (imgs.length === 0) return <div className="comm-empty">No images posted yet.</div>;
  return (
    <div className="comm-media-grid">
      {imgs.map((p) => (<img key={p.id} src={p.image_url} alt="" className="comm-media-tile" loading="lazy" />))}
    </div>
  );
}

function AboutCard({ community }) {
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title">About</div>
      <div style={{ padding: '0.85rem 1rem', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {community.description ? (community.description.length > 160 ? community.description.slice(0, 160) + '...' : community.description) : "Founder hasn't written a description yet."}
        <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
          <SideFact label="Public"  value="Anyone can see posts" />
          <SideFact label="Founded" value={new Date(community.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} />
        </div>
      </div>
    </div>
  );
}
function SideFact({ label, value }) {
  return (
    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
      <strong style={{ color: 'var(--text-primary)' }}>{label}</strong> · {value}
    </div>
  );
}

function RecentMediaCard({ posts, onSeeAll }) {
  const imgs = posts.filter((p) => p.image_url && !p.deleted_at).slice(0, 6);
  if (imgs.length === 0) return null;
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Recent media</span>
        <button type="button" onClick={onSeeAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 11.5, color: 'var(--wood-warm)', fontWeight: 600 }}>See all</button>
      </div>
      <div className="comm-side-media">
        {imgs.map((p) => (<img key={p.id} src={p.image_url} alt="" loading="lazy" />))}
      </div>
    </div>
  );
}
function MemberPreviewCard({ members, onSeeAll }) {
  if (members.length === 0) return null;
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Members <span className="comm-chat-side-count">{members.length}</span></span>
        <button type="button" onClick={onSeeAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 11.5, color: 'var(--wood-warm)', fontWeight: 600 }}>See all</button>
      </div>
      <div className="comm-members" style={{ maxHeight: 260 }}>
        {members.slice(0, 8).map((m) => {
          const p = m.profile; if (!p) return null;
          const name = p.full_name || p.username || 'Member';
          const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
          return (
            <Link key={p.id} to={'/profile/' + (p.username || p.id)} className="comm-roster-row">
              <div className="comm-roster-avatar">
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
              </div>
              <div className="comm-roster-text">
                <div className="comm-roster-name">{name}</div>
                {m.role !== 'member' && (<div className="comm-roster-trade" style={{ color: 'var(--wood-warm)' }}>{m.role}</div>)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AvatarChip({ profile }) {
  if (!profile) return null;
  const name = profile.full_name || profile.username || '?';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <Link to={'/profile/' + (profile.username || profile.id)} className="comm-avatar-chip" title={name}>
      {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{initials}</span>}
    </Link>
  );
}

function PostComposer({ onSubmit }) {
  const [body, setBody]   = useState('');
  const [imageUrl, setUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [postType, setPostType] = useState('discussion');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true); setErr(null);
    const res = await onSubmit({ body, imageUrl: imageUrl.trim() || null, postType });
    setSending(false);
    if (!res.ok) { setErr(res.error || 'Could not post.'); return; }
    setBody(''); setUrl(''); setShowUrl(false); setPostType('discussion');
  };
  return (
    <div className="post-composer">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share something with the community..." rows={3} className="post-composer-input" maxLength={8000} />
        {showUrl && (
          <input type="url" value={imageUrl} onChange={(e) => setUrl(e.target.value)} placeholder="Paste an image URL (https://...)" className="post-composer-url" />
        )}
        <div className="comm-type-chips" role="radiogroup" aria-label="Post type">
          {POST_TYPES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={postType === t.id} onClick={() => setPostType(t.id)} className={'comm-type-chip ' + t.tint + ' ' + (postType === t.id ? 'active' : '')}>
              <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        {err && <div className="comm-chat-err">{err}</div>}
        <div className="post-composer-actions">
          <button type="button" className="post-composer-ghost" onClick={() => setShowUrl((v) => !v)}>
            {showUrl ? '✕ Remove image' : '📷 Add image'}
          </button>
          <button type="submit" className="comm-btn primary" disabled={!body.trim() || sending}>
            {sending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PostCard({ post, community, currentUserId, canModerate, onLike, onDelete, onPin }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const author = post.author || {};
  const name = author.full_name || author.username || 'Someone';
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const isOwnPost = post.author_id === currentUserId;
  const type = TYPE_MAP[post.post_type] || TYPE_MAP.discussion;
  const openComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      const { data } = await fetchPostComments(post.id);
      setComments(data || []);
    }
  };
  const handleReply = async (body) => {
    const { data, error } = await createPostComment({ postId: post.id, communityId: community.id, body });
    if (error) return { ok: false, error: error.message };
    setComments((prev) => [...(prev || []), data]);
    post.comment_count = (post.comment_count || 0) + 1;
    return { ok: true };
  };
  const handleCommentDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await deletePostComment(commentId);
    if (error) { alert(error.message); return; }
    setComments((prev) => (prev || []).filter((c) => c.id !== commentId));
    post.comment_count = Math.max(0, (post.comment_count || 0) - 1);
  };
  return (
    <article className={'post-card ' + (post.is_pinned ? 'post-card-pinned' : '')}>
      <div className="post-card-typebar">
        <span className={'comm-type-chip ' + type.tint + ' active'} style={{ pointerEvents: 'none' }}>
          <span style={{ marginRight: 5 }}>{type.icon}</span>{type.label}
        </span>
        {post.is_pinned && <span className="post-card-pin-pill">📌 Pinned</span>}
      </div>
      <header className="post-card-head">
        <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-card-avatar">
          {author.avatar_url ? <img src={author.avatar_url} alt="" /> : <span>{initials}</span>}
        </Link>
        <div className="post-card-head-text">
          <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-card-author">{name}</Link>
          <div className="post-card-ts" title={new Date(post.created_at).toLocaleString()}>
            {formatRelative(post.created_at)}
            {author.trade && <> · <span style={{ color: 'var(--wood-warm)' }}>{author.trade}</span></>}
          </div>
        </div>
        {(isOwnPost || canModerate) && (
          <div style={{ display: 'flex', gap: 4 }}>
            {canModerate && (
              <button type="button" onClick={() => onPin(post)} className="post-card-menu" title={post.is_pinned ? 'Unpin' : 'Pin to top'}>
                {post.is_pinned ? '📌' : '📍'}
              </button>
            )}
            <button type="button" onClick={() => onDelete(post.id)} className="post-card-menu" title="Delete">⋯</button>
          </div>
        )}
      </header>
      <div className="post-card-body">{post.body}</div>
      {post.image_url && <img src={post.image_url} alt="" className="post-card-image" loading="lazy" />}
      <div className="post-card-counts">
        {post.like_count > 0 && <span><span className="post-heart">❤</span> {post.like_count}</span>}
        {post.comment_count > 0 && <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>}
      </div>
      <div className="post-card-actions">
        <button type="button" onClick={() => onLike(post)} className={'post-action-btn ' + (post.iLiked ? 'liked' : '')}>
          <span className="post-action-icon">{post.iLiked ? '❤' : '♡'}</span>
          Like
        </button>
        <button type="button" onClick={openComments} className="post-action-btn">
          <span className="post-action-icon">💬</span>
          Comment
        </button>
      </div>
      {showComments && (
        <div className="post-comments">
          {comments === null ? (<div className="post-comments-empty">Loading...</div>)
           : comments.length === 0 ? (<div className="post-comments-empty">No comments yet — be first.</div>)
           : (comments.map((c) => (<Comment key={c.id} c={c} canDelete={c.author_id === currentUserId || canModerate} onDelete={handleCommentDelete} />)))}
          <CommentComposer onReply={handleReply} />
        </div>
      )}
    </article>
  );
}

function Comment({ c, canDelete, onDelete }) {
  const author = c.author || {};
  const name = author.full_name || author.username || 'Someone';
  const initials = (name || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="post-comment">
      <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-comment-avatar">
        {author.avatar_url ? <img src={author.avatar_url} alt="" /> : <span>{initials}</span>}
      </Link>
      <div className="post-comment-bubble">
        <Link to={author.username ? '/profile/' + author.username : '/forums'} className="post-comment-author">{name}</Link>
        <div className="post-comment-body">{c.body}</div>
        <div className="post-comment-meta">
          <span>{formatRelative(c.created_at)}</span>
          {canDelete && (<><span>·</span><button type="button" onClick={() => onDelete(c.id)} className="post-comment-delete">Delete</button></>)}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({ onReply }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e?.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true); setErr(null);
    const res = await onReply(body);
    setSending(false);
    if (!res.ok) { setErr(res.error || 'Could not comment.'); return; }
    setBody('');
  };
  return (
    <form onSubmit={submit} className="post-comment-compose">
      <input type="text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a comment..." className="post-comment-compose-input" maxLength={4000}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} />
      {err && <div className="comm-chat-err" style={{ marginTop: 6 }}>{err}</div>}
    </form>
  );
}

function RosterGroup({ label, rows }) {
  return (
    <div className="comm-roster-group">
      <div className="comm-roster-label">{label}</div>
      {rows.map((m) => {
        const p = m.profile; if (!p) return null;
        const name = p.full_name || p.username || 'Member';
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
        return (
          <Link key={p.id} to={'/profile/' + (p.username || p.id)} className="comm-roster-row">
            <div className="comm-roster-avatar">
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
            </div>
            <div className="comm-roster-text">
              <div className="comm-roster-name">{name}</div>
              {p.trade && <div className="comm-roster-trade">{p.trade}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PendingRequestsCard({ requests, onApprove, onReject, busy }) {
  if (!requests || requests.length === 0) return null;
  return (
    <div className="comm-side-card">
      <div className="comm-chat-side-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Pending requests <span className="comm-chat-side-count">{requests.length}</span></span>
      </div>
      <div style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
        {requests.map((r) => {
          const p = r.profile || {};
          const name = p.full_name || p.username || 'Someone';
          const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
          return (
            <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Link to={'/profile/' + (p.username || p.id)} className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={'/profile/' + (p.username || p.id)} style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>{name}</Link>
                {p.trade && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.trade}</div>}
                {r.message && (<div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>"{r.message}"</div>)}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button type="button" onClick={() => onApprove(r.id)} disabled={busy} className="comm-btn primary" style={{ padding: '4px 10px', fontSize: 11.5 }}>Approve</button>
                  <button type="button" onClick={() => onReject(r.id)} disabled={busy} className="comm-btn ghost-light" style={{ padding: '4px 10px', fontSize: 11.5 }}>Reject</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ManageMembershipModal({
  community, members, isOwner, isMod, pendingRequests, bans, busy,
  onClose, onTransfer, onInvite, onApprove, onReject, onKick, onBan, onUnban,
}) {
  const [section, setSection] = useState('requests');
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = inviteQuery.trim();
    if (q.length < 2) { setInviteResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await searchProfilesToInvite(q);
      if (!cancelled) { setInviteResults(data || []); setSearching(false); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [inviteQuery]);
  const transferCandidates = members.filter((m) => m.role !== 'owner' && m.profile);
  const sections = [
    { id: 'requests', label: `Requests${pendingRequests.length ? ' · ' + pendingRequests.length : ''}` },
    { id: 'members',  label: `Members · ${members.length}` },
    { id: 'invite',   label: 'Invite' },
    { id: 'bans',     label: `Bans${(bans?.length || 0) ? ' · ' + bans.length : ''}` },
    ...(isOwner ? [{ id: 'transfer', label: 'Transfer ownership' }] : []),
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label="Manage membership"
      style={{ position: 'fixed', inset: 0, background: 'rgba(20, 12, 6, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--white)', borderRadius: 14, width: 'min(720px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--wood-warm)' }}>Manage</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{community.name}</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 22, color: 'var(--text-muted)', lineHeight: 1 }} aria-label="Close">×</button>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '0.75rem 1.25rem 0', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
          {sections.map((s) => (
            <button key={s.id} type="button" onClick={() => setSection(s.id)} className={'comm-tab ' + (section === s.id ? 'active' : '')} style={{ padding: '8px 14px', fontSize: 13 }}>{s.label}</button>
          ))}
        </div>
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1 }}>
          {section === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingRequests.length === 0 ? (<div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '1rem 0' }}>No pending requests right now.</div>)
              : pendingRequests.map((r) => {
                const p = r.profile || {};
                const name = p.full_name || p.username || 'Someone';
                const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <div key={r.id} style={{ display: 'flex', gap: 10, padding: 12, border: '1px solid var(--border-light)', borderRadius: 10 }}>
                    <Link to={'/profile/' + (p.username || p.id)} className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                      {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={'/profile/' + (p.username || p.id)} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14 }}>{name}</Link>
                      {p.trade && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.trade}</div>}
                      {r.message && (<div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>"{r.message}"</div>)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
                      <button type="button" onClick={() => onApprove(r.id)} disabled={busy} className="comm-btn primary" style={{ padding: '6px 14px', fontSize: 12 }}>Approve</button>
                      <button type="button" onClick={() => onReject(r.id)} disabled={busy} className="comm-btn ghost-light" style={{ padding: '6px 14px', fontSize: 12 }}>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {section === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {members.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '1rem 0' }}>No members yet.</div>
              ) : members.map((m) => {
                const p = m.profile; if (!p) return null;
                const name = p.full_name || p.username || 'Member';
                const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                const isThisOwner = m.role === 'owner';
                return (
                  <div key={p.id} style={{ display: 'flex', gap: 10, padding: 10, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'center' }}>
                    <Link to={'/profile/' + (p.username || p.id)} className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                      {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={'/profile/' + (p.username || p.id)} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: 'none' }}>{name}</Link>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.role}{p.trade ? ' · ' + p.trade : ''}</div>
                    </div>
                    {isThisOwner ? (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>👑 Owner</span>
                    ) : (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button type="button" onClick={() => onKick(p.id, name)} disabled={busy} className="comm-btn ghost-light" style={{ padding: '5px 12px', fontSize: 12 }}>Kick</button>
                        <button type="button" onClick={() => onBan(p.id, name)} disabled={busy} className="comm-btn ghost-light" style={{ padding: '5px 12px', fontSize: 12, color: '#a32d2d', borderColor: '#e6c1c1' }}>Ban</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {section === 'bans' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(!bans || bans.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '1rem 0' }}>No one is banned.</div>
              ) : bans.map((b) => {
                const p = b.profile || {};
                const name = p.full_name || p.username || 'Someone';
                const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <div key={b.id} style={{ display: 'flex', gap: 10, padding: 10, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'flex-start' }}>
                    <div className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                      {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={'/profile/' + (p.username || p.id)} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: 'none' }}>{name}</Link>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Banned {formatRelative(b.created_at)}
                        {b.banner?.username ? ' by ' + (b.banner.full_name || b.banner.username) : ''}
                      </div>
                      {b.reason && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>"{b.reason}"</div>}
                    </div>
                    <button type="button" onClick={() => onUnban(p.id, name)} disabled={busy} className="comm-btn primary" style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0 }}>Unban</button>
                  </div>
                );
              })}
            </div>
          )}

          {section === 'invite' && (
            <div>
              <input type="text" value={inviteQuery} onChange={(e) => setInviteQuery(e.target.value)} placeholder="Search by name or username"
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'Montserrat, sans-serif', border: '1px solid var(--border)', borderRadius: 8, outline: 'none' }}
                autoFocus />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {inviteQuery.trim().length < 2 ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Type at least two characters to find a profile.</div>)
                : searching ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching...</div>)
                : inviteResults.length === 0 ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No profiles match.</div>)
                : inviteResults.map((p) => {
                  const name = p.full_name || p.username || 'Someone';
                  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                  const alreadyMember = members.some((m) => m.profile?.id === p.id);
                  return (
                    <div key={p.id} style={{ display: 'flex', gap: 10, padding: 8, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'center' }}>
                      <div className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                        {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                        {p.trade && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.trade}</div>}
                      </div>
                      {alreadyMember ? (<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Already a member</span>)
                      : (<button type="button" onClick={async () => { const ok = await onInvite(p.id); if (ok) { setInviteQuery(''); setInviteResults([]); } }} disabled={busy} className="comm-btn primary" style={{ padding: '5px 12px', fontSize: 12 }}>Invite</button>)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {section === 'transfer' && isOwner && (
            <div>
              <div style={{ padding: '12px 14px', background: '#FFF3DC', borderRadius: 8, color: '#8B5E08', fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>This is permanent.</div>
                Transferring makes the chosen member the new <strong>owner</strong>. You become a regular <strong>member</strong> — they can promote you back to mod or owner later if they choose.
              </div>
              {transferCandidates.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '0.5rem 0' }}>
                  Add at least one other member before transferring ownership.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {transferCandidates.map((m) => {
                    const p = m.profile;
                    const name = p.full_name || p.username || 'Member';
                    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                    return (
                      <div key={p.id} style={{ display: 'flex', gap: 10, padding: 10, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'center' }}>
                        <div className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                          {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.role}</div>
                        </div>
                        <button type="button" onClick={() => onTransfer(p.id)} disabled={busy} className="comm-btn primary" style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}>
                          Make owner
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelative(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return 'just now';
  if (ms < 60 * 60 * 1000) return Math.floor(ms / 60000) + 'm ago';
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h ago';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd ago';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
              </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={'/profile/' + (p.username || p.id)} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: 'none' }}>{name}</Link>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Banned {formatRelative(b.created_at)}
                        {b.banner?.username ? ' by ' + (b.banner.full_name || b.banner.username) : ''}
                      </div>
                      {b.reason && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>"{b.reason}"</div>}
                    </div>
                    <button type="button" onClick={() => onUnban(p.id, name)} disabled={busy} className="comm-btn primary" style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0 }}>Unban</button>
                  </div>
                );
              })}
            </div>
          )}

          {section === 'invite' && (
            <div>
              <input type="text" value={inviteQuery} onChange={(e) => setInviteQuery(e.target.value)} placeholder="Search by name or username"
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'Montserrat, sans-serif', border: '1px solid var(--border)', borderRadius: 8, outline: 'none' }}
                autoFocus />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {inviteQuery.trim().length < 2 ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Type at least two characters to find a profile.</div>)
                : searching ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching...</div>)
                : inviteResults.length === 0 ? (<div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No profiles match.</div>)
                : inviteResults.map((p) => {
                  const name = p.full_name || p.username || 'Someone';
                  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                  const alreadyMember = members.some((m) => m.profile?.id === p.id);
                  return (
                    <div key={p.id} style={{ display: 'flex', gap: 10, padding: 8, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'center' }}>
                      <div className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                        {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                        {p.trade && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.trade}</div>}
                      </div>
                      {alreadyMember ? (<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Already a member</span>)
                      : (<button type="button" onClick={async () => { const ok = await onInvite(p.id); if (ok) { setInviteQuery(''); setInviteResults([]); } }} disabled={busy} className="comm-btn primary" style={{ padding: '5px 12px', fontSize: 12 }}>Invite</button>)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {section === 'transfer' && isOwner && (
            <div>
              <div style={{ padding: '12px 14px', background: '#FFF3DC', borderRadius: 8, color: '#8B5E08', fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>This is permanent.</div>
                Transferring makes the chosen member the new <strong>owner</strong>. You become a regular <strong>member</strong> — they can promote you back to mod or owner later if they choose.
              </div>
              {transferCandidates.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '0.5rem 0' }}>
                  Add at least one other member before transferring ownership.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {transferCandidates.map((m) => {
                    const p = m.profile;
                    const name = p.full_name || p.username || 'Member';
                    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                    return (
                      <div key={p.id} style={{ display: 'flex', gap: 10, padding: 10, border: '1px solid var(--border-light)', borderRadius: 8, alignItems: 'center' }}>
                        <div className="comm-roster-avatar" style={{ flexShrink: 0 }}>
                          {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.role}</div>
                        </div>
                        <button type="button" onClick={() => onTransfer(p.id)} disabled={busy} className="comm-btn primary" style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}>
                          Make owner
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelative(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 1000) return 'just now';
  if (ms < 60 * 60 * 1000) return Math.floor(ms / 60000) + 'm ago';
  if (ms < 24 * 60 * 60 * 1000) return Math.floor(ms / 3600000) + 'h ago';
  if (ms < 7 * 24 * 60 * 60 * 1000) return Math.floor(ms / 86400000) + 'd ago';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

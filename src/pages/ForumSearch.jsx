import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import ForumSearchBar from '../components/forums/ForumSearchBar.jsx';
import { searchForumThreads } from '../lib/forumDb.js';
import { mapThreadRow } from '../lib/mappers.js';
import { FORUM_GROUPS } from '../data/forumsData.js';
import { getForumThreadVisits, isThreadUnread } from '../lib/forumLastVisit.js';

const AV_PALETTE = ['av-a', 'av-b', 'av-c', 'av-d', 'av-e'];
const CAT_COLORS = [
  { bg: '#EDE0C4', text: '#2D5A3D' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#E9F5E6', text: '#2E6F2E' },
  { bg: '#FBEDE0', text: '#A05C1F' },
  { bg: '#F0E7FA', text: '#5E2E8F' },
];

function hashSlug(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function findCategoryName(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return cat.name;
  }
  return 'Discussion';
}

function toItem(row, threadVisits) {
  const t = mapThreadRow(row);
  const h = hashSlug(t.slug || t.title || '');
  const cat = CAT_COLORS[h % CAT_COLORS.length];
  const initials = (t.title || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'MW';
  const badges = [];
  if (t.isPinned) badges.push({ label: '📌 Pinned', className: 'tb-pinned' });
  if (t.isSolved) badges.push({ label: '✓ Solved', className: 'tb-solved' });
  if (t.isLocked) badges.push({ label: '🔒 Locked', className: 'tb-locked' });
  return {
    id: t.id,
    slug: t.slug,
    avatar: initials,
    avatarColor: AV_PALETTE[h % AV_PALETTE.length],
    title: t.title,
    category: findCategoryName(t.categoryId),
    categoryBg: cat.bg,
    categoryText: cat.text,
    createdAt: t.createdAt,
    createdAgo: t.createdAgo,
    lastReplyAt: t.lastReplyAt,
    lastReplyAgo: t.lastReplyAgo,
    time: t.lastReplyAgo || 'recently',
    replies: t.replyCount,
    views: t.viewCount,
    badges,
    isUnread: isThreadUnread(t.id, t.lastReplyAt || t.createdAt, threadVisits),
  };
}

export default function ForumSearch() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!q) { setRows([]); return; }
    setLoading(true);
    (async () => {
      const { data } = await searchForumThreads(q);
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [q]);

  const threadVisits = getForumThreadVisits();
  const items = rows.map((r) => toItem(r, threadVisits));

  return (
    <>
      <PageBack
        backTo="/forums"
        backLabel="Back to Forums"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: 'Search' },
        ]}
      />
      <div className="main-wrap">
        <div>
          <div className="fs-results-card">
            <h1 className="fs-results-title">
              {q ? <>Search results for <em>&ldquo;{q}&rdquo;</em></> : 'Search the forums'}
            </h1>
            <p className="fs-results-sub">
              Looking for a thread to learn from before you post a new one? Type a few words below.
            </p>
            <ForumSearchBar size="lg" initialValue={q} placeholder="Search threads by title…" />
          </div>

          {loading ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              Searching…
            </div>
          ) : !q ? null : items.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              <div style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 600 }}>
                No threads matched &ldquo;{q}&rdquo;.
              </div>
              <div style={{ marginBottom: 14 }}>
                Be the first to ask the question.
              </div>
              <Link to={'/forums/new?title=' + encodeURIComponent(q)} className="act-btn primary" style={{ textDecoration: 'none' }}>
                ✏ Start a new thread
              </Link>
            </div>
          ) : (
            <RecentActivity items={items} />
          )}
        </div>
      </div>
    </>
  );
}

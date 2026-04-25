import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  markCategoryVisited,
  getForumThreadVisits,
  isThreadUnread,
} from '../lib/forumLastVisit.js';
import '../styles/forums.css';
import PageBack from '../components/shared/PageBack.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import { supabase } from '../lib/supabase.js';
import { mapThreadRow } from '../lib/mappers.js';
import { FORUM_GROUPS } from '../data/forumsData.js';

const AV_PALETTE = ['av-a', 'av-b', 'av-c', 'av-d', 'av-e'];
const CAT_COLORS = [
  { bg: '#EDE0C4', text: '#6B3F1F' },
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

function toActivityItem(row, categoryName, threadVisits) {
  const t = mapThreadRow(row);
  const h = hashSlug(t.slug || t.title || '');
  const avatarColor = AV_PALETTE[h % AV_PALETTE.length];
  const cat = CAT_COLORS[h % CAT_COLORS.length];
  const badges = [];
  if (t.isPinned) badges.push({ label: '📌 Pinned', className: 'tb-pinned' });
  if (t.isSolved) badges.push({ label: '✓ Solved', className: 'tb-solved' });
  if (t.isLocked) badges.push({ label: '🔒 Locked', className: 'tb-locked' });
  if (t.viewCount > 500 && t.isPinned === false) badges.push({ label: '🔥 Hot', className: 'tb-hot' });
  const initials = (t.title || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'GH';
  return {
    id: t.id,
    slug: t.slug,
    avatar: initials,
    avatarColor,
    title: t.title,
    category: categoryName || 'Discussion',
    categoryBg: cat.bg,
    categoryText: cat.text,
    author: 'Community',
    // Both timestamps now ride through to the row renderer so the
    // meta line can show "started X ago · last reply Y ago".
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

function findCategoryMeta(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return { category: cat, group: g };
  }
  return { category: null, group: null };
}

export default function ForumCategory() {
  const { id } = useParams();
  const [threadRows, setThreadRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (!id) { setThreadRows([]); setLoading(false); return; }
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', id)
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error || !data) setThreadRows([]);
      else setThreadRows(data);
      setLoading(false);
      markCategoryVisited(id);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const { category, group } = findCategoryMeta(id);
  const categoryName = category?.name || id || 'Category';
  const categoryDesc = category?.description || '';
  const groupName = group?.name || 'Forums';

  const threadVisits = getForumThreadVisits();
  const items = threadRows.map((r) => toActivityItem(r, categoryName, threadVisits));

  return (
    <>
      <PageBack
        backTo="/forums"
        backLabel="Back to Forums"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: groupName },
          { label: categoryName },
        ]}
      />
      <div className="main-wrap">
        <div>
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--wood-warm)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {groupName}
            </div>
            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '32px',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.1,
            }}>
              {categoryName}
            </h1>
            {categoryDesc && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0.75rem 0 0 0', lineHeight: 1.5 }}>
                {categoryDesc}
              </p>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                to={'/forums/new?category=' + encodeURIComponent(id)}
                className="act-btn primary"
                style={{ textDecoration: 'none' }}
              >
                ✏ Start a thread
              </Link>
              <Link to="/forums" style={{ color: 'var(--wood-warm)', fontSize: '13px', fontWeight: '500' }}>
                → All forums
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {loading ? 'Loading threads…' : `${items.length} thread${items.length === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          {loading && items.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              Loading threads…
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              <div style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 500 }}>
                No threads in this category yet.
              </div>
              <div style={{ marginBottom: 16 }}>Be the first to start the conversation.</div>
              <Link
                to={'/forums/new?category=' + encodeURIComponent(id)}
                className="act-btn primary"
                style={{ textDecoration: 'none' }}
              >
                ✏ Start the first thread
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

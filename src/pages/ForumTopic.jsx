import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import ForumSearchBar from '../components/forums/ForumSearchBar.jsx';
import { fetchTopicBySlug, fetchThreadsForTopic } from '../lib/forumTopicsDb.js';
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
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function findCategoryMeta(id) {
  for (const g of FORUM_GROUPS) {
    const cat = g.categories.find((c) => c.id === id);
    if (cat) return { category: cat, group: g };
  }
  return { category: null, group: null };
}

function toItem(row, topicName, threadVisits) {
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
    category: topicName || 'Topic',
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

export default function ForumTopic() {
  const { categoryId, topicSlug } = useParams();
  const [topic, setTopic] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: t } = await fetchTopicBySlug(categoryId, topicSlug);
      if (cancelled) return;
      setTopic(t);
      if (t) {
        const { data: threads } = await fetchThreadsForTopic(t.id);
        if (!cancelled) setRows(threads || []);
      } else {
        setRows([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [categoryId, topicSlug]);

  const { category, group } = findCategoryMeta(categoryId);
  const threadVisits = getForumThreadVisits();
  const items = rows.map((r) => toItem(r, topic?.name, threadVisits));
  const ownerName =
    topic?.owner?.business_name ||
    topic?.owner?.sponsor_company ||
    topic?.owner?.full_name ||
    topic?.owner?.username ||
    null;

  return (
    <>
      <PageBack
        backTo={`/forums/category/${categoryId}`}
        backLabel={category?.name ? `Back to ${category.name}` : 'Back'}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: group?.name || 'Group' },
          { label: category?.name || 'Category', to: `/forums/category/${categoryId}` },
          { label: topic?.name || 'Topic' },
        ]}
      />
      <div className="main-wrap">
        <div>
          <div className="topic-header">
            {topic?.icon && <div className="topic-header-icon">{topic.icon}</div>}
            <div className="topic-header-body">
              <div className="topic-header-eyebrow">
                {category?.name || 'Topic'}
                {topic?.is_official && <span className="topic-official-pill">✓ Official</span>}
              </div>
              <h1 className="topic-header-title">{topic?.name || (loading ? 'Loading…' : 'Topic not found')}</h1>
              {topic?.description && <p className="topic-header-desc">{topic.description}</p>}
              {ownerName && (
                <div className="topic-header-owner">
                  Stewarded by <strong>{ownerName}</strong>
                </div>
              )}
              <div className="cat-actionbar" style={{ marginTop: '0.85rem' }}>
                <div className="cat-actionbar-chips">
                  <Link
                    to={'/forums/new?category=' + encodeURIComponent(categoryId) + (topic ? '&topic=' + topic.id : '')}
                    className="cat-chip cat-chip-primary"
                  >
                    ✏ New thread in {topic?.name || 'topic'}
                  </Link>
                  <Link to={`/forums/category/${categoryId}`} className="cat-chip">All {category?.name || 'category'}</Link>
                  <span className="cat-chip cat-chip-muted">
                    {loading ? 'Loading…' : `${items.length} thread${items.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                <ForumSearchBar size="md" placeholder={`Search ${topic?.name || 'topic'}…`} className="cat-actionbar-search" />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              Loading threads…
            </div>
          ) : !topic ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              Topic not found.
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              <div style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 600 }}>
                No threads in {topic.name} yet.
              </div>
              <div style={{ marginBottom: 16 }}>Be the first.</div>
              <Link
                to={'/forums/new?category=' + encodeURIComponent(categoryId) + '&topic=' + topic.id}
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

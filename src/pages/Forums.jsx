import { useSearchParams } from 'react-router-dom';
import '../styles/forums.css';
import PageHeader from '../components/forums/PageHeader.jsx';
import ToolbarSection from '../components/forums/ToolbarSection.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import ForumGroup from '../components/forums/ForumGroup.jsx';
import OnlineUsersStrip from '../components/forums/OnlineUsersStrip.jsx';
import HotTopicsStrip from '../components/forums/HotTopicsStrip.jsx';
import ForumStats from '../components/forums/ForumStats.jsx';
import TopContributors from '../components/forums/TopContributors.jsx';
import ForumGuidelines from '../components/forums/ForumGuidelines.jsx';
import ThreadLegend from '../components/forums/ThreadLegend.jsx';
import SponsorCard from '../components/forums/SponsorCard.jsx';
import TradeFilterBanner from '../components/layout/TradeFilterBanner.jsx';
import { matchesTrade } from '../lib/trades.js';
import {
  FORUMS_PAGE_HEADER,
  FORUM_GROUPS,
  ONLINE_MEMBERS,
  HOT_TOPICS,
  FORUM_STATS,
  TOP_CONTRIBUTORS,
  FORUM_GUIDELINES,
  THREAD_LEGEND,
} from '../data/forumsData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapThreadRow } from '../lib/mappers.js';

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

function toActivityItem(row) {
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
    avatar: initials,
    avatarColor,
    title: t.title,
    category: 'Discussion',
    categoryBg: cat.bg,
    categoryText: cat.text,
    author: 'Community',
    time: t.lastReplyAgo || 'recently',
    replies: t.replyCount,
    views: t.viewCount,
    badges,
    isUnread: false,
  };
}

export default function Forums() {
  const [searchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';

  const { data: threadRows } = useSupabaseList('forum_threads', {
    order: { column: 'last_reply_at', ascending: false },
    limit: 50,
  });
  const liveActivity = threadRows.map(toActivityItem);

  const filteredActivity = trade
    ? liveActivity.filter((item) => matchesTrade(item, trade))
    : liveActivity;

  return (
    <>
      <PageHeader data={FORUMS_PAGE_HEADER} />
      <ToolbarSection />

      <div className="main-wrap">
        <div>
          <TradeFilterBanner />

          <OnlineUsersStrip data={ONLINE_MEMBERS} />
          <HotTopicsStrip topics={HOT_TOPICS} />

          <div className="forum-groups">
            {FORUM_GROUPS.map((group) => (
              <ForumGroup key={group.id} group={group} />
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '24px',
              color: 'var(--text-primary)',
              margin: '0 0 1rem 0',
            }}>
              Recent Activity
            </h2>
            {filteredActivity.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
                No forum threads yet.
              </div>
            ) : (
              <RecentActivity items={filteredActivity} />
            )}
          </div>
        </div>

        <aside className="right-col">
          <ForumStats stats={FORUM_STATS} />
          <TopContributors contributors={TOP_CONTRIBUTORS} />
          <ForumGuidelines guidelines={FORUM_GUIDELINES} />
          <ThreadLegend items={THREAD_LEGEND} />
          <SponsorCard />
        </aside>
      </div>
    </>
  );
}

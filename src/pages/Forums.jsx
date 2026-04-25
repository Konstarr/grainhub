import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/forums.css';
import PageHeader from '../components/forums/PageHeader.jsx';
import ToolbarSection from '../components/forums/ToolbarSection.jsx';
import { SponsorFeatured, SponsorMulti } from '../components/sponsors/AdSlot.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import ForumGroup from '../components/forums/ForumGroup.jsx';
import OnlineUsersStrip from '../components/forums/OnlineUsersStrip.jsx';
import HotTopicsStrip from '../components/forums/HotTopicsStrip.jsx';
import ForumStats from '../components/forums/ForumStats.jsx';
import TopContributors from '../components/forums/TopContributors.jsx';
import ForumGuidelines from '../components/forums/ForumGuidelines.jsx';
import ThreadLegend from '../components/forums/ThreadLegend.jsx';
import ForumsLeftSidebar from '../components/forums/ForumsLeftSidebar.jsx';
import TradeFilterBanner from '../components/layout/TradeFilterBanner.jsx';
import { matchesTrade } from '../lib/trades.js';
import { getForumLastVisits } from '../lib/forumLastVisit.js';
import {
  FORUMS_PAGE_HEADER,
  FORUM_GROUPS,
  ONLINE_MEMBERS,
  FORUM_GUIDELINES,
  THREAD_LEGEND,
} from '../data/forumsData.js';
import { mapThreadRow } from '../lib/mappers.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchForumCounters,
  fetchCategoryCounters,
  fetchTopReputation,
  fetchMySubscribedThreads,
  fetchMyPostThreads,
  fetchRecentThreadsWithLastPost,
} from '../lib/forumDb.js';

const AV_PALETTE = ['av-a', 'av-b', 'av-c', 'av-d', 'av-e'];
const CAT_COLORS = [
  { bg: '#EDE0C4', text: '#6B3F1F' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#E9F5E6', text: '#2E6F2E' },
  { bg: '#FBEDE0', text: '#A05C1F' },
  { bg: '#F0E7FA', text: '#5E2E8F' },
];

const VIEW_TITLES = {
  '':              'Recent Activity',
  hot:             'Hot Today',
  new:             'New Posts',
  unanswered:      'Unanswered Threads',
  solved:          'Solved Threads',
  subscriptions:   'My Subscriptions',
  'my-posts':      'My Posts',
};

const VIEW_EMPTIES = {
  '':              'No forum threads yet.',
  hot:             'No hot discussions in the last 24 hours.',
  new:             'No new threads in the last 48 hours.',
  unanswered:      'No unanswered threads right now.',
  solved:          'No threads marked as solved yet.',
  subscriptions:   "You aren't subscribed to any threads. Open a thread and click Subscribe to start tracking it.",
  'my-posts':      "You haven't started or replied in any threads yet.",
};

function hashSlug(s) {
  const str = s || '';
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
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
    slug: t.slug,
    avatar: initials,
    avatarColor,
    title: t.title,
    category: 'Discussion',
    categoryBg: cat.bg,
    categoryText: cat.text,
    author: t.lastAuthor || 'Community',
    lastAuthor: t.lastAuthor,
    lastAuthorUsername: t.lastAuthorUsername,
    lastAuthorAvatar: t.lastAuthorAvatar,
    lastSnippet: t.lastSnippet,
    time: t.lastReplyAgo || 'recently',
    replies: t.replyCount,
    views: t.viewCount,
    badges,
    isUnread: false,
    _raw: row,
  };
}

export default function Forums() {
  const [searchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';
  const navGroup = searchParams.get('group') || '';   // SecondaryNav group pill
  const view = searchParams.get('view') || '';
  const { user, isAuthed } = useAuth();

  const [threadRows, setThreadRows] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchRecentThreadsWithLastPost(50);
      if (!cancelled) setThreadRows(data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  const [customRows, setCustomRows] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (view === 'subscriptions' && isAuthed) {
        setCustomLoading(true);
        const res = await fetchMySubscribedThreads(user.id, 50);
        if (!cancelled) setCustomRows(res.data || []);
      } else if (view === 'my-posts' && isAuthed) {
        setCustomLoading(true);
        const res = await fetchMyPostThreads(user.id, 50);
        if (!cancelled) setCustomRows(res.data || []);
      } else {
        setCustomRows(null);
      }
      if (!cancelled) setCustomLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [view, isAuthed, user?.id]);

  const sourceRows = customRows != null ? customRows : threadRows;
  const liveActivity = useMemo(() => sourceRows.map(toActivityItem), [sourceRows]);

  // Compute real "trending" threads from the live thread set.
  // Ranking = recency-boosted activity: replies × views × recency-decay.
  // Everything stale (> 14 days) drops out so the strip stays current.
  const trendingTopics = useMemo(() => {
    const now = Date.now();
    const MAX_AGE = 14 * 24 * 60 * 60 * 1000;
    const scored = (threadRows || [])
      .map((r) => {
        const last = r.last_reply_at ? new Date(r.last_reply_at).getTime() : 0;
        const age = Math.max(1, now - last);
        if (age > MAX_AGE) return null;
        // Favor threads with replies in the last few days; views act as tiebreaker.
        const replies = r.reply_count || 0;
        const views = r.view_count || 0;
        const recency = 1 / Math.log2(2 + age / (24 * 60 * 60 * 1000));
        const score = (replies * 5 + views * 0.1 + 1) * recency;
        return { title: r.title, slug: r.slug, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
    return scored;
  }, [threadRows]);

  const viewFiltered = useMemo(() => {
    if (!view || view === 'subscriptions' || view === 'my-posts') return liveActivity;
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    return liveActivity.filter((item) => {
      const raw = item._raw || {};
      const last = raw.last_reply_at ? new Date(raw.last_reply_at).getTime() : 0;
      if (view === 'hot') return (now - last) < DAY && (raw.reply_count || 0) >= 1;
      if (view === 'new') return (now - last) < 2 * DAY;
      if (view === 'unanswered') return (raw.reply_count || 0) === 0;
      if (view === 'solved') return !!raw.is_solved;
      return true;
    });
  }, [liveActivity, view]);

  const filteredActivity = trade
    ? viewFiltered.filter((item) => matchesTrade(item, trade))
    : viewFiltered;

  const [counters, setCounters] = useState(null);
  const [topContribs, setTopContribs] = useState([]);
  const [catCounts, setCatCounts] = useState(new Map());
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchForumCounters();
      const topRes = await fetchTopReputation(5);
      // Per-user, per-category last-visit timestamps from
      // localStorage. fetchCategoryCounters uses each entry as the
      // cutoff for the "X new" badge; missing entries fall back to
      // a 30-day window inside the fetcher.
      const cat = await fetchCategoryCounters(getForumLastVisits());
      if (cancelled) return;
      setCounters(c);
      setTopContribs(topRes.data || []);
      setCatCounts(cat);
    })();
    return () => { cancelled = true; };
  }, []);

  const liveStats = useMemo(() => {
    if (!counters) return [];
    return [
      { label: 'Total posts',   value: counters.postsTotal.toLocaleString() },
      { label: 'Total threads', value: counters.threadsTotal.toLocaleString() },
      { label: 'Members',       value: counters.membersTotal.toLocaleString() },
      { label: 'Posts today',   value: counters.postsToday.toLocaleString(), isHighlight: true },
    ];
  }, [counters]);

  const liveContribs = useMemo(() => {
    return topContribs.map((p, i) => ({
      rank: i + 1,
      name: p.full_name || p.username,
      meta: (p.badge_count || 0) + ' badge' + ((p.badge_count || 0) === 1 ? '' : 's'),
      points: (p.reputation || 0).toLocaleString() + ' rep',
      initials: (p.full_name || p.username || '??').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
      avatarColor: AV_PALETTE[i % AV_PALETTE.length],
    }));
  }, [topContribs]);

  const viewTitle = VIEW_TITLES[view] || VIEW_TITLES[''];
  const viewEmpty = VIEW_EMPTIES[view] || VIEW_EMPTIES[''];

  const groupsWithLive = useMemo(() => {
    const source = navGroup
      ? FORUM_GROUPS.filter((g) => g.id === navGroup)
      : FORUM_GROUPS;
    return source.map((g) => {
      let groupPosts = 0;
      const categories = g.categories.map((c) => {
        const live = catCounts.get(c.id);
        if (live) {
          groupPosts += live.posts;
          // Replace the hardcoded newCount/isNew on the static forum
          // catalog with the live, per-user "new since last visit"
          // tally. isNew is just a non-zero count so the existing
          // ForumGroup render logic doesn't need to change.
          const newCount = live.newCount || 0;
          return {
            ...c,
            threads: live.threads,
            posts: live.posts,
            newCount,
            isNew: newCount > 0,
          };
        }
        return { ...c, threads: 0, posts: 0, newCount: 0, isNew: false };
      });
      return {
        ...g,
        forumCount: categories.length,
        postCount: groupPosts,
        categories,
      };
    });
  }, [catCounts, navGroup]);

  return (
    <>
      <PageHeader data={FORUMS_PAGE_HEADER} />
      <ToolbarSection />

      <div className="main-wrap main-wrap-3col">
        <ForumsLeftSidebar />
        <div>
          <TradeFilterBanner />

          <OnlineUsersStrip data={ONLINE_MEMBERS} />
          <HotTopicsStrip topics={trendingTopics} />

          {!view && (
            <div className="forum-groups">
              {groupsWithLive.map((group) => (
                <ForumGroup key={group.id} group={group} />
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '24px', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              {viewTitle}
            </h2>
            {customLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
                Loading...
              </div>
            ) : filteredActivity.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
                {viewEmpty}
              </div>
            ) : (
              <RecentActivity items={filteredActivity} />
            )}
          </div>
        </div>


        <aside className="right-col">
          <SponsorFeatured />
          <ForumStats stats={liveStats} />
          <TopContributors contributors={liveContribs} />
          <ForumGuidelines guidelines={FORUM_GUIDELINES} />
          <ThreadLegend items={THREAD_LEGEND} />
          <SponsorMulti />
        </aside>
      </div>
    </>
  );
}

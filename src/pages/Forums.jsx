import { useSearchParams } from 'react-router-dom';
import '../styles/forums.css';
import PageHeader from '../components/forums/PageHeader.jsx';
import ToolbarSection from '../components/forums/ToolbarSection.jsx';
import OnlineUsersStrip from '../components/forums/OnlineUsersStrip.jsx';
import HotTopicsStrip from '../components/forums/HotTopicsStrip.jsx';
import ForumGroup from '../components/forums/ForumGroup.jsx';
import RecentActivity from '../components/forums/RecentActivity.jsx';
import TopContributors from '../components/forums/TopContributors.jsx';
import ForumStats from '../components/forums/ForumStats.jsx';
import ForumGuidelines from '../components/forums/ForumGuidelines.jsx';
import ThreadLegend from '../components/forums/ThreadLegend.jsx';
import SponsorCard from '../components/forums/SponsorCard.jsx';
import TradeFilterBanner from '../components/layout/TradeFilterBanner.jsx';
import { matchesTrade } from '../lib/trades.js';
import { FORUMS_PAGE_HEADER, FORUM_GROUPS, RECENT_ACTIVITY_ITEMS, TOP_CONTRIBUTORS, FORUM_STATS, FORUM_GUIDELINES, THREAD_LEGEND, ONLINE_MEMBERS, HOT_TOPICS } from '../data/forumsData.js';

export default function Forums() {
  const [searchParams] = useSearchParams();
  const trade = searchParams.get('trade') || '';

  // Filter nested forum categories by trade; drop groups with 0 matches.
  const filteredGroups = trade
    ? FORUM_GROUPS
        .map((g) => ({ ...g, categories: g.categories.filter((c) => matchesTrade(c, trade)) }))
        .filter((g) => g.categories.length > 0)
    : FORUM_GROUPS;

  const filteredActivity = trade
    ? RECENT_ACTIVITY_ITEMS.filter((item) => matchesTrade(item, trade))
    : RECENT_ACTIVITY_ITEMS;

  return (
    <>
      <PageHeader data={FORUMS_PAGE_HEADER} />
      <ToolbarSection />

      <div className="main-wrap">
        <div>
          <TradeFilterBanner />
          <OnlineUsersStrip data={ONLINE_MEMBERS} />
          <HotTopicsStrip topics={HOT_TOPICS} />

          {filteredGroups.length === 0 ? (
            <div className="forum-empty">
              No forum categories match this trade yet. Try another, or clear the filter.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <ForumGroup key={group.id} group={group} />
            ))
          )}

          <RecentActivity items={filteredActivity} />
        </div>

        <aside className="right-col">
          <TopContributors contributors={TOP_CONTRIBUTORS} />
          <SponsorCard />
          <div className="rs-card">
            <div className="rs-header">⚡ Quick Start</div>
            <div className="rs-body">
              <div className="qs-grid">
                <div className="qs-item">
                  <div className="qs-icon">✏️</div>
                  <div className="qs-label">New Thread</div>
                </div>
                <div className="qs-item">
                  <div className="qs-icon">❓</div>
                  <div className="qs-label">Ask a Question</div>
                </div>
                <div className="qs-item">
                  <div className="qs-icon">📸</div>
                  <div className="qs-label">Show Your Work</div>
                </div>
                <div className="qs-item">
                  <div className="qs-icon">👋</div>
                  <div className="qs-label">Introduce Yourself</div>
                </div>
              </div>
            </div>
          </div>
          <ForumStats stats={FORUM_STATS} />
          <ForumGuidelines guidelines={FORUM_GUIDELINES} />
          <ThreadLegend items={THREAD_LEGEND} />
        </aside>
      </div>
    </>
  );
}

import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { FORUM_TABS, FORUM_POSTS } from '../../data/homeData.js';

export default function ForumSection() {
  // The tabs are visual-only for now — they don't actually filter posts yet.
  // Once the backend exists, swap each tab for a query.
  const [activeTab, setActiveTab] = useState(FORUM_TABS[0]);

  return (
    <div className="forum-section">
      <SectionHeader title="Forum Discussions" linkLabel="All forums →" />

      <div className="forum-tabs">
        {FORUM_TABS.map((tab) => (
          <button
            key={tab}
            className={`forum-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="forum-posts">
        {FORUM_POSTS.map((post) => (
          <div key={post.title} className="forum-post">
            <div className={`forum-avatar ${post.avatarColor}`}>{post.avatar}</div>
            <div className="forum-post-body">
              <div className="forum-post-title">{post.title}</div>
              <div className="forum-post-meta">{post.meta}</div>
            </div>
            <div className="forum-stats">
              <div className="forum-stat">
                <span className="forum-stat-num">{post.replies}</span>replies
              </div>
              <div className="forum-stat">
                <span className="forum-stat-num">{post.views}</span>views
              </div>
            </div>
            {post.statusTag && (
              <span className={`forum-post-tag ${post.statusTag.variant}`}>
                {post.statusTag.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

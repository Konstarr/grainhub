import { Link } from 'react-router-dom';

export default function RecentActivity({ items }) {
  return (
    <div className="recent-activity">
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Recent Activity
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--wood-warm)', fontWeight: '500', cursor: 'pointer' }}>See all →</span>
      </div>
      <div className="activity-list">
        {items.map((item) => (
          <Link key={item.id} to="/forums/thread" className={`activity-item ${item.isUnread ? 'unread' : ''}`}>
            <div className={`act-avatar ${item.avatarColor}`}>{item.avatar}</div>
            <div className="act-body">
              <div className="act-title">{item.title}</div>
              <div className="act-meta">
                <span className="act-cat-badge" style={{ background: item.categoryBg, color: item.categoryText }}>
                  {item.category}
                </span>
                <span>{item.author}</span>
                <span>·</span>
                <span>{item.time}</span>
              </div>
            </div>
            <div className="act-stats">
              <div className="act-stat">
                <span className="act-stat-num">{item.replies}</span>replies
              </div>
              <div className="act-stat">
                <span className="act-stat-num">{item.views}</span>views
              </div>
            </div>
            <div className="act-badges">
              {item.badges.map((badge, idx) => (
                <span key={idx} className={`thread-badge ${badge.className}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

function lastAuthorInitials(name) {
  if (!name) return '??';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '??';
}

export default function RecentActivity({ items }) {
  return (
    <div className="recent-activity">
      <div
        style={{
          fontFamily: "'Montserrat',serif",
          fontSize: '20px',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          paddingBottom: '0.6rem',
          borderBottom: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Recent Activity
        <span
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize: '13px',
            color: 'var(--wood-warm)',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          See all →
        </span>
      </div>

      <div className="activity-list">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.slug ? `/forums/thread/${item.slug}` : '/forums/thread'}
            className={`activity-item ${item.isUnread ? 'unread' : ''}`}
          >
            <div className={`act-avatar ${item.avatarColor}`}>{item.avatar}</div>

            <div className="act-body">
              <div className="act-title">{item.title}</div>

              <div className="act-meta">
                <span
                  className="act-cat-badge"
                  style={{ background: item.categoryBg, color: item.categoryText }}
                >
                  {item.category}
                </span>
                {item.lastAuthor && (
                  <>
                    <span className="act-meta-lead">Last reply by</span>
                    <span className="act-meta-author">{item.lastAuthor}</span>
                    <span>·</span>
                  </>
                )}
                <span>{item.time}</span>
              </div>

              {item.lastSnippet && (
                <div className="act-snippet">
                  {item.lastAuthorAvatar ? (
                    <img
                      className="act-snippet-avatar"
                      src={item.lastAuthorAvatar}
                      alt=""
                    />
                  ) : (
                    <div className="act-snippet-avatar act-snippet-avatar-fallback">
                      {lastAuthorInitials(item.lastAuthor)}
                    </div>
                  )}
                  <div className="act-snippet-text">
                    <span className="act-snippet-quote">&ldquo;</span>
                    {item.lastSnippet}
                  </div>
                </div>
              )}
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

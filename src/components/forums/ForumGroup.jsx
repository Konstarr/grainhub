import { Link } from 'react-router-dom';

export default function ForumGroup({ group }) {
  const getIconGradient = (color) => {
    const gradients = {
      brown: 'linear-gradient(135deg, #4A2A12, #8A5030)',
      green: 'linear-gradient(135deg, #1A3A10, #3A6A20)',
      blue: 'linear-gradient(135deg, #1A2E48, #2D4A78)',
      purple: 'linear-gradient(135deg, #2A1A48, #5A3A88)',
      teal: 'linear-gradient(135deg, #0A2A28, #1A5A58)',
      red: 'linear-gradient(135deg, #3A0A0A, #7A2020)',
      gray: 'linear-gradient(135deg, #1A1A1A, #4A4A4A)',
      amber: 'linear-gradient(135deg, #3A2808, #7A5020)',
    };
    return gradients[color] || gradients.gray;
  };

  const getCategoryIconGradient = (color) => {
    const gradients = {
      brown: 'linear-gradient(135deg,#4A2A12,#8A5030)',
      green: 'linear-gradient(135deg,#1A3010,#3A6A20)',
      blue: 'linear-gradient(135deg,#1A2E48,#2D4A78)',
      purple: 'linear-gradient(135deg,#2A1A48,#5A3A88)',
      teal: 'linear-gradient(135deg,#0A2A28,#1A5A58)',
      red: 'linear-gradient(135deg,#3A1010,#7A2828)',
      gray: 'linear-gradient(135deg,#1A1A1A,#4A4A4A)',
      amber: 'linear-gradient(135deg,#3A2808,#7A5020)',
    };
    return gradients[color] || gradients.gray;
  };

  return (
    <div className="forum-group">
      <div className="forum-group-header">
        <div className="fgh-icon" style={{ background: getIconGradient(group.iconColor) }}>
          {group.icon}
        </div>
        <div className="fgh-info">
          <div className="fgh-name">{group.name}</div>
          <div className="fgh-desc">{group.description}</div>
        </div>
        <div className="fgh-stats">
          {group.forumCount} forums &nbsp;·&nbsp; {group.postCount.toLocaleString()} posts
        </div>
      </div>
      <div className="forum-categories">
        {group.categories.map((cat) => (
          <Link key={cat.id} to={`/forums/category/${cat.id}`} className={`forum-cat ${cat.isNew ? 'has-new' : ''}`}>
            <div className="cat-icon-cell">
              <div className="cat-icon" style={{ background: getCategoryIconGradient(cat.iconColor) }}>
                {cat.icon}
              </div>
            </div>
            <div className="cat-info-cell">
              <div className="cat-name">
                {cat.name}
                {cat.isNew && <span className="new-posts-badge">{cat.newCount} new</span>}
              </div>
              <div className="cat-description">{cat.description}</div>
              <div className="cat-latest">
                <div className={`cat-latest-av ${cat.latestUser.color}`}>{cat.latestUser.initials}</div>
                <div className="cat-latest-text">
                  Latest: <a>{cat.latestTitle}</a> — {cat.latestAuthor}, {cat.latestTime}
                </div>
              </div>
            </div>
            <div className="cat-stats-cell">
              <div className="cat-stat">
                <div className="cat-stat-num">{cat.posts.toLocaleString()}</div>
                <div className="cat-stat-label">Posts</div>
              </div>
              <div className="cat-stat">
                <div className="cat-stat-num">{cat.threads.toLocaleString()}</div>
                <div className="cat-stat-label">Threads</div>
              </div>
              <div className="cat-stat">
                <div className="cat-stat-num">{(cat.views || 0).toLocaleString()}</div>
                <div className="cat-stat-label">Views</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
t-num">{(cat.views || 0).toLocaleString()}</div>
                <div className="cat-stat-label">Views</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

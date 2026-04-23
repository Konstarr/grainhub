import { Link } from 'react-router-dom';
import { NEWS_STORIES } from '../../data/newsData.js';

function NewsCard({ story }) {
  const colorClasses = {
    default: 'default',
    green: 'green',
    blue: 'blue',
    amber: 'amber',
    red: 'red',
    purple: 'purple',
    teal: 'teal',
  };

  return (
    <Link to="/news/article" className="news-card">
      <div className="news-card-img" style={{ background: story.imgGradient }}>
        <span className={`story-kicker ${colorClasses[story.kicker.color]}`}>
          {story.kicker.label}
        </span>
      </div>
      <div className="news-card-body">
        <div className="story-meta-top">
          <span>{story.category}</span>
          <span className="story-meta-dot">·</span>
          <span>{story.publishedDate}</span>
          <span className="story-meta-dot">·</span>
          <span>{story.readTime}</span>
        </div>
        <h3 className="news-card-title">{story.title}</h3>
        <p className="news-card-excerpt">{story.excerpt}</p>
        <div className="story-footer">
          <div className="story-author">
            <div className="author-avatar">{story.author.initials}</div>
            <span>{story.author.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewsGrid() {
  return (
    <div className="news-grid">
      {NEWS_STORIES.map((story) => (
        <NewsCard key={story.title} story={story} />
      ))}
    </div>
  );
}

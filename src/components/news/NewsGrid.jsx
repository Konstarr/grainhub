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

  const fallback = 'linear-gradient(135deg,#1C0E05,#6B3820)';
  const bg = story.coverImage
    ? 'url("' + story.coverImage + '") center/cover no-repeat, ' + (story.imgGradient || fallback)
    : (story.imgGradient || fallback);

  return (
    <Link to={story.slug ? '/news/article/' + story.slug : '/news'} className="news-card">
      <div className="news-card-img" style={{ background: bg }}>
        {story.kicker && (
          <span className={'story-kicker ' + colorClasses[story.kicker.color]}>
            {story.kicker.label}
          </span>
        )}
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
        {story.author && (
          <div className="story-footer">
            <div className="story-author">
              <div className="author-avatar">{story.author.initials}</div>
              <span>{story.author.name}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function NewsGrid({ stories }) {
  const list = stories || NEWS_STORIES;
  return (
    <div className="news-grid">
      {list.map((s) => (
        <NewsCard key={s.id || s.slug || s.title} story={s} />
      ))}
    </div>
  );
}

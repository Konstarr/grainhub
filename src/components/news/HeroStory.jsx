import { Link } from 'react-router-dom';
import { HERO_STORY } from '../../data/newsData.js';

export default function HeroStory({ story }) {
  const s = story || HERO_STORY;
  const colorClasses = {
    default: 'default',
    green: 'green',
    blue: 'blue',
    amber: 'amber',
    red: 'red',
    purple: 'purple',
    teal: 'teal',
  };

  const fallbackGradient = 'linear-gradient(135deg,#1C0E05,#6B3820)';
  const bg = s.coverImage
    ? `url("${s.coverImage}") center/cover no-repeat, ${s.imgGradient || fallbackGradient}`
    : (s.imgGradient || fallbackGradient);

  return (
    <Link to="/news/article" className="hero-story">
      <div className="hero-story-img" style={{ background: bg }}>
        {s.kicker && (
          <span className={'story-kicker ' + colorClasses[s.kicker.color]}>
            {s.kicker.label}
          </span>
        )}
      </div>
      <div className="hero-story-body">
        <div className="story-meta-top">
          <span>{s.category}</span>
          <span className="story-meta-dot">·</span>
          <span>{s.publishedDate}</span>
          <span className="story-meta-dot">·</span>
          <span>{s.readTime}</span>
        </div>
        <h2 className="hero-story-title">{s.title}</h2>
        <p className="hero-story-excerpt">{s.excerpt}</p>
        {s.author && (
          <div className="story-footer">
            <div className="story-author">
              <div className="author-avatar">{s.author.initials}</div>
              <span>{s.author.name}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { HERO_STORY } from '../../data/newsData.js';

export default function HeroStory() {
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
    <Link to="/news/article" className="hero-story">
      <div className="hero-story-img" style={{ background: HERO_STORY.imgGradient }}>
        <span className={`story-kicker ${colorClasses[HERO_STORY.kicker.color]}`}>
          {HERO_STORY.kicker.label}
        </span>
      </div>
      <div className="hero-story-body">
        <div className="story-meta-top">
          <span>{HERO_STORY.category}</span>
          <span className="story-meta-dot">·</span>
          <span>{HERO_STORY.publishedDate}</span>
          <span className="story-meta-dot">·</span>
          <span>{HERO_STORY.readTime}</span>
        </div>
        <h2 className="hero-story-title">{HERO_STORY.title}</h2>
        <p className="hero-story-excerpt">{HERO_STORY.excerpt}</p>
        <div className="story-footer">
          <div className="story-author">
            <div className="author-avatar">{HERO_STORY.author.initials}</div>
            <span>{HERO_STORY.author.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

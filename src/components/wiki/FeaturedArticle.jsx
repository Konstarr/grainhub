import { Link } from 'react-router-dom';

/**
 * Featured article hero card. If an article prop is provided (from Supabase),
 * render it as the feature. Otherwise render a static placeholder.
 */
export default function FeaturedArticle({ article }) {
  if (!article) return null;

  const bg = article.coverImage
    ? 'url("' + article.coverImage + '") center/cover no-repeat, ' + article.imgGradient
    : article.imgGradient;

  const to = article.slug ? '/wiki/article/' + article.slug : '/wiki/article';

  return (
    <Link to={to} className="featured-article">
      <div className="fa-img" style={{ background: bg }}>
        <div className="fa-badge">⭐ Featured Article</div>
      </div>
      <div className="fa-body">
        <div className="fa-cat">{article.category}</div>
        <div className="fa-title">{article.title}</div>
        {article.excerpt && <div className="fa-excerpt">{article.excerpt}</div>}
        <div className="fa-meta">
          {article.readTime && <span>{article.readTime}</span>}
          <span className="read-more">Read Article →</span>
        </div>
      </div>
    </Link>
  );
}

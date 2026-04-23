import { FEATURED_ARTICLE } from '../../data/wikiData.js';

export default function FeaturedArticle() {
  return (
    <div className="featured-article">
      <div className="fa-img" style={{ background: 'linear-gradient(135deg,#1C0E05,#3D2010,#6B3820)' }}>
        <div className="fa-badge">⭐ Featured Article</div>
      </div>
      <div className="fa-body">
        <div className="fa-cat">{FEATURED_ARTICLE.category}</div>
        <div className="fa-title">{FEATURED_ARTICLE.title}</div>
        <div className="fa-excerpt">{FEATURED_ARTICLE.excerpt}</div>
        <div className="fa-meta">
          <div className="fa-rating">
            <span className="fa-stars">★★★★★</span>
            <span>{FEATURED_ARTICLE.rating} · {FEATURED_ARTICLE.ratingCount} ratings</span>
          </div>
          <span>{FEATURED_ARTICLE.monthlyViews} monthly views</span>
          <span>Last edited {FEATURED_ARTICLE.lastEdited}</span>
          <span className="read-more">Read Article →</span>
        </div>
      </div>
    </div>
  );
}

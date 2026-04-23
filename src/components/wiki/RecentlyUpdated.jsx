import { Link } from 'react-router-dom';
import { RECENTLY_UPDATED_ARTICLES } from '../../data/wikiData.js';

function ArticleCard({ article }) {
  const variantClass = article.badge.variant === 'featured' ? 'ab-featured' : 'ab-new';
  return (
    <Link to="/wiki/article" className="article-card">
      <div className="ac-img" style={{ background: article.imgGradient }}>
        <span className={`ac-badge ${variantClass}`}>{article.badge.label}</span>
      </div>
      <div className="ac-body">
        <div className="ac-cat">{article.category}</div>
        <div className="ac-title">{article.title}</div>
        <div className="ac-footer">
          <span className="ac-rating">{article.rating}</span>
          <span>{article.views}</span>
        </div>
      </div>
    </Link>
  );
}

export default function RecentlyUpdated({ articles }) {
  const list = articles && articles.length ? articles : RECENTLY_UPDATED_ARTICLES;
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Recently Updated</h2>
        <span className="section-link">All recent edits</span>
      </div>
      <div className="articles-grid">
        {list.map((article) => (
          <ArticleCard key={article.id || article.title} article={article} />
        ))}
      </div>
    </>
  );
}

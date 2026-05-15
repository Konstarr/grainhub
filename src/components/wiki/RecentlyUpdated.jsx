import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const variantClass = article.badge && article.badge.variant === 'featured' ? 'ab-featured' : 'ab-new';
  const fallback = 'linear-gradient(135deg,#2D5A3D,#2D6A4F)';
  const bg = article.coverImage
    ? 'url("' + article.coverImage + '") center/cover no-repeat, ' + (article.imgGradient || fallback)
    : (article.imgGradient || fallback);
  return (
    <Link to="/wiki/article" className="article-card">
      <div className="ac-img" style={{ background: bg }}>
        {article.badge && <span className={'ac-badge ' + variantClass}>{article.badge.label}</span>}
      </div>
      <div className="ac-body">
        <div className="ac-cat">{article.category}</div>
        <div className="ac-title">{article.title}</div>
        <div className="ac-footer">
          <span className="ac-rating">{article.rating || ''}</span>
          <span>{article.views || ''}</span>
        </div>
      </div>
    </Link>
  );
}

export default function RecentlyUpdated({ articles }) {
  const list = articles || [];
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Recently Updated</h2>
        <span className="section-link">All recent edits</span>
      </div>
      {list.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No wiki articles yet.
        </div>
      ) : (
        <div className="articles-grid">
          {list.map((a) => (
            <ArticleCard key={a.id || a.slug || a.title} article={a} />
          ))}
        </div>
      )}
    </>
  );
}

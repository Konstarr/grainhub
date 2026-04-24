import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const fallback = 'linear-gradient(135deg,#6B3F1F,#A0522D)';
  const bg = article.coverImage
    ? 'url("' + article.coverImage + '") center/cover no-repeat, ' + (article.imgGradient || fallback)
    : (article.imgGradient || fallback);
  const to = article.slug ? '/wiki/article/' + article.slug : '/wiki/article';

  return (
    <Link to={to} className="article-card">
      <div className="ac-img" style={{ background: bg }}>
        <span className="ac-badge ab-new">Article</span>
      </div>
      <div className="ac-body">
        <div className="ac-cat">{article.category}</div>
        <div className="ac-title">{article.title}</div>
        {article.excerpt && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.excerpt}
          </div>
        )}
        <div className="ac-footer">
          <span className="ac-rating">{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

export default function WikiArticleGrid({ articles = [], loading = false, title = 'All Articles', count = 0, totalCount = 0 }) {
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <span className="section-link">
          {loading ? 'Loading…' : (
            totalCount && count !== totalCount
              ? count + ' of ' + totalCount + ' articles'
              : count + ' article' + (count === 1 ? '' : 's')
          )}
        </span>
      </div>

      {loading && articles.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          Loading articles…
        </div>
      ) : articles.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No articles match your filters. Try a different category or search term.
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((a) => <ArticleCard key={a.id || a.slug || a.title} article={a} />)}
        </div>
      )}
    </>
  );
}

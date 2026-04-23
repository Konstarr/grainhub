import { BROWSE_BY_CATEGORY } from '../../data/wikiData.js';

export default function BrowseByCategory() {
  return (
    <div className="categories-section">
      <div className="section-header">
        <h2 className="section-title">Browse by Category</h2>
        <span className="section-link">All categories →</span>
      </div>
      <div className="cat-cards-grid">
        {BROWSE_BY_CATEGORY.map((cat) => (
          <div key={cat.name} className="cat-card">
            <div className={`cat-card-icon ${cat.iconClass}`}>{cat.icon}</div>
            <div className="cat-card-info">
              <div className="cat-card-name">{cat.name}</div>
              <div className="cat-card-desc">{cat.desc}</div>
              <div className="cat-card-meta">
                <span className="cat-card-count">{cat.count}</span>
              </div>
              <div className="cat-card-articles">
                {cat.articles.map((article) => (
                  <span key={article} className="cca-link">{article}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import '../styles/wikiArticle.css';
import { Link } from 'react-router-dom';
import { ARTICLE_DATA, ARTICLE_BODY, INFOBOX, RELATED_ARTICLES, ARTICLE_FOOTER, COMMENTS } from '../data/wikiArticleData.js';

function TableOfContents() {
  return (
    <div className="toc-col">
      <div className="toc-card">
        <div className="toc-header">Contents</div>
        <div className="toc-body">
          {ARTICLE_DATA.tableOfContents.map((item, idx) => (
            <a key={item.id} href={`#${item.id}`} className="toc-item">
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-header">Article Stats</div>
        <div className="stats-body">
          {ARTICLE_DATA.stats.map((stat) => (
            <div key={stat.label} className="stat-row">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-val">{stat.value}</div>
            </div>
          ))}
          <button className="contrib-btn">✏ Edit This Article</button>
        </div>
      </div>
    </div>
  );
}

function ArticleContent() {
  return (
    <article className="article">
      <div className="article-hero">
        <div className="hero-inner">
          <div className="article-category">{ARTICLE_DATA.category}</div>
          <h1 className="article-title">{ARTICLE_DATA.title}</h1>
          <p className="article-tagline">{ARTICLE_DATA.tagline}</p>
        </div>
      </div>

      <div className="article-meta-bar">
        <div className="meta-item">
          <strong>{ARTICLE_DATA.published}</strong>
        </div>
        <div className="meta-item">{ARTICLE_DATA.lastEdited}</div>
        <div className="meta-item">{ARTICLE_DATA.readTime}</div>
        <div className="meta-item">{ARTICLE_DATA.views} monthly views</div>
        <div className="quality-badge">{ARTICLE_DATA.qualityBadge.text}</div>
      </div>

      <div className="article-actions">
        <button className="art-btn">💬 Add Comment</button>
        <button className="art-btn edit">✏ Edit</button>
        <button className="art-btn">⭐ Rate This</button>
        <button className="art-btn">🔗 Share</button>
      </div>

      <div className="article-body">
        <div
          dangerouslySetInnerHTML={{ __html: ARTICLE_BODY }}
        />

        <div className="infobox">
          <div className="infobox-title">{INFOBOX.title}</div>
          <div className="infobox-img">{INFOBOX.icon}</div>
          <div className="infobox-body">
            {INFOBOX.specs.map((spec) => (
              <div key={spec.label} className="infobox-row">
                <div className="infobox-label">{spec.label}</div>
                <div className="infobox-value">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="related-section">
          <h2 className="related-title">Related Articles</h2>
          <div className="related-grid">
            {RELATED_ARTICLES.map((article) => (
              <Link key={article.title} to="/wiki/article" className="related-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rc-img" style={{ background: article.imgGradient }}>
                  <span className="rc-cat" style={{ background: article.badge === 'Featured' ? 'var(--wood-warm)' : 'var(--accent-green)' }}>
                    {article.badge}
                  </span>
                </div>
                <div className="rc-title">{article.title}</div>
                <div className="rc-meta">{article.category}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">Comments</h2>
            <span className="comments-count">{COMMENTS.length} comments</span>
          </div>
          <div className="comment-list">
            {COMMENTS.map((comment, idx) => (
              <div key={idx} className="comment">
                <div className="comment-av">{comment.initials}</div>
                <div className="comment-body">
                  <div className="comment-meta">
                    <strong>{comment.name}</strong> · {comment.time}
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function WikiArticle() {
  return (
    <div className="page-wrap">
      <TableOfContents />
      <ArticleContent />
    </div>
  );
}

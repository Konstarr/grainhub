import '../styles/newsArticle.css';
import { Link } from 'react-router-dom';
import { NEWS_ARTICLE, NEWS_ARTICLE_BODY, PULL_QUOTE, DATA_CALLOUT, INLINE_CHART, INFO_BOX, ARTICLE_TAGS, ARTICLE_FOOTER_DATA, RELATED_NEWS, FORUM_RELATED } from '../data/newsArticleData.js';

function RelatedSidebar() {
  return (
    <aside className="right-col">
      <div className="rs-card">
        <div className="rs-header">🔥 Related News</div>
        <div className="rs-body">
          {RELATED_NEWS.map((article) => (
            <Link key={article.title} to="/news/article" className="trending-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ti-num">{article.num}</div>
              <div className="ti-title">{article.title}</div>
              <div className="ti-meta">{article.meta}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rs-card">
        <div className="rs-header">💬 Forum Highlights</div>
        <div className="rs-body">
          {FORUM_RELATED.map((thread) => (
            <Link key={thread.title} to="/forums/thread" className="forum-thread-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ft-cat">{thread.category}</div>
              <div className="ft-title">{thread.title}</div>
              <div className="ft-meta">{thread.meta}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="newsletter-card">
        <div className="nl-title">The Weekly Grain</div>
        <div className="nl-sub">
          Industry news, forum highlights, and machinery deals — delivered every Tuesday morning.
        </div>
        <div className="nl-input-row">
          <input className="nl-input" type="email" placeholder="your@email.com" />
          <button className="nl-btn">Subscribe</button>
        </div>
      </div>

      <div className="sponsor-card">
        <div className="sp-label">Featured Sponsor</div>
        <div className="sp-title">Blum SERVO-DRIVE for Aventos</div>
        <div className="sp-sub">
          Effortless electronic opening of lift systems for all panel sizes — touch-to-open, fully integrated.
        </div>
        <Link to="/sponsor" className="sp-btn">Learn More &amp; Download Spec →</Link>
      </div>
    </aside>
  );
}

export default function NewsArticle() {
  return (
    <>
      <div className="breadcrumb-bar">
        <Link to="/news">News</Link>
        <span className="bc-sep">·</span>
        <span>Cabinet & Millwork Revenue Up 8.4%...</span>
      </div>

      <div className="na-wrap">
        <article>
          <div className="article-header">
            <div className="article-cat-row">
              <span className="article-cat">{NEWS_ARTICLE.category}</span>
              <span className={`article-tag tag-${NEWS_ARTICLE.tag.variant}`}>
                {NEWS_ARTICLE.tag.label}
              </span>
            </div>
            <h1 className="article-title">{NEWS_ARTICLE.title}</h1>
            <p className="article-deck">{NEWS_ARTICLE.deck}</p>

            <div className="byline">
              <div className="byline-author">
                <div className="author-av">{NEWS_ARTICLE.author.initials}</div>
                <div>
                  <div className="author-name">{NEWS_ARTICLE.author.name}</div>
                  <div className="author-title">{NEWS_ARTICLE.author.role}</div>
                </div>
              </div>
              <div className="byline-meta">
                <div className="byline-item">{NEWS_ARTICLE.published}</div>
                <div className="byline-item">{NEWS_ARTICLE.readTime}</div>
              </div>
              <div className="share-row">
                <span className="share-label">Share:</span>
                <button className="share-btn">𝕏</button>
                <button className="share-btn">f</button>
                <button className="share-btn">in</button>
                <button className="share-btn">@</button>
              </div>
            </div>
          </div>

          <div className="article-hero-img" style={{ background: NEWS_ARTICLE.heroImgGradient }}>
            <div className="hero-img-caption">{NEWS_ARTICLE.heroCaption}</div>
          </div>

          <div className="article-body">
            <div dangerouslySetInnerHTML={{ __html: NEWS_ARTICLE_BODY }} />

            <div className="pull-quote">
              <div className="pq-text">{PULL_QUOTE.text}</div>
              <div className="pq-attribution">{PULL_QUOTE.attribution}</div>
            </div>

            <div className="data-callout">
              <div className="dc-label">{DATA_CALLOUT.label}</div>
              <div className="dc-grid">
                {DATA_CALLOUT.stats.map((stat) => (
                  <div key={stat.num} className="dc-stat">
                    <div className="dc-num">{stat.num}</div>
                    <div className="dc-desc">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="inline-chart">
              <div className="chart-title">{INLINE_CHART.title}</div>
              <div className="chart-bars">
                {INLINE_CHART.data.map((row) => (
                  <div key={row.label} className="chart-row">
                    <div className="chart-label">{row.label}</div>
                    <div className="chart-bar-wrap">
                      <div
                        className={`chart-bar cb-${row.direction}`}
                        style={{ width: `${row.pct}%` }}
                      >
                        {row.pct}%
                      </div>
                    </div>
                    <div className={`chart-pct ${row.direction}`}>
                      {row.direction === 'up' && '↑'}
                      {row.direction === 'down' && '↓'}
                      {row.direction === 'flat' && '→'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-source">Source: {INLINE_CHART.source}</div>
            </div>

            <div className="info-box">
              <div className="ib-label">{INFO_BOX.label}</div>
              <div className="ib-text">{INFO_BOX.text}</div>
            </div>

            <div className="article-tags">
              {ARTICLE_TAGS.map((tag) => (
                <span key={tag} className="article-tag-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="article-footer">
              <div className="af-author">
                <div className="af-av">{ARTICLE_FOOTER_DATA.author.initials}</div>
                <div>
                  <div className="af-name">{ARTICLE_FOOTER_DATA.author.name}</div>
                  <div className="af-bio">{ARTICLE_FOOTER_DATA.author.bio}</div>
                </div>
              </div>
              <button className="af-follow">Follow {ARTICLE_FOOTER_DATA.author.initials}</button>
            </div>

            <div className="related-section">
              <h2 className="related-title">More on this topic</h2>
              <div className="related-grid">
                {RELATED_NEWS.map((article) => (
                  <Link key={article.title} to="/news/article" className="related-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="ri-num">{article.num}</div>
                    <div className="ri-title">{article.title}</div>
                    <div className="ri-meta">{article.meta}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </article>

        <RelatedSidebar />
      </div>
    </>
  );
}

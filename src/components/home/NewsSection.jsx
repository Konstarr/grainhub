import SectionHeader from './SectionHeader.jsx';
import { FEATURED_NEWS, NEWS_ITEMS } from '../../data/homeData.js';

function NewsTag({ label, color = 'default' }) {
  const cls = color === 'default' ? 'news-tag' : `news-tag ${color}`;
  return <span className={cls}>{label}</span>;
}

export default function NewsSection() {
  return (
    <>
      <SectionHeader title="Industry News" linkLabel="All news →" />

      {/* Featured article */}
      <div className="news-featured">
        <div className="news-featured-img">
          <NewsTag label={FEATURED_NEWS.tag} color={FEATURED_NEWS.tagColor} />
        </div>
        <div className="news-featured-body">
          <div className="news-featured-title">{FEATURED_NEWS.title}</div>
          <p className="news-featured-excerpt">{FEATURED_NEWS.excerpt}</p>
          <div className="news-featured-meta">
            <strong>{FEATURED_NEWS.source}</strong> &nbsp;·&nbsp; {FEATURED_NEWS.time} &nbsp;·&nbsp;{' '}
            {FEATURED_NEWS.readTime}
          </div>
        </div>
      </div>

      {/* Secondary stories */}
      <div className="news-list">
        {NEWS_ITEMS.map((item) => (
          <div key={item.title} className="news-item">
            <div className={`news-icon ${item.iconColor}`}>{item.icon}</div>
            <div className="news-item-body">
              <div className="news-item-title">{item.title}</div>
              <div className="news-item-meta">{item.meta}</div>
            </div>
            <NewsTag label={item.tag} color={item.tagColor} />
          </div>
        ))}
      </div>
    </>
  );
}

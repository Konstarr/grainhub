import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapNewsRow } from '../../lib/mappers.js';

const TAG_COLORS = ['default', 'green', 'blue', 'amber', 'red', 'purple', 'teal'];
function tagColorFor(slug) {
  const s = slug || '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length];
}

function NewsTag({ label, color = 'default' }) {
  const cls = color === 'default' ? 'news-tag' : 'news-tag ' + color;
  return <span className={cls}>{label}</span>;
}

export default function NewsSection() {
  const { data: rows } = useSupabaseList('news_articles', {
    filter: (q) => q.eq('is_published', true),
    order: { column: 'published_at', ascending: false },
    limit: 5,
  });

  const articles = rows.map(mapNewsRow);
  const featured = articles[0];
  const rest = articles.slice(1);

  if (!featured) {
    return (
      <>
        <SectionHeader title="Industry News" linkLabel="All news" linkTo="/news" />
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No news articles yet.
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Industry News" linkLabel="All news" linkTo="/news" />
      <Link to="/news/article" className="news-featured">
        <div
          className="news-featured-img"
          style={
            featured.coverImage
              ? { background: 'url("' + featured.coverImage + '") center/cover no-repeat' }
              : undefined
          }
        >
          <NewsTag label={featured.category || 'News'} color={tagColorFor(featured.slug)} />
        </div>
        <div className="news-featured-body">
          <div className="news-featured-title">{featured.title}</div>
          <p className="news-featured-excerpt">{featured.excerpt}</p>
          <div className="news-featured-meta">
            <strong>{featured.category || 'GrainHub'}</strong> &nbsp;&middot;&nbsp; {featured.date}
          </div>
        </div>
      </Link>

      {rest.length > 0 && (
        <div className="news-list">
          {rest.map((item) => (
            <Link key={item.id} to="/news/article" className="news-item">
              {item.coverImage ? (
                <div
                  className="news-icon default"
                  style={{
                    background: 'url("' + item.coverImage + '") center/cover no-repeat',
                    color: 'transparent',
                  }}
                />
              ) : (
                <div className={'news-icon ' + tagColorFor(item.slug)}>N</div>
              )}
              <div className="news-item-body">
                <div className="news-item-title">{item.title}</div>
                <div className="news-item-meta">
                  {item.category || 'News'} &middot; {item.date}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

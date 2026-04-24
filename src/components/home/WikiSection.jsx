import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapWikiRow } from '../../lib/mappers.js';

export default function WikiSection() {
  const { data: rows } = useSupabaseList('wiki_articles', {
    filter: (q) => q.eq('is_published', true),
    order: { column: 'updated_at', ascending: false },
    limit: 8,
  });

  const articles = rows.map(mapWikiRow);

  return (
    <div className="wiki-section">
      <SectionHeader
        title="Industry Wiki"
        linkLabel={articles.length > 0 ? 'Browse ' + articles.length + ' articles' : 'All wiki'}
        linkTo="/wiki"
      />
      {articles.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No wiki articles yet.
        </div>
      ) : (
        <div className="home-wiki-grid">
          {articles.map((a) => (
            <Link key={a.id} to="/wiki/article" className="wiki-card">
              {a.coverImage ? (
                <div
                  className="wiki-icon"
                  style={{
                    background: 'url("' + a.coverImage + '") center/cover no-repeat',
                    color: 'transparent',
                  }}
                />
              ) : (
                <div className="wiki-icon">W</div>
              )}
              <div className="wiki-card-title">{a.title}</div>
              <div className="wiki-card-desc">{a.excerpt || a.category}</div>
              <div className="wiki-card-count">{a.readTime || ''}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

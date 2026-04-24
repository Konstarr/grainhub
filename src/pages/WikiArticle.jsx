import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/wikiArticle.css';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function renderBody(body) {
  if (!body) return null;
  const looksLikeHtml = /<\w+[^>]*>/.test(body);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }
  return (
    <div style={{ whiteSpace: 'pre-line' }}>
      {body}
    </div>
  );
}

export default function WikiArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (!slug) {
        setArticle(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setArticle(null);
      } else {
        setArticle(mapWikiRow(data));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const title = article?.title || (loading ? 'Loading…' : 'Article not found');

  return (
    <>
      <PageBack
        backTo="/wiki"
        backLabel="Back to Wiki"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Wiki', to: '/wiki' },
          { label: title },
        ]}
      />
      <div className="wa-wrap">
        <aside className="toc-col">
          <div className="toc-card">
            <div className="toc-header">On this page</div>
            <div className="toc-body">
              <a href="#top" className="toc-item active">Introduction</a>
              {article?.category && (
                <a href="#top" className="toc-item sub">{article.category}</a>
              )}
              <a href="#references" className="toc-item">References</a>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-header">Article info</div>
            <div className="stats-body">
              {article?.readTime && (
                <div className="stat-row">
                  <div className="stat-label">Read time</div>
                  <div className="stat-val">{article.readTime}</div>
                </div>
              )}
              {article?.publishedAt && (
                <div className="stat-row">
                  <div className="stat-label">Published</div>
                  <div className="stat-val">{formatDate(article.publishedAt)}</div>
                </div>
              )}
              {article?.updatedAt && (
                <div className="stat-row">
                  <div className="stat-label">Updated</div>
                  <div className="stat-val">{formatDate(article.updatedAt)}</div>
                </div>
              )}
              {article?.trade && (
                <div className="stat-row">
                  <div className="stat-label">Trade</div>
                  <div className="stat-val">{article.trade}</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <article className="article" id="top">
          {article?.category && <div className="article-category">{article.category}</div>}
          <h1 className="article-title">{title}</h1>
          {article?.excerpt && <p className="article-tagline">{article.excerpt}</p>}

          <div className="article-meta-bar">
            <div className="meta-item">
              From <strong>GrainHub Wiki</strong>, the community knowledge base
            </div>
            {article?.updatedAt && <div className="meta-item">Last updated {formatDate(article.updatedAt)}</div>}
            {article?.readTime && <div className="meta-item">{article.readTime}</div>}
          </div>

          <div className="article-body">
            {/* Right-floated infobox (Wikipedia-style) */}
            {article && (
              <aside className="infobox">
                <div className="infobox-title">{article.title}</div>
                {article.coverImage ? (
                  <div className="infobox-img" style={{ padding: 0 }}>
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', display: 'block', border: 0 }} />
                  </div>
                ) : (
                  <div className="infobox-img">📚</div>
                )}
                <div className="infobox-body">
                  {article.category && (
                    <div className="infobox-row">
                      <div className="infobox-label">Category</div>
                      <div className="infobox-value">{article.category}</div>
                    </div>
                  )}
                  {article.trade && (
                    <div className="infobox-row">
                      <div className="infobox-label">Trade</div>
                      <div className="infobox-value">{article.trade}</div>
                    </div>
                  )}
                  {article.readTime && (
                    <div className="infobox-row">
                      <div className="infobox-label">Read time</div>
                      <div className="infobox-value">{article.readTime}</div>
                    </div>
                  )}
                  {article.publishedAt && (
                    <div className="infobox-row">
                      <div className="infobox-label">Published</div>
                      <div className="infobox-value">{formatDate(article.publishedAt)}</div>
                    </div>
                  )}
                  {article.updatedAt && (
                    <div className="infobox-row">
                      <div className="infobox-label">Updated</div>
                      <div className="infobox-value">{formatDate(article.updatedAt)}</div>
                    </div>
                  )}
                </div>
              </aside>
            )}

            {loading && <p style={{ color: 'var(--wp-text-muted)' }}>Loading article…</p>}
            {!loading && !article && (
              <p style={{ color: 'var(--wp-text-muted)' }}>
                We couldn't find that article. <Link to="/wiki">Back to the Wiki →</Link>
              </p>
            )}
            {article && (
              article.body
                ? renderBody(article.body)
                : <p style={{ color: 'var(--wp-text-muted)', fontStyle: 'italic' }}>
                    This article is a stub. Body content hasn't been added yet.
                  </p>
            )}

            <div style={{ clear: 'both' }} />
          </div>
        </article>
      </div>
    </>
  );
}

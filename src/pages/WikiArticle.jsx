import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/wikiArticle.css';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function renderBody(body) {
  if (!body) return null;
  // If the body contains HTML tags, render as HTML; otherwise render as paragraphs.
  const looksLikeHtml = /<\w+[^>]*>/.test(body);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }
  return (
    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '16px', color: 'var(--text-primary)' }}>
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
        <div className="toc-col">
          <div className="toc-card">
            <div className="toc-header">On this page</div>
            <div className="toc-body">
              {article ? (
                <>
                  <div className="toc-item" style={{ fontWeight: 600 }}>{article.title}</div>
                  {article.category && <div className="toc-item">{article.category}</div>}
                </>
              ) : (
                <div className="toc-item">…</div>
              )}
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-header">Article Info</div>
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
            </div>
          </div>
        </div>

        <article className="article">
          <div className="article-hero">
            <div className="hero-inner">
              {article?.category && <div className="article-category">{article.category}</div>}
              <h1 className="article-title">{title}</h1>
              {article?.excerpt && <p className="article-tagline">{article.excerpt}</p>}
            </div>
          </div>

          <div className="article-meta-bar">
            {article?.publishedAt && <div className="meta-item"><strong>Published {formatDate(article.publishedAt)}</strong></div>}
            {article?.updatedAt && <div className="meta-item">Updated {formatDate(article.updatedAt)}</div>}
            {article?.readTime && <div className="meta-item">{article.readTime}</div>}
          </div>

          <div className="article-body">
            {loading && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading article…</div>}
            {!loading && !article && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                We couldn't find that article. <Link to="/wiki">Back to the Wiki →</Link>
              </div>
            )}
            {article && (
              article.body
                ? renderBody(article.body)
                : <div style={{ color: 'var(--text-muted)' }}>This article doesn't have body content yet.</div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/wikiArticle.css';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function ArticleBody({ body }) {
  if (!body) return null;
  const looksLikeHtml = /<\w+[^>]*>/.test(body);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => {
          if (href && href.startsWith('/')) {
            return <Link to={href}>{children}</Link>;
          }
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        },
      }}
    >
      {body}
    </ReactMarkdown>
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
      if (!slug) { setArticle(null); setLoading(false); return; }
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) setArticle(null);
      else setArticle(mapWikiRow(data));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const title = article?.title || (loading ? 'Loading...' : 'Article not found');

  // Extract H2 headings for the TOC. Supports both markdown and HTML bodies.
  const tocItems = [];
  if (article?.body) {
    const looksLikeHtml = /<h2\b/i.test(article.body);
    if (looksLikeHtml) {
      const re = /<h2[^>]*\sid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;
      let m;
      while ((m = re.exec(article.body)) !== null) {
        const id = m[1].trim();
        const label = m[2].replace(/<[^>]+>/g, '').trim();
        if (label && id) tocItems.push({ label, id });
      }
    } else {
      const re = /^##\s+(.+?)$/gm;
      let m;
      while ((m = re.exec(article.body)) !== null) {
        const label = m[1].trim();
        const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        tocItems.push({ label, id });
      }
    }
  }

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
              {tocItems.map((t) => (
                <a key={t.id} href={'#' + t.id} className="toc-item">{t.label}</a>
              ))}
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-header">Article info</div>
            <div className="stats-body">
              {article?.readTime && (
                <div className="stat-row"><div className="stat-label">Read time</div><div className="stat-val">{article.readTime}</div></div>
              )}
              {article?.publishedAt && (
                <div className="stat-row"><div className="stat-label">Published</div><div className="stat-val">{formatDate(article.publishedAt)}</div></div>
              )}
              {article?.updatedAt && (
                <div className="stat-row"><div className="stat-label">Updated</div><div className="stat-val">{formatDate(article.updatedAt)}</div></div>
              )}
              {article?.trade && (
                <div className="stat-row"><div className="stat-label">Trade</div><div className="stat-val">{article.trade}</div></div>
              )}
              <button className="contrib-btn">Edit this article</button>
            </div>
          </div>

          <SponsorSidebar />
        </aside>

        <article className="article" id="top">
          {article?.category && <div className="article-category">{article.category}</div>}
          <h1 className="article-title">{title}</h1>
          {article?.excerpt && <p className="article-tagline">{article.excerpt}</p>}

          <div className="article-meta-bar">
            <div className="meta-item">From <strong>Millwork.io Wiki</strong>, the community knowledge base</div>
            {article?.updatedAt && <div className="meta-item">Last updated {formatDate(article.updatedAt)}</div>}
            {article?.readTime && <div className="meta-item">{article.readTime}</div>}
          </div>

          <div className="article-body">
            {article && (
              <aside className="infobox">
                <div className="infobox-title">{article.title}</div>
                {article.coverImage ? (
                  <div className="infobox-img" style={{ padding: 0 }}>
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', display: 'block', borderRadius: 0 }} />
                  </div>
                ) : (
                  <div className="infobox-img">Article</div>
                )}
                <div className="infobox-body">
                  {article.category && <div className="infobox-row"><div className="infobox-label">Category</div><div className="infobox-value">{article.category}</div></div>}
                  {article.trade && <div className="infobox-row"><div className="infobox-label">Trade</div><div className="infobox-value">{article.trade}</div></div>}
                  {article.readTime && <div className="infobox-row"><div className="infobox-label">Read time</div><div className="infobox-value">{article.readTime}</div></div>}
                  {article.publishedAt && <div className="infobox-row"><div className="infobox-label">Published</div><div className="infobox-value">{formatDate(article.publishedAt)}</div></div>}
                  {article.updatedAt && <div className="infobox-row"><div className="infobox-label">Updated</div><div className="infobox-value">{formatDate(article.updatedAt)}</div></div>}
                </div>
              </aside>
            )}

            {loading && <p style={{ color: 'var(--text-muted)' }}>Loading article...</p>}
            {!loading && !article && (
              <p style={{ color: 'var(--text-muted)' }}>
                We could not find that article. <Link to="/wiki">Back to the Wiki</Link>
              </p>
            )}
            {article && (
              article.body
                ? <ArticleBody body={article.body} />
                : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    This article is a stub. Body content has not been added yet.
                  </p>
            )}

            <div style={{ clear: 'both' }} />
          </div>
        </article>
      </div>
    </>
  );
}

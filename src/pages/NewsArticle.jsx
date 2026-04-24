import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/newsArticle.css';
import '../styles/editor.css';
import PageBack from '../components/shared/PageBack.jsx';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';
import { supabase } from '../lib/supabase.js';

/** Content may be either HTML (new editor) or markdown (legacy). */
function isHtml(body) {
  const v = String(body || '').trim();
  return v.startsWith('<');
}

/**
 * /news/article/:slug
 */
export default function NewsArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setErr(error); setLoading(false); return; }
      setArticle(data);

      // Bump view_count on every page load. The Trending This Week
      // card (and this page's own counter) reads view_count so real
      // readership drives ranking. Errors are logged so missing
      // migrations / RPC misconfigurations are visible during dev.
      if (data) {
        try {
          const { error: bumpErr } = await supabase.rpc('increment_news_view', {
            article_slug: data.slug,
          });
          if (bumpErr) {
            // Most common: migration-news-view-counter.sql hasn't been
            // run, so the function or view_count column doesn't exist.
            // eslint-disable-next-line no-console
            console.warn('[news] increment_news_view failed:', bumpErr.message || bumpErr);
          } else if (!cancelled) {
            // Optimistically reflect the bump in the rendered article
            // so a refresh shows the new count right away.
            setArticle((prev) => (prev ? { ...prev, view_count: (prev.view_count || 0) + 1 } : prev));
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[news] increment_news_view threw:', e?.message || e);
        }
      }
      if (data) {
        const { data: rel } = await supabase
          .from('news_articles')
          .select('id, slug, title, category, published_at, cover_image_url')
          .eq('is_published', true)
          .neq('id', data.id)
          .or(
            'category.eq.' + JSON.stringify(data.category || '') +
            ',trade.eq.' + JSON.stringify(data.trade || '')
          )
          .order('published_at', { ascending: false })
          .limit(5);
        if (!cancelled) setRelated(rel || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageBack backTo="/news" backLabel="Back to News" />
        <div className="na-wrap">
          <article>
            <div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading article…</div>
          </article>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageBack backTo="/news" backLabel="Back to News" />
        <div className="na-wrap">
          <article>
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>Article not found</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
                {err
                  ? 'Error: ' + (err.message || 'unknown')
                  : slug
                    ? 'No article matched slug: ' + slug
                    : 'No slug provided.'}
              </p>
              <Link to="/news" style={{ color: 'var(--wood-warm)' }}>← Back to News</Link>
            </div>
          </article>
        </div>
      </>
    );
  }

  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <>
      <PageBack
        backTo="/news"
        backLabel="Back to News"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'News', to: '/news' },
          { label: article.title },
        ]}
      />

      <div className="na-wrap">
        <article>
          {article.cover_image_url && (
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 7',
                backgroundImage: 'url(' + article.cover_image_url + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 14,
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
              }}
            />
          )}

          <div className="article-header">
            <div className="article-cat-row">
              {article.category && <span className="article-cat">{article.category}</span>}
              {article.trade && (
                <span className="article-tag tag-default">{article.trade}</span>
              )}
            </div>
            <h1 className="article-title">{article.title}</h1>
            {article.excerpt && (
              <p className="article-lede" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, margin: '0.75rem 0 1rem' }}>
                {article.excerpt}
              </p>
            )}
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {dateStr}
              {article.source_url && (
                <>
                  {' · '}
                  <a href={article.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--wood-warm)' }}>
                    Source
                  </a>
                </>
              )}
            </div>
          </div>

          {isHtml(article.body) ? (
            <div
              className="gh-article"
              dangerouslySetInnerHTML={{ __html: article.body || '' }}
            />
          ) : (
            <div className="gh-article">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (<a {...props} target="_blank" rel="noopener noreferrer" />),
                  img: ({ node, ...props }) => (
                    <img {...props} loading="lazy" />
                  ),
                }}
              >
                {article.body || ''}
              </ReactMarkdown>
            </div>
          )}
        </article>

        <aside className="right-col">
          <SponsorSidebar />
          <div className="rs-card">
            <div className="rs-header">🔥 Related News</div>
            <div className="rs-body">
              {related.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                  No related articles yet.
                </div>
              )}
              {related.map((a, i) => (
                <Link
                  key={a.id}
                  to={'/news/article/' + a.slug}
                  className="trending-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="ti-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="ti-title">{a.title}</div>
                  <div className="ti-meta">
                    {a.category || 'News'}
                    {a.published_at
                      ? ' · ' + new Date(a.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : ''}
                  </div>
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
        </aside>
      </div>
    </>
  );
}

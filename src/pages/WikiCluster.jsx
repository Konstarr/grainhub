import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import { CLUSTERS, clusterBySlug, topicSlug } from '../data/wikiTaxonomy.js';
import '../styles/wikiDashboard.css';

/**
 * /wiki/cluster/:slug - the sub-page for one of the 18 fields.
 *
 * Shows the cluster's full sub-topic structure. Each sub-topic gets
 * its own row with article count and the articles it contains. Filter
 * the parent /wiki dashboard by clicking through.
 */
export default function WikiCluster() {
  const { slug } = useParams();
  const cluster = clusterBySlug(slug);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      setArticles((data || []).map((r) => ({ ...mapWikiRow(r), updatedAtRaw: r.updated_at })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Articles in this cluster — exact category match or heuristic fallback
  const inCluster = useMemo(() => {
    if (!cluster) return [];
    return articles.filter((a) => {
      const cat = (a.category || '').trim();
      if (cat === cluster.key || cat.toLowerCase() === cluster.key.toLowerCase()) return true;
      // Heuristic: any sub-topic regex matches the article body
      return cluster.subtopics.some((sub) =>
        sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
      );
    });
  }, [articles, cluster]);

  // For each sub-topic, the articles that belong to it
  const articlesBySubtopic = useMemo(() => {
    if (!cluster) return {};
    const map = {};
    cluster.subtopics.forEach((sub) => {
      map[sub.name] = inCluster.filter((a) =>
        sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
      );
    });
    return map;
  }, [cluster, inCluster]);

  if (!cluster) {
    return (
      <div className="wiki-dash">
        <PageBack backTo="/wiki" backLabel="Back to Wiki" />
        <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 2rem' }}>
          <h1>Field not found</h1>
          <p>The encyclopedia field you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/wiki">Back to the encyclopedia</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-dash">
      <PageBack
        backTo="/wiki"
        backLabel="Back to Wiki"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Wiki', to: '/wiki' },
          { label: cluster.key },
        ]}
      />

      {/* Cluster hero */}
      <section
        className="wd-cluster-hero"
        style={{
          background: 'linear-gradient(135deg, ' + cluster.accent + ' 0%, #1c0f06 100%)',
        }}
      >
        <div className="wd-cluster-hero-inner">
          <div className="wd-cluster-hero-icon">{cluster.icon}</div>
          <div>
            <div className="wd-hero-eyebrow">Encyclopedia field</div>
            <h1 className="wd-cluster-hero-title">{cluster.key}</h1>
            <p className="wd-cluster-hero-sub">{cluster.longDesc || cluster.desc}</p>
            <div className="wd-cluster-hero-stats">
              <div>
                <div className="wd-stat-num">{inCluster.length}</div>
                <div className="wd-stat-label">{inCluster.length === 1 ? 'article' : 'articles'}</div>
              </div>
              <div>
                <div className="wd-stat-num">{cluster.subtopics.length}</div>
                <div className="wd-stat-label">sub-topics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick jump nav across all 18 fields */}
      <nav className="wd-cluster-jump" aria-label="Other fields">
        <span className="wd-cluster-jump-label">Other fields:</span>
        {CLUSTERS.filter((c) => c.slug !== cluster.slug).map((c) => (
          <Link
            key={c.slug}
            to={'/wiki/cluster/' + c.slug}
            className="wd-cluster-jump-link"
            style={{ '--accent': c.accent }}
          >
            <span className="wd-cluster-jump-icon">{c.icon}</span>
            {c.key}
          </Link>
        ))}
      </nav>

      {/* Sub-topic sections */}
      <section className="wd-section">
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading articles...</p>}
        {!loading && cluster.subtopics.map((sub) => {
          const articlesInSub = articlesBySubtopic[sub.name] || [];
          return (
            <article
              className="wd-subtopic-section"
              key={sub.name}
              style={{ '--accent': cluster.accent }}
              id={topicSlug(sub.name)}
            >
              <header className="wd-subtopic-section-head">
                <div>
                  <h2 className="wd-subtopic-section-title">{sub.name}</h2>
                  <div className="wd-subtopic-section-meta">
                    {articlesInSub.length} {articlesInSub.length === 1 ? 'article' : 'articles'}
                  </div>
                </div>
                <Link to={'/forums/new?category=wiki-edits'} className="wd-subtopic-section-cta">
                  + Suggest an article
                </Link>
              </header>

              {articlesInSub.length === 0 ? (
                <div className="wd-subtopic-empty">
                  No articles in <strong>{sub.name}</strong> yet. This sub-topic is part of the {cluster.key} field
                  and is open for contribution.
                </div>
              ) : (
                <div className="wd-subtopic-articles">
                  {articlesInSub.map((a) => (
                    <Link to={'/wiki/article/' + a.slug} key={a.id} className="wd-subtopic-article">
                      {a.coverImage && (
                        <div className="wd-subtopic-article-img" style={{ backgroundImage: 'url(' + a.coverImage + ')' }}/>
                      )}
                      <div className="wd-subtopic-article-body">
                        <div className="wd-subtopic-article-title">{a.title}</div>
                        {a.excerpt && (
                          <div className="wd-subtopic-article-excerpt">
                            {a.excerpt.length > 160 ? a.excerpt.slice(0, 160) + '...' : a.excerpt}
                          </div>
                        )}
                        <div className="wd-subtopic-article-meta">
                          {a.readTime && <span>{a.readTime}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

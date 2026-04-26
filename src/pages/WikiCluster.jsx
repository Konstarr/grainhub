import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import { CLUSTERS, clusterBySlug } from '../data/wikiTaxonomy.js';
import '../styles/wikiDashboard.css';

/**
 * /wiki/cluster/:slug - master/detail field page.
 *
 * Left rail: full sub-topic list with article counts. Click any to filter.
 * Right pane: articles for the selected sub-topic (or "All in this field"
 * by default). Zero scroll to see the whole structure of the cluster.
 *
 * Selected sub-topic persists in the URL as ?topic=Slug so links and
 * back button work cleanly.
 */
export default function WikiCluster() {
  const { slug } = useParams();
  const [search, setSearch] = useSearchParams();
  const cluster = clusterBySlug(slug);
  const activeTopic = search.get('topic') || '';

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

  // Articles in this whole cluster
  const inCluster = useMemo(() => {
    if (!cluster) return [];
    return articles.filter((a) => {
      const cat = (a.category || '').trim();
      if (cat === cluster.key || cat.toLowerCase() === cluster.key.toLowerCase()) return true;
      return cluster.subtopics.some((sub) =>
        sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
      );
    });
  }, [articles, cluster]);

  // Article counts per sub-topic
  const subtopicCounts = useMemo(() => {
    if (!cluster) return {};
    const out = {};
    cluster.subtopics.forEach((sub) => {
      out[sub.name] = inCluster.filter((a) =>
        sub.match.test((a.title || '') + ' ' + (a.excerpt || ''))
      ).length;
    });
    return out;
  }, [cluster, inCluster]);

  // Currently visible articles based on selected sub-topic
  const visibleArticles = useMemo(() => {
    if (!cluster) return [];
    if (!activeTopic) return inCluster;
    const sub = cluster.subtopics.find((s) => s.name === activeTopic);
    if (!sub) return inCluster;
    return inCluster.filter((a) => sub.match.test((a.title || '') + ' ' + (a.excerpt || '')));
  }, [cluster, inCluster, activeTopic]);

  const selectTopic = (topicName) => {
    if (topicName) setSearch({ topic: topicName });
    else setSearch({});
  };

  if (!cluster) {
    return (
      <div className="wiki-dash">
        <PageBack backTo="/wiki" backLabel="Back to Wiki" />
        <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 2rem' }}>
          <h1>Field not found</h1>
          <Link to="/wiki">Back to the encyclopedia</Link>
        </div>
      </div>
    );
  }

  const titleSuffix = activeTopic ? ' — ' + activeTopic : '';

  return (
    <div className="wiki-dash">
      <PageBack
        backTo="/wiki"
        backLabel="Back to Wiki"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Wiki', to: '/wiki' },
          { label: cluster.key, to: '/wiki/cluster/' + cluster.slug },
          ...(activeTopic ? [{ label: activeTopic }] : []),
        ]}
      />

      {/* Compact cluster banner */}
      <section className="wd-cluster-banner" style={{ '--accent': cluster.accent }}>
        <div className="wd-cluster-banner-inner">
          <div className="wd-cluster-banner-id">
            <div className="wd-cluster-banner-icon">{cluster.icon}</div>
            <div className="wd-cluster-banner-text">
              <div className="wd-hero-eyebrow" style={{ marginBottom: 2 }}>Encyclopedia field</div>
              <h1 className="wd-cluster-banner-title">{cluster.key}{titleSuffix}</h1>
              <p className="wd-cluster-banner-sub">{cluster.desc}</p>
            </div>
          </div>
          <div className="wd-cluster-banner-stats">
            <div><strong>{inCluster.length}</strong> articles</div>
            <div><strong>{cluster.subtopics.length}</strong> sub-topics</div>
          </div>
        </div>

        {/* Inline jump to other fields */}
        <div className="wd-cluster-banner-jump">
          {CLUSTERS.filter((c) => c.slug !== cluster.slug).map((c) => (
            <Link key={c.slug} to={'/wiki/cluster/' + c.slug} className="wd-cluster-pill" style={{ '--accent': c.accent }}>
              {c.key}
            </Link>
          ))}
        </div>
      </section>

      {/* MASTER/DETAIL */}
      <section className="wd-md">
        <aside className="wd-md-rail">
          <div className="wd-md-rail-header">Sub-topics</div>
          <button
            type="button"
            className={'wd-md-item' + (activeTopic === '' ? ' active' : '')}
            onClick={() => selectTopic('')}
          >
            <span className="wd-md-item-name">All in this field</span>
            <span className="wd-md-item-count">{inCluster.length}</span>
          </button>
          {cluster.subtopics.map((sub) => {
            const n = subtopicCounts[sub.name] || 0;
            return (
              <button
                key={sub.name}
                type="button"
                className={'wd-md-item' + (activeTopic === sub.name ? ' active' : '')}
                onClick={() => selectTopic(sub.name)}
              >
                <span className="wd-md-item-name">{sub.name}</span>
                <span className="wd-md-item-count">{n}</span>
              </button>
            );
          })}
        </aside>

        <div className="wd-md-pane">
          <div className="wd-md-pane-head">
            <h2 className="wd-md-pane-title">
              {activeTopic || 'All in ' + cluster.key}
            </h2>
            <Link to="/forums/new?category=wiki-edits" className="wd-btn-primary" style={{ fontSize: 12.5, padding: '0.4rem 0.85rem' }}>
              + Suggest an article
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--wd-muted)' }}>Loading articles...</p>
          ) : visibleArticles.length === 0 ? (
            <div className="wd-md-empty">
              <div className="wd-md-empty-title">No articles {activeTopic ? 'in ' + activeTopic : 'yet in ' + cluster.key}</div>
              <p>This {activeTopic ? 'sub-topic' : 'field'} is open for contribution. Working pros get bylines and a public reviewer credit.</p>
              <Link to="/forums/new?category=wiki-edits" className="wd-btn-primary">
                Propose the first article
              </Link>
            </div>
          ) : (
            <div className="wd-md-articles">
              {visibleArticles.map((a) => (
                <Link to={'/wiki/article/' + a.slug} key={a.id} className="wd-md-article">
                  {a.coverImage && (
                    <div className="wd-md-article-img" style={{ backgroundImage: 'url(' + a.coverImage + ')' }}/>
                  )}
                  <div className="wd-md-article-body">
                    <div className="wd-md-article-cat">{a.category}</div>
                    <div className="wd-md-article-title">{a.title}</div>
                    {a.excerpt && (
                      <div className="wd-md-article-excerpt">
                        {a.excerpt.length > 160 ? a.excerpt.slice(0, 160) + '...' : a.excerpt}
                      </div>
                    )}
                    <div className="wd-md-article-meta">
                      {a.readTime && <span>{a.readTime}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useMemo, useRef, useState } from 'react';
import '../styles/wiki.css';
import WikiHero from '../components/wiki/WikiHero.jsx';
import WikiLeftNav from '../components/wiki/WikiLeftNav.jsx';
import WikiSidebar from '../components/wiki/WikiSidebar.jsx';
import FeaturedArticle from '../components/wiki/FeaturedArticle.jsx';
import WikiArticleGrid from '../components/wiki/WikiArticleGrid.jsx';
import ContributeCTA from '../components/wiki/ContributeCTA.jsx';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapWikiRow } from '../lib/mappers.js';

const WIKI_GRADIENTS = [
  'linear-gradient(135deg,#1A2E48,#2D4A78)',
  'linear-gradient(135deg,#1A3A10,#3A6A20)',
  'linear-gradient(135deg,#2A1A48,#5A3A88)',
  'linear-gradient(135deg,#3D1A2A,#8B3860)',
  'linear-gradient(135deg,#2A2010,#8B6820)',
  'linear-gradient(135deg,#102828,#2A7070)',
  'linear-gradient(135deg,#1C0E05,#6B3820)',
];
function gradientForSlug(slug = '') {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return WIKI_GRADIENTS[Math.abs(h) % WIKI_GRADIENTS.length];
}

function toWikiCard(row) {
  const m = mapWikiRow(row);
  return {
    id: m.id,
    slug: m.slug,
    category: m.category || 'Reference',
    title: m.title,
    excerpt: m.excerpt,
    coverImage: m.coverImage,
    imgGradient: gradientForSlug(m.slug || m.title || ''),
    readTime: m.readTime || '',
    updatedAt: row.updated_at,
  };
}

export default function Wiki() {
  const { data: rows, loading } = useSupabaseList('wiki_articles', {
    filter: (q) => q.eq('is_published', true),
    order: { column: 'updated_at', ascending: false },
    limit: 500,
  });

  const articles = useMemo(() => rows.map(toWikiCard), [rows]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Build category list from real article data
  const categories = useMemo(() => {
    const map = new Map();
    articles.forEach((a) => {
      const k = a.category || 'Reference';
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [articles]);

  // Apply filters
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((a) => {
      if (activeCategory !== 'All' && a.category !== activeCategory) return false;
      if (q) {
        const hay = (a.title + ' ' + (a.excerpt || '') + ' ' + a.category).toLowerCase();
        if (hay.includes(q) === false) return false;
      }
      return true;
    });
  }, [articles, searchQuery, activeCategory]);

  const featured = articles[0] || null;
  const gridArticles = featured ? filtered.filter((a) => a.id !== featured.id) : filtered;

  const resultsRef = useRef(null);
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <WikiHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={scrollToResults}
      />

      <div className="wiki-grid">
        <WikiLeftNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(name) => { setActiveCategory(name); scrollToResults(); }}
        />

        <div className="wiki-content" ref={resultsRef}>
          {featured && activeCategory === 'All' && searchQuery.trim() === '' && (
            <FeaturedArticle article={featured} />
          )}

          <WikiArticleGrid
            articles={gridArticles}
            loading={loading}
            title={
              searchQuery.trim()
                ? 'Search results for "' + searchQuery.trim() + '"'
                : (activeCategory === 'All' ? 'All Articles' : activeCategory)
            }
            count={gridArticles.length}
            totalCount={articles.length}
          />

          <ContributeCTA />
        </div>

        <WikiSidebar />
      </div>
    </>
  );
}

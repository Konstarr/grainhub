import '../styles/wiki.css';
import WikiHero from '../components/wiki/WikiHero.jsx';
import FeaturedArticle from '../components/wiki/FeaturedArticle.jsx';
import RecentlyUpdated from '../components/wiki/RecentlyUpdated.jsx';
import BrowseByCategory from '../components/wiki/BrowseByCategory.jsx';
import SpeciesDirectory from '../components/wiki/SpeciesDirectory.jsx';
import RecentEdits from '../components/wiki/RecentEdits.jsx';
import ContributeCTA from '../components/wiki/ContributeCTA.jsx';
import WikiSidebar from '../components/wiki/WikiSidebar.jsx';
import WikiLeftNav from '../components/wiki/WikiLeftNav.jsx';
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
    category: m.category || 'Reference',
    title: m.title,
    imgGradient: gradientForSlug(m.slug || m.title || ''),
    badge: { label: 'Updated', variant: 'new' },
    rating: '4.8',
    views: m.readTime || 'Reference',
  };
}

export default function Wiki() {
  const { data: rows } = useSupabaseList('wiki_articles', {
    filter: (q) => q.eq('is_published', true),
    order: { column: 'updated_at', ascending: false },
    limit: 8,
  });
  const recent = rows.map(toWikiCard);

  return (
    <>
      <WikiHero />

      <div className="wiki-grid">
        <WikiLeftNav />

        <div className="wiki-content">
          <FeaturedArticle />
          <RecentlyUpdated articles={recent} />
          <BrowseByCategory />
          <SpeciesDirectory />
          <RecentEdits />
          <ContributeCTA />
        </div>

        <WikiSidebar />
      </div>
    </>
  );
}

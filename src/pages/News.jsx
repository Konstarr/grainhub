import '../styles/news.css';
import NewsPageHeader from '../components/news/NewsPageHeader.jsx';
import NewsCategoryTabs from '../components/news/NewsCategoryTabs.jsx';
import HeroStory from '../components/news/HeroStory.jsx';
import NewsGrid from '../components/news/NewsGrid.jsx';
import NewsSidebar from '../components/news/NewsSidebar.jsx';
import { SponsorHero, SponsorLeaderboard } from '../components/sponsors/AdSlot.jsx';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapNewsRow } from '../lib/mappers.js';

// Stable gradient per article, based on slug hash
const GRADIENTS = [
  'linear-gradient(135deg, #1A3A10 0%, #3A6A20 100%)',
  'linear-gradient(135deg, #1C0E05 0%, #6B3820 100%)',
  'linear-gradient(135deg, #0F2838 0%, #2A5880 100%)',
  'linear-gradient(135deg, #3D1A2A 0%, #8B3860 100%)',
  'linear-gradient(135deg, #2A2010 0%, #8B6820 100%)',
  'linear-gradient(135deg, #102828 0%, #2A7070 100%)',
  'linear-gradient(135deg, #2F1F3A 0%, #5A3E7A 100%)',
];
const KICKER_COLORS = ['green', 'blue', 'amber', 'red', 'purple', 'teal', 'default'];
const hash = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

function toUi(row) {
  const m = mapNewsRow(row);
  const h = hash(m.slug);
  const kickerColor = KICKER_COLORS[h % KICKER_COLORS.length];
  const authorInitials = m.sourceUrl ? 'SY' : 'GH';
  return {
    id: m.id,
    slug: m.slug,
    coverImage: m.coverImage,
    kicker: { label: m.category || 'News', color: kickerColor },
    imgGradient: GRADIENTS[h % GRADIENTS.length],
    category: m.category || 'News',
    publishedDate: m.date,
    readTime: '4 min read',
    title: m.title,
    excerpt: m.excerpt || '',
    author: { initials: authorInitials, name: m.sourceUrl ? 'Syndicated' : 'GrainHub Staff' },
  };
}

export default function News() {
  const { data: rows } = useSupabaseList('news_articles', {
    filter: (q) => q.eq('is_published', true),
    order: { column: 'published_at', ascending: false },
    limit: 40,
  });

  const ui = rows.map(toUi);
  const heroStory = ui[0];
  const gridStories = ui.slice(1);

  return (
    <>
      <NewsPageHeader />
      <NewsCategoryTabs />

      <SponsorHero />

      <div className="main-wrap">
        <div>
          <HeroStory story={heroStory} />
          <SponsorLeaderboard />
          <NewsGrid stories={gridStories} />
        </div>
        <NewsSidebar />
      </div>
    </>
  );
}

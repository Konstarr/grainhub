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

export default function Wiki() {
  return (
    <>
      <WikiHero />
      {/* The horizontal CategoryTabs component was removed from here — its
          role is now played by the left nav, which has more room and shows
          sub-articles inline. */}

      <div className="wiki-grid">
        <WikiLeftNav />

        <div className="wiki-content">
          <FeaturedArticle />
          <RecentlyUpdated />
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

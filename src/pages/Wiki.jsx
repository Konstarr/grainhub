import '../styles/wiki.css';
import WikiHero from '../components/wiki/WikiHero.jsx';
import CategoryTabs from '../components/wiki/CategoryTabs.jsx';
import FeaturedArticle from '../components/wiki/FeaturedArticle.jsx';
import RecentlyUpdated from '../components/wiki/RecentlyUpdated.jsx';
import BrowseByCategory from '../components/wiki/BrowseByCategory.jsx';
import SpeciesDirectory from '../components/wiki/SpeciesDirectory.jsx';
import RecentEdits from '../components/wiki/RecentEdits.jsx';
import ContributeCTA from '../components/wiki/ContributeCTA.jsx';
import WikiSidebar from '../components/wiki/WikiSidebar.jsx';

export default function Wiki() {
  return (
    <>
      <WikiHero />
      <CategoryTabs />

      <div className="main-wrap">
        <div>
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

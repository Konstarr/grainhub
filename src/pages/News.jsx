import '../styles/news.css';
import NewsPageHeader from '../components/news/NewsPageHeader.jsx';
import NewsCategoryTabs from '../components/news/NewsCategoryTabs.jsx';
import HeroStory from '../components/news/HeroStory.jsx';
import NewsGrid from '../components/news/NewsGrid.jsx';
import NewsSidebar from '../components/news/NewsSidebar.jsx';

export default function News() {
  return (
    <>
      <NewsPageHeader />
      <NewsCategoryTabs />

      <div className="main-wrap">
        <div>
          <HeroStory />
          <NewsGrid />
        </div>
        <NewsSidebar />
      </div>
    </>
  );
}

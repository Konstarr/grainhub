import SponsorStrip from '../components/layout/SponsorStrip.jsx';
import Hero from '../components/home/Hero.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import ForumSection from '../components/home/ForumSection.jsx';
import WikiSection from '../components/home/WikiSection.jsx';
import JoinBanner from '../components/home/JoinBanner.jsx';
import Sidebar from '../components/home/Sidebar.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <SponsorStrip />

      <div className="main-wrap">
        <div className="content">
          <NewsSection />
          <ForumSection />
          <WikiSection />
          <JoinBanner />
        </div>
        <Sidebar />
      </div>
    </>
  );
}

import Hero from '../components/home/Hero.jsx';
import SponsorStrip from '../components/layout/SponsorStrip.jsx';
import StatsStrip from '../components/home/StatsStrip.jsx';
import TradeCategoriesTiles from '../components/home/TradeCategoriesTiles.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import ForumSection from '../components/home/ForumSection.jsx';
import JoinBanner from '../components/home/JoinBanner.jsx';
import Sidebar from '../components/home/Sidebar.jsx';

/**
 * Home — magazine-style layout.
 *
 *   1. Hero           (brown, existing)
 *   2. SponsorStrip   (white marquee, existing)
 *   3. StatsStrip     (dark brown — big numbers)
 *   4. CommunitiesShowcase  (cream — visual carousel)
 *   5. TradeCategoriesTiles (white — trade grid)
 *   6. Content grid   (news / forum / wiki + sidebar)
 *   7. JoinBanner     (full-bleed CTA)
 *
 * Alternating section backgrounds (white / cream / dark brown)
 * create visual rhythm so the page doesn't feel like one long list.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <SponsorStrip />
      <TradeCategoriesTiles />

      {/* Feed section — News on top, Forum + Wiki below, with sidebar */}
      <section className="home-section home-section-cream">
        <div className="home-section-inner">
          <div className="home-section-head">
            <div>
              <div className="home-section-eyebrow">The Feed</div>
              <h2 className="home-section-title">Happening right now.</h2>
              <p className="home-section-sub">
                The newest news, the loudest threads, and the handbook the trade is editing live.
              </p>
            </div>
          </div>

          <div className="main-wrap home-content-wrap">
            <div className="content">
              <NewsSection />
              <ForumSection />
            </div>
            <Sidebar />
          </div>
        </div>
      </section>

      <JoinBanner />
    </>
  );
}

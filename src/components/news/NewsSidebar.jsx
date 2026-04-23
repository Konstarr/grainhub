import { Link } from 'react-router-dom';
import { TRENDING_ARTICLES, FORUM_HIGHLIGHTS, SPONSOR_AD } from '../../data/newsData.js';

function TrendingCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">🔥 Trending This Week</div>
      <div className="rs-body">
        {TRENDING_ARTICLES.map((article) => (
          <div key={article.title} className="trending-item">
            <div className="ti-num">{article.rank}</div>
            <div>
              <div className="ti-title">{article.title}</div>
              <div className="ti-meta">{article.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForumCard() {
  return (
    <div className="rs-card">
      <div className="rs-header">💬 Forum Highlights</div>
      <div className="rs-body">
        {FORUM_HIGHLIGHTS.map((thread) => (
          <div key={thread.title} className="forum-thread-item">
            <div className="ft-cat">{thread.category}</div>
            <div className="ft-title">{thread.title}</div>
            <div className="ft-meta">{thread.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorCard() {
  return (
    <div className="sponsor-card">
      <div className="sp-label">{SPONSOR_AD.label}</div>
      <div className="sp-title">{SPONSOR_AD.title}</div>
      <div className="sp-sub">{SPONSOR_AD.description}</div>
      <Link to="/sponsor" className="sp-btn">Learn More &amp; Download Spec →</Link>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="newsletter-card">
      <div className="nl-title">The Weekly Grain</div>
      <div className="nl-sub">
        Industry news, forum highlights, and machinery deals — delivered every Tuesday morning.
      </div>
      <div className="nl-input-row">
        <input className="nl-input" type="email" placeholder="your@email.com" />
        <button className="nl-btn">Subscribe</button>
      </div>
    </div>
  );
}

export default function NewsSidebar() {
  return (
    <aside className="right-col">
      <TrendingCard />
      <ForumCard />
      <SponsorCard />
      <NewsletterCard />
    </aside>
  );
}

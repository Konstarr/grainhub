import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SPONSOR_AD } from '../../data/newsData.js';
import { supabase } from '../../lib/supabase.js';
import { fetchRecentThreadsWithLastPost } from '../../lib/forumDb.js';

/**
 * News page right-side sidebar. Every item is now backed by real data
 * from Supabase and links to the corresponding detail page:
 *   - Trending This Week  → top 5 published articles by view_count
 *                            (falls back to most-recent if no views yet)
 *                            → clicks route to /news/:slug
 *   - Forum Highlights    → 4 most-recently-active forum threads
 *                            → clicks route to /forums/thread/:slug
 *   - Sponsor / Newsletter cards unchanged (static marketing content)
 */

function TrendingCard() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Pick by view_count when populated; else fall back to recency.
      const { data } = await supabase
        .from('news_articles')
        .select('slug, title, view_count, category, published_at')
        .eq('is_published', true)
        .order('view_count',   { ascending: false, nullsFirst: false })
        .order('published_at', { ascending: false })
        .limit(5);
      if (!cancelled) setItems(data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rs-card">
      <div className="rs-header">🔥 Trending This Week</div>
      <div className="rs-body">
        {items.map((a, idx) => (
          <Link key={a.slug} to={`/news/${a.slug}`} className="trending-item">
            <div className="ti-num">{idx + 1}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="ti-title">{a.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ForumCard() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchRecentThreadsWithLastPost(4);
      if (!cancelled) setItems(data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rs-card">
      <div className="rs-header">💬 Forum Highlights</div>
      <div className="rs-body">
        {items.map((t) => {
          const lastAuthor =
            t.last_author?.full_name ||
            t.last_author?.username ||
            'Community';
          return (
            <Link
              key={t.id}
              to={`/forums/thread/${t.slug}`}
              className="forum-thread-item"
            >
              {t.category_id && <div className="ft-cat">{t.category_id.replace(/-/g, ' ')}</div>}
              <div className="ft-title">{t.title}</div>
              <div className="ft-meta">by {lastAuthor}</div>
            </Link>
          );
        })}
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

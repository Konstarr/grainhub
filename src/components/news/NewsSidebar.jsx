import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { fetchRecentThreadsWithLastPost } from '../../lib/forumDb.js';
import { SponsorSidebar } from '../sponsors/AdSlot.jsx';

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

/**
 * Compute a "trending" score for an article using a Hacker News-style
 * formula: views divided by age-with-gravity. Lets a brand-new article
 * with a few hundred views outrank an old evergreen piece with tens of
 * thousands — which is what readers expect when the card is titled
 * "Trending This Week".
 *
 *   score = (views + 1) / (ageHours + 2)^1.5
 *
 * The +1 floor keeps zero-view articles competing on recency alone so
 * the card stays populated even before view counters are seeded. The
 * window is capped at 14 days — anything older drops out so last
 * month's hits don't sit in the trending slot forever.
 */
function trendingScore(article) {
  const publishedAt = article.published_at ? new Date(article.published_at).getTime() : 0;
  const ageMs = Math.max(0, Date.now() - publishedAt);
  const ageHours = ageMs / (1000 * 60 * 60);
  // Gravity 1.2 (softer than classic HN 1.5) so view_count has more
  // weight relative to age — a week-old article with real traction
  // can still beat a brand-new zero-view one.
  const gravity = 1.2;
  return (Number(article.view_count || 0) + 1) / Math.pow(ageHours + 2, gravity);
}

function TrendingCard() {
  const [items, setItems] = useState([]);

  // Refetches the trending pool. Called on mount AND whenever the tab
  // regains focus / the page becomes visible — so coming back from an
  // article you just read picks up the new view count without a hard
  // refresh.
  const refetch = async () => {
    // Pull the last 14 days of published articles (cap at 50 to keep
    // it cheap), then score + sort client-side.
    const sinceIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('news_articles')
      .select('slug, title, view_count, category, published_at')
      .eq('is_published', true)
      .gte('published_at', sinceIso)
      .order('published_at', { ascending: false })
      .limit(50);

    // If the 14-day window is empty (e.g. demo with older seed data),
    // fall back to the 50 most-recent published articles so the card
    // still populates instead of going blank.
    let pool = data || [];
    if (pool.length === 0) {
      const fb = await supabase
        .from('news_articles')
        .select('slug, title, view_count, category, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);
      pool = fb.data || [];
    }

    const scored = pool
      .map((a) => ({ ...a, _score: trendingScore(a) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    setItems(scored);
  };

  useEffect(() => {
    refetch();
    // Refetch when the tab regains focus so coming back from an
    // article you just viewed picks up its bumped view_count.
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refetch();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rs-card">
      <div className="rs-header">🔥 Trending This Week</div>
      <div className="rs-body">
        {items.map((a, idx) => (
          <Link key={a.slug} to={`/news/article/${a.slug}`} className="trending-item">
            <div className="ti-num">{idx + 1}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="ti-title">{a.title}</div>
              <div className="ti-meta">
                {(a.view_count || 0).toLocaleString()} {(a.view_count || 0) === 1 ? 'view' : 'views'}
              </div>
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

function NewsletterCard() {
  return (
    <div className="newsletter-card">
      <div className="nl-title">The Weekly Bench</div>
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
      <SponsorSidebar />
      <NewsletterCard />
    </aside>
  );
}

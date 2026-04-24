import { Link } from 'react-router-dom';

/**
 * Renders the horizontal "🔥 Trending" strip at the top of the forums page.
 *
 * Accepts either:
 *   - an array of strings (legacy, non-clickable — kept for back-compat)
 *   - an array of { title, slug } objects — each renders as a <Link> to the
 *     matching thread page.
 * When the topics array is empty the strip is hidden entirely so we never
 * show stale hard-coded data.
 */
export default function HotTopicsStrip({ topics }) {
  if (!Array.isArray(topics) || topics.length === 0) return null;

  return (
    <div className="hot-strip">
      <span className="hot-label">🔥 Trending</span>
      <div className="hot-topics">
        {topics.map((topic, idx) => {
          const title = typeof topic === 'string' ? topic : topic.title;
          const slug = typeof topic === 'string' ? null : topic.slug;
          if (slug) {
            return (
              <Link
                key={slug}
                to={`/forums/thread/${slug}`}
                className="hot-topic"
                title={title}
              >
                {title}
              </Link>
            );
          }
          return (
            <span key={idx} className="hot-topic" title={title}>
              {title}
            </span>
          );
        })}
      </div>
    </div>
  );
}

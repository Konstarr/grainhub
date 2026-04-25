import { Link } from 'react-router-dom';

/**
 * Horizontal "🔥 Trending" strip at the top of the forums page,
 * rendered as a slow auto-scrolling marquee. Same two-group +
 * translateX(-50%) loop trick as components/layout/SponsorStrip,
 * tuned about 50% slower so titles are readable as they pass.
 *
 * Accepts either:
 *   - an array of strings (legacy, non-clickable — kept for back-compat)
 *   - an array of { title, slug } objects — each renders as a <Link>
 *     to the matching thread page.
 *
 * Empty input → component hides itself so we never show stale data.
 */
const MIN_CHIPS_PER_GROUP = 12;
const SECONDS_PER_CHIP = 6.0;

export default function HotTopicsStrip({ topics }) {
  if (!Array.isArray(topics) || topics.length === 0) return null;

  // Normalize once so the renderer doesn't keep type-checking.
  const items = topics.map((topic, idx) => {
    if (typeof topic === 'string') return { id: 's-' + idx, title: topic, slug: null };
    return { id: topic.slug || 'i-' + idx, title: topic.title, slug: topic.slug || null };
  });

  // Repeat the source array until the visible group has enough chips
  // that the marquee always has something on screen — short topic
  // lists used to leave big gaps in the loop.
  const reps = Math.max(1, Math.ceil(MIN_CHIPS_PER_GROUP / items.length));
  const expanded = Array.from({ length: reps }).flatMap((_, r) =>
    items.map((it) => ({ ...it, _rep: r }))
  );
  const durationSeconds = Math.max(36, Math.round(expanded.length * SECONDS_PER_CHIP));
  const trackStyle = { '--hot-duration': durationSeconds + 's' };

  const renderChip = (it, key) => {
    if (it.slug) {
      return (
        <Link
          key={key}
          to={`/forums/thread/${it.slug}`}
          className="hot-topic"
          title={it.title}
        >
          {it.title}
        </Link>
      );
    }
    return (
      <span key={key} className="hot-topic" title={it.title}>
        {it.title}
      </span>
    );
  };

  const renderGroup = (keyPrefix) => (
    <div className="hot-group" aria-hidden={keyPrefix === 'b' ? 'true' : undefined}>
      {expanded.map((it) => renderChip(it, keyPrefix + '-' + it._rep + '-' + it.id))}
    </div>
  );

  return (
    <div className="hot-strip">
      <span className="hot-label">🔥 Trending</span>
      <div className="hot-marquee" aria-label="Trending threads">
        <div className="hot-track" style={trackStyle}>
          {renderGroup('a')}
          {renderGroup('b')}
        </div>
      </div>
    </div>
  );
}

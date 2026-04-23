import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BROWSE_BY_CATEGORY } from '../../data/wikiData.js';

/**
 * Left-hand category nav for the Wiki index. Sticky, scrollable, with each
 * category collapsible to reveal sub-articles. Filter input narrows the list
 * by category name or any article within it.
 */
export default function WikiLeftNav() {
  // Default: first category expanded so new users see the pattern immediately.
  const [open, setOpen] = useState(
    () => new Set([BROWSE_BY_CATEGORY[0]?.name].filter(Boolean))
  );
  const [query, setQuery] = useState('');

  const toggle = (name) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Filter: match category name OR any article title inside it.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BROWSE_BY_CATEGORY;
    return BROWSE_BY_CATEGORY.filter((cat) => {
      if (cat.name.toLowerCase().includes(q)) return true;
      return cat.articles.some((a) => a.toLowerCase().includes(q));
    });
  }, [query]);

  // When filtering, auto-expand all matches so the user sees the hits.
  const effectiveOpen = query.trim()
    ? new Set(filtered.map((c) => c.name))
    : open;

  return (
    <aside className="wiki-left-nav">
      <div className="wln-header">Browse the Wiki</div>

      <div className="wln-search">
        <input
          type="text"
          placeholder="Filter categories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <nav className="wln-list">
        {filtered.length === 0 && (
          <div className="wln-empty">No matches. Try a different term.</div>
        )}
        {filtered.map((cat) => {
          const isOpen = effectiveOpen.has(cat.name);
          return (
            <div key={cat.name} className="wln-cat">
              <button
                type="button"
                className={`wln-cat-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => toggle(cat.name)}
                aria-expanded={isOpen}
              >
                <span className="wln-cat-icon">{cat.icon}</span>
                <span className="wln-cat-name">{cat.name}</span>
                <span className="wln-cat-chev">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <ul className="wln-cat-subs">
                  {cat.articles.map((article) => (
                    <li key={article}>
                      <Link to="/wiki/article" className="wln-sub-link">
                        {article}
                      </Link>
                    </li>
                  ))}
                  <li className="wln-cat-count">{cat.count}</li>
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

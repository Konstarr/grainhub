import { useMemo, useState } from 'react';

/**
 * Left rail for the Wiki. Categories are derived from real DB articles via
 * the `categories` prop (each item is { name, count }). Clicking a category
 * lifts the filter up to the page so the main grid re-renders.
 */
export default function WikiLeftNav({ categories = [], activeCategory = 'All', onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, categories]);

  const totalCount = useMemo(
    () => categories.reduce((sum, c) => sum + (c.count || 0), 0),
    [categories]
  );

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
        <button
          type="button"
          className={'wln-cat-toggle ' + (activeCategory === 'All' ? 'open' : '')}
          onClick={() => onSelect && onSelect('All')}
          style={{ width: '100%' }}
        >
          <span className="wln-cat-icon">📚</span>
          <span className="wln-cat-name">All Articles</span>
          <span className="wln-cat-chev">{totalCount}</span>
        </button>

        {filtered.length === 0 && categories.length > 0 && (
          <div className="wln-empty">No matches.</div>
        )}
        {categories.length === 0 && (
          <div className="wln-empty">Loading categories…</div>
        )}

        {filtered.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              className={'wln-cat-toggle ' + (isActive ? 'open' : '')}
              onClick={() => onSelect && onSelect(cat.name)}
              style={{ width: '100%' }}
            >
              <span className="wln-cat-icon">•</span>
              <span className="wln-cat-name">{cat.name}</span>
              <span className="wln-cat-chev">{cat.count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

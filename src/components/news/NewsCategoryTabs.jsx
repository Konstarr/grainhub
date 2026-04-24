import { useSearchParams } from 'react-router-dom';
import { NEWS_CATEGORY_TABS } from '../../data/newsData.js';

/**
 * Renders the "All · Industry · Regulatory · …" tabs above the news feed.
 * State lives in the URL (?category=slug) so the tabs stay in sync with
 * the News page's Supabase query and with the secondary-nav pills. An
 * empty/absent category means "all".
 */
export default function NewsCategoryTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('category') || 'all';

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (!id || id === 'all') {
      next.delete('category');
    } else {
      next.set('category', id);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="category-bar">
      {NEWS_CATEGORY_TABS.map((tab) => (
        <div
          key={tab.id}
          className={`cat-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => setCategory(tab.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCategory(tab.id);
            }
          }}
        >
          {tab.label}
          {tab.count != null && <span className="cat-count">{tab.count}</span>}
        </div>
      ))}
    </div>
  );
}

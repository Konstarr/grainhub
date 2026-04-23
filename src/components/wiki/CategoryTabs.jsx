import { useState } from 'react';
import { WIKI_CATEGORY_TABS } from '../../data/wikiData.js';

export default function CategoryTabs() {
  const [active, setActive] = useState('all');

  return (
    <div className="category-tabs">
      {WIKI_CATEGORY_TABS.map((tab) => (
        <div
          key={tab.id}
          className={`cat-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => setActive(tab.id)}
        >
          <span className="cat-tab-icon">{tab.icon}</span>
          {tab.label}
          <span className="cat-tab-count">{tab.count}</span>
        </div>
      ))}
    </div>
  );
}

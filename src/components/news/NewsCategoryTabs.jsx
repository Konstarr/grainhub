import { useState } from 'react';
import { NEWS_CATEGORY_TABS } from '../../data/newsData.js';

export default function NewsCategoryTabs() {
  const [active, setActive] = useState('all');

  return (
    <div className="category-bar">
      {NEWS_CATEGORY_TABS.map((tab) => (
        <div
          key={tab.id}
          className={`cat-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => setActive(tab.id)}
        >
          {tab.label}
          <span className="cat-count">{tab.count}</span>
        </div>
      ))}
    </div>
  );
}

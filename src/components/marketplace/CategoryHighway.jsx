import { CATEGORIES } from '../../data/marketplaceData.js';

export default function CategoryHighway({ activeCategory, onCategorySelect }) {
  return (
    <div className="cat-highway">
      <div className="cat-highway-inner">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`cat-tile ${cat.active || activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(cat.id)}
          >
            <div className={`cat-tile-icon ${cat.bgClass}`}>{cat.icon}</div>
            <div className="cat-tile-name">{cat.name}</div>
            <div className="cat-tile-count">{cat.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

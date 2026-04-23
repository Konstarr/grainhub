import SectionHeader from './SectionHeader.jsx';
import { WIKI_CATEGORIES } from '../../data/homeData.js';

export default function WikiSection() {
  return (
    <div className="wiki-section">
      <SectionHeader title="Industry Wiki" linkLabel="Browse all 3,600 articles →" />
      <div className="wiki-grid">
        {WIKI_CATEGORIES.map((cat) => (
          <div key={cat.title} className="wiki-card">
            <div className="wiki-icon">{cat.icon}</div>
            <div className="wiki-card-title">{cat.title}</div>
            <div className="wiki-card-desc">{cat.desc}</div>
            <div className="wiki-card-count">{cat.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

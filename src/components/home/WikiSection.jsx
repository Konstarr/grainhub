import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { WIKI_CATEGORIES } from '../../data/homeData.js';

export default function WikiSection() {
  return (
    <div className="wiki-section">
      <SectionHeader title="Industry Wiki" linkLabel="Browse all 3,600 articles →" linkTo="/wiki" />
      <div className="wiki-grid">
        {WIKI_CATEGORIES.map((cat) => (
          <Link key={cat.title} to="/wiki/article" className="wiki-card">
            <div className="wiki-icon">{cat.icon}</div>
            <div className="wiki-card-title">{cat.title}</div>
            <div className="wiki-card-desc">{cat.desc}</div>
            <div className="wiki-card-count">{cat.count}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function SortBar({ data }) {
  const [activeSort, setActiveSort] = useState(0);

  return (
    <div className="sort-bar">
      <span>{data.totalReplies} replies &nbsp;·&nbsp; Showing page {data.currentPage} of {data.totalPages}</span>
      <div className="sort-options">
        {data.options.map((opt, idx) => (
          <button
            key={idx}
            className={`sort-opt ${activeSort === idx ? 'active' : ''}`}
            onClick={() => setActiveSort(idx)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function Pagination({ data }) {
  const [currentPage, setCurrentPage] = useState(data.currentPage);

  return (
    <div className="pagination">
      {data.pages.map((page) => (
        <button
          key={page}
          className={`page-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}
      {data.showNextArrow && (
        <button className="page-btn">›</button>
      )}
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
        Showing {data.pages.length} of {data.totalReplies} replies
      </span>
    </div>
  );
}

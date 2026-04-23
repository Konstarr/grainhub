import JobCard from './JobCard.jsx';
import FeaturedJobCard from './FeaturedJobCard.jsx';

export default function JobsListing({ toolbarData, featuredJob, jobs, pagination, currentPage, setCurrentPage }) {
  return (
    <div className="jobs-col">
      <div className="jobs-toolbar">
        <div className="jobs-count">
          Showing <strong>{toolbarData.sortOptions[0].label ? 'jobs' : pagination.totalResults} open positions</strong> matching your criteria
        </div>
        <select className="sort-select">
          {toolbarData.sortOptions.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <FeaturedJobCard job={featuredJob} />

      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      <div className="pagination">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`page-btn ${currentPage === num ? 'active' : ''}`}
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </button>
        ))}
        <button className="page-btn">…</button>
        <button className="page-btn">18</button>
        <button className="page-btn">›</button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
          Showing 1–{pagination.perPage} of {pagination.totalResults} positions
        </span>
      </div>
    </div>
  );
}

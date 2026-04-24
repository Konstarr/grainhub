import JobCard from './JobCard.jsx';

export default function JobsListing({ toolbarData, jobs, sort = 'newest', onSortChange }) {
  const list = jobs || [];
  return (
    <div className="jobs-col">
      <div className="jobs-toolbar">
        <div className="jobs-count">
          Showing <strong>{list.length} open position{list.length === 1 ? '' : 's'}</strong>
        </div>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => onSortChange && onSortChange(e.target.value)}
        >
          {toolbarData.sortOptions.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No jobs match your filters. Try clearing a few.
        </div>
      ) : (
        list.map((job) => <JobCard key={job.id} job={job} />)
      )}
    </div>
  );
}

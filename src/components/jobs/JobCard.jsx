export default function JobCard({ job }) {
  const getBorderClass = () => {
    if (job.isUrgent) return 'urgent';
    if (job.isNew) return 'new-post';
    if (job.isRemote) return 'remote';
    return '';
  };

  return (
    <div className={`job-card ${getBorderClass()}`}>
      <div className={`company-logo ${job.logoColor}`}>{job.logo}</div>
      <div className="job-body">
        <div className="job-header">
          <div className="job-title-wrap">
            <div className="job-title">{job.title}</div>
            <div className="job-company-line">
              {job.company} &nbsp;·&nbsp; {job.location}{' '}
              {job.isVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
          </div>
          <div className="job-salary">
            <div className="salary-range-text">
              {job.salaryMin}–{job.salaryMax}
            </div>
            <div className="salary-type">{job.salaryNote}</div>
          </div>
        </div>
        <div className="job-tags">
          {job.tags.map((tag, idx) => (
            <span key={idx} className={`job-tag ${tag.className}`}>
              {tag.label}
            </span>
          ))}
        </div>
        <p className="job-description">{job.description}</p>
        <div className="job-footer">
          <div className="job-meta-items">
            {job.metadata.map((meta, idx) => (
              <span key={idx} className="job-meta">
                {meta.icon} {meta.label}
              </span>
            ))}
          </div>
          <div className="job-actions">
            <button className="btn-apply">Apply →</button>
            <button className="btn-save-job">🔖</button>
          </div>
        </div>
      </div>
    </div>
  );
}

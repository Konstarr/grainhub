import { useNavigate } from 'react-router-dom';

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const getBorderClass = () => {
    if (job.isUrgent) return 'urgent';
    if (job.isNew) return 'new-post';
    if (job.isRemote) return 'remote';
    return '';
  };

  const href = job.id ? '/jobs/' + job.id : null;
  const openDetail = (e) => {
    if (!href) return;
    // Don't hijack clicks that came from nested buttons / links
    if (e.target.closest('button, a')) return;
    navigate(href);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else if (job.applyEmail) {
      window.location.href = 'mailto:' + job.applyEmail + '?subject=' + encodeURIComponent('Application: ' + (job.title || ''));
    } else if (href) {
      navigate(href);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    // TODO: hook into a saved_jobs table once it exists
    alert('Saved jobs coming soon. For now, bookmark the detail page.');
  };

  return (
    <div
      className={`job-card ${getBorderClass()}`}
      onClick={openDetail}
      role={href ? 'button' : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={(e) => {
        if (!href) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(href); }
      }}
      style={{ cursor: href ? 'pointer' : 'default' }}
    >
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
            <button type="button" className="btn-apply" onClick={handleApply}>
              Apply →
            </button>
            <button
              type="button"
              className="btn-save-job"
              onClick={handleSave}
              title="Save this job"
              aria-label="Save this job"
            >
              🔖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedJobCard({ job }) {
  return (
    <div className="featured-job">
      <span className="feat-badge">⭐ Featured</span>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div className={`company-logo ${job.logoColor}`}>{job.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div>
              <div className="job-title">{job.title}</div>
              <div className="job-company-line">
                {job.company} &nbsp;·&nbsp; {job.location}
                {job.isVerified && <span className="verified-badge">✓ Verified Employer</span>}
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
              <button className="btn-apply">Apply Now →</button>
              <button className="btn-save-job">🔖 Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

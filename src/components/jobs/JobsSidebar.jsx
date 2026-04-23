export default function JobsSidebar({ salaryGuide, topCompanies, postJobCta, talentCta }) {
  return (
    <aside className="right-col">
      <div className="post-job-card">
        <div className="pjc-eyebrow">{postJobCta.eyebrow}</div>
        <div className="pjc-title">{postJobCta.title}</div>
        <div className="pjc-sub">{postJobCta.description}</div>
        <button className="pjc-btn">Post a Job Now →</button>
        <div className="pjc-pricing">
          {postJobCta.tiers.map((tier, idx) => (
            <div key={idx} className="pjc-tier">
              <span className="pjc-tier-name">{tier.name}</span>
              <span className="pjc-tier-price">{tier.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="talent-card">
        <div className="tc-title">{talentCta.title}</div>
        <div className="tc-sub">{talentCta.description}</div>
        <button className="tc-btn">Create Your Profile →</button>
      </div>

      <div className="rs-card">
        <div className="rs-header">💰 2025 Salary Guide</div>
        <div className="rs-body">
          {salaryGuide.map((row, idx) => (
            <div key={idx} className="salary-row">
              <span className="salary-role">{row.role}</span>
              <div className="salary-range-cell">
                <div className="salary-val">
                  {row.rangeMin}–{row.rangeMax}
                </div>
                <div className="salary-sub">Median {row.median}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
            Based on 648 current postings
          </div>
        </div>
      </div>

      <div className="rs-card">
        <div className="rs-header">🏭 Top Hiring Companies</div>
        <div className="rs-body">
          {topCompanies.map((company, idx) => (
            <div key={idx} className="employer-item">
              <div className={`emp-logo ${company.logoColor}`}>{company.logo}</div>
              <div>
                <div className="emp-name">{company.name}</div>
                <div className="emp-meta">{company.meta}</div>
              </div>
              <span className="emp-openings">{company.openings} jobs</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function FilterSidebar({ filters }) {
  return (
    <aside className="filter-col">
      <div className="filter-card">
        <div className="filter-header">
          Filters <span className="filter-clear">Clear all</span>
        </div>
        <div className="filter-body">
          <div className="filter-section">
            <div className="filter-label">Job Type</div>
            <div className="filter-options">
              {filters.jobType.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Work Location</div>
            <div className="filter-options">
              {filters.workLocation.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Experience Level</div>
            <div className="filter-options">
              {filters.experienceLevel.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Salary Range (Annual)</div>
            <div className="salary-range">
              <input className="salary-input" type="text" placeholder="Min $" />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
              <input className="salary-input" type="text" placeholder="Max $" />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Shop Specialty</div>
            <div className="filter-options">
              {filters.shopSpecialty.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Region</div>
            <div className="filter-options">
              {filters.region.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">Posted Within</div>
            <div className="filter-options">
              {filters.postedWithin.map((opt, idx) => (
                <label key={idx} className="filter-opt">
                  <input type="checkbox" defaultChecked={opt.isChecked} />
                  <span className="filter-opt-label">{opt.label}</span>
                  <span className="filter-opt-count">{opt.count}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="apply-btn">Apply Filters</button>
        </div>
      </div>
    </aside>
  );
}

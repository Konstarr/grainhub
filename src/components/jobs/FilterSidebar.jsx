/**
 * Controlled filter panel. `filters` is the OPTION CATALOG (labels + counts
 * for rendering), `active` is the current selection state (arrays of label
 * strings per section + salary min/max strings), and `onChange` fires the
 * full next-state object whenever anything is toggled.
 */
export default function FilterSidebar({ filters, active, onChange, onClear }) {
  const a = active || {
    jobType: [], workLocation: [], experienceLevel: [],
    shopSpecialty: [], region: [], postedWithin: [],
    minSalary: '', maxSalary: '',
  };

  // Toggle a label in/out of the array for a given section.
  const toggle = (section, label) => {
    const cur = new Set(a[section] || []);
    if (cur.has(label)) cur.delete(label);
    else cur.add(label);
    onChange({ ...a, [section]: Array.from(cur) });
  };

  const setVal = (key, val) => onChange({ ...a, [key]: val });

  const section = (key, label, opts) => (
    <div className="filter-section">
      <div className="filter-label">{label}</div>
      <div className="filter-options">
        {opts.map((opt, idx) => {
          const checked = (a[key] || []).includes(opt.label);
          return (
            <label key={idx} className="filter-opt">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(key, opt.label)}
              />
              <span className="filter-opt-label">{opt.label}</span>
              <span className="filter-opt-count">{opt.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="filter-col">
      <div className="filter-card">
        <div className="filter-header">
          Filters
          <span
            className="filter-clear"
            onClick={onClear}
            style={{ cursor: 'pointer' }}
          >
            Clear all
          </span>
        </div>
        <div className="filter-body">
          {section('jobType', 'Job Type', filters.jobType)}
          {section('workLocation', 'Work Location', filters.workLocation)}
          {section('experienceLevel', 'Experience Level', filters.experienceLevel)}

          <div className="filter-section">
            <div className="filter-label">Salary Range (Annual)</div>
            <div className="salary-range">
              <input
                className="salary-input"
                type="text"
                placeholder="Min $"
                value={a.minSalary}
                onChange={(e) => setVal('minSalary', e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
              <input
                className="salary-input"
                type="text"
                placeholder="Max $"
                value={a.maxSalary}
                onChange={(e) => setVal('maxSalary', e.target.value)}
              />
            </div>
          </div>

          {section('shopSpecialty', 'Shop Specialty', filters.shopSpecialty)}
          {section('region', 'Region', filters.region)}
          {section('postedWithin', 'Posted Within', filters.postedWithin)}

          <button
            type="button"
            className="apply-btn"
            onClick={() => {/* filters are already live; button is cosmetic */}}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </aside>
  );
}

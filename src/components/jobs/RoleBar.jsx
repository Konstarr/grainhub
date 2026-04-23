export default function RoleBar({ pills, activeRole, setActiveRole }) {
  return (
    <div className="role-bar">
      <span className="role-label">Browse by Role:</span>
      {pills.map((pill, idx) => (
        <span
          key={idx}
          className={`role-pill ${pill.isActive || pill.label === activeRole ? 'active' : ''}`}
          onClick={() => setActiveRole(pill.label)}
        >
          {pill.label} <span className="role-pill-count">{pill.count}</span>
        </span>
      ))}
    </div>
  );
}

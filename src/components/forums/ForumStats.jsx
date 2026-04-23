export default function ForumStats({ stats }) {
  return (
    <div className="rs-card">
      <div className="rs-header">📊 Forum Stats</div>
      <div className="rs-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                padding: '6px 0',
                borderBottom: idx < stats.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <span style={{ color: stat.isHighlight ? 'var(--wood-warm)' : 'var(--text-muted)' }}>
                {stat.label}
              </span>
              <span
                style={{
                  fontWeight: stat.isBold || stat.isHighlight ? '500' : 'normal',
                  color: stat.isHighlight ? 'var(--wood-warm)' : 'inherit',
                }}
              >
                {stat.isBold && '🟢 '}
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

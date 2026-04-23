export default function TopContributors({ contributors }) {
  return (
    <div className="rs-card">
      <div className="rs-header">🏆 Top Contributors This Month</div>
      <div className="rs-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {contributors.map((contrib) => (
            <div key={contrib.rank} className="contributor-item">
              <div className="contrib-rank">{contrib.rank}</div>
              <div className={`contrib-av ${contrib.avatarColor}`}>{contrib.initials}</div>
              <div className="contrib-info">
                <div className="contrib-name">{contrib.name}</div>
                <div className="contrib-meta">{contrib.meta}</div>
              </div>
              <div className="contrib-pts">{contrib.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

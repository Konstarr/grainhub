export default function OnlineUsersStrip({ data }) {
  return (
    <div className="online-strip">
      <div className="online-dot"></div>
      <div className="online-count">{data.count} members online</div>
      <div className="online-avatars">
        {data.avatars.map((av, idx) => (
          <div key={idx} className={`online-av ${av.color}`}>
            {av.initials}
          </div>
        ))}
      </div>
      <div className="online-names">
        {data.names} <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>and {data.moreCount} more</span>
      </div>
    </div>
  );
}

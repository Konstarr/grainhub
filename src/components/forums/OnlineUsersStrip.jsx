/**
 * Compact online-members strip. Shows the count, the first 3 avatars,
 * the first 3 names, and "and N more" — single row even on narrower
 * desktops. The data may include more than 3 entries; we slice here so
 * the source-of-truth list can stay long without breaking the layout.
 */
export default function OnlineUsersStrip({ data }) {
  const namesArr = (data.names || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const visibleNames = namesArr.slice(0, 3);
  // Total count minus the 3 we explicitly list.
  const moreCount = Math.max(0, (data.count || 0) - visibleNames.length);
  return (
    <div className="online-strip">
      <div className="online-dot"></div>
      <div className="online-count">{data.count} members online</div>
      <div className="online-avatars">
        {data.avatars.slice(0, 3).map((av, idx) => (
          <div key={idx} className={`online-av ${av.color}`}>
            {av.initials}
          </div>
        ))}
      </div>
      <div className="online-names">
        {visibleNames.join(', ')}
        {moreCount > 0 && (
          <>
            {' '}
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
              and {moreCount} more
            </span>
          </>
        )}
      </div>
    </div>
  );
}

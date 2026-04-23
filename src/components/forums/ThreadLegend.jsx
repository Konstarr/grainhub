export default function ThreadLegend({ items }) {
  return (
    <div className="rs-card">
      <div className="rs-header">🔑 Thread Legend</div>
      <div className="rs-body">
        <div className="legend-items">
          {items.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div className="legend-dot" style={{ background: item.dot }}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

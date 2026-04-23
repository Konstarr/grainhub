export default function ThreadHeader({ data, onReply }) {
  return (
    <div className="thread-header">
      <div className="thread-tags">
        {data.tags.map((tag, idx) => (
          <span key={idx} className={`tag ${tag.variant}`}>{tag.label}</span>
        ))}
      </div>
      <h1 className="thread-title">{data.title}</h1>
      <div className="thread-meta">
        {data.meta.map((item, idx) => (
          <span key={idx} className="thread-meta-item">
            {item.icon} {item.text}
          </span>
        ))}
      </div>
      <div className="thread-actions">
        <button className="act-btn">🔔 Subscribe</button>
        <button className="act-btn">🔖 Save Thread</button>
        <button className="act-btn">↗ Share</button>
        <button className="act-btn">⊕ Follow User</button>
        <div style={{ flex: 1 }}></div>
        <button className="act-btn primary" onClick={onReply}>↩ Reply to Thread</button>
      </div>
    </div>
  );
}

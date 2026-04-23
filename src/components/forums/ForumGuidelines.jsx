export default function ForumGuidelines({ guidelines }) {
  return (
    <div className="rs-card">
      <div className="rs-header">📖 Forum Guidelines</div>
      <div className="rs-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {guidelines.map((guideline, idx) => (
            <div
              key={idx}
              className="rule-item"
            >
              <span className="rule-num">{idx + 1}</span>
              {guideline}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

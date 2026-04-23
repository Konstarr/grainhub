import { RECENT_EDITS } from '../../data/wikiData.js';

export default function RecentEdits() {
  return (
    <div className="recent-section">
      <div className="section-header">
        <h2 className="section-title">Recent Edits</h2>
        <span className="section-link">Full edit history →</span>
      </div>
      <div className="recent-table">
        <div className="rt-header">
          <div className="rt-head">Article</div>
          <div className="rt-head">Category</div>
          <div className="rt-head">Editor</div>
          <div className="rt-head">When</div>
        </div>
        {RECENT_EDITS.map((edit) => (
          <div key={edit.title} className="rt-row">
            <div className="rt-title">
              {edit.title}
              <span>{edit.subtitle}</span>
            </div>
            <div>
              <span
                className="rt-cat"
                style={{ backgroundColor: edit.category.bgColor, color: edit.category.textColor }}
              >
                {edit.category.label}
              </span>
            </div>
            <div className="rt-editor">
              <div className="rt-av" style={{ background: edit.editor.bgColor }}>
                {edit.editor.initials}
              </div>
              {edit.editor.name}
            </div>
            <div className="rt-time">{edit.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { TOOLBAR_TABS } from '../../data/forumsData.js';

export default function ToolbarSection() {
  return (
    <div className="forum-toolbar">
      <div className="forum-toolbar-inner">
        <div className="toolbar-tabs">
          {TOOLBAR_TABS.map((tab, idx) => (
            <div key={idx} className={`toolbar-tab ${idx === 0 ? 'active' : ''}`}>
              {tab}
            </div>
          ))}
        </div>
        <div className="toolbar-actions">
          <button className="mark-read-btn">✓ Mark All Read</button>
          <button className="new-thread-btn">✏ New Thread</button>
        </div>
      </div>
    </div>
  );
}

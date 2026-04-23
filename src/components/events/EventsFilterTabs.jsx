import { useState } from 'react';

export default function EventsFilterTabs({ tabs }) {
  const [activeId, setActiveId] = useState('all');

  return (
    <div className="events-tab-bar">
      <div className="events-tabs-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`events-tab ${activeId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
            <span className="events-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

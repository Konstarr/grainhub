import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * View-filter tab bar for the Forums index. Each tab sets ?view=...
 * on the URL so the page knows which filter to apply.
 */
const TABS = [
  { key: '',              label: 'All Forums' },
  { key: 'hot',           label: '\u{1F525} Hot Today' },
  { key: 'new',           label: '\u2728 New Posts' },
  { key: 'unanswered',    label: '\u2753 Unanswered' },
  { key: 'solved',        label: '\u2713 Solved' },
  { key: 'subscriptions', label: '\u{1F516} My Subscriptions' },
  { key: 'my-posts',      label: '\u{1F464} My Posts' },
];

export default function ToolbarSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const current = searchParams.get('view') || '';

  const setView = (key) => {
    const next = new URLSearchParams(searchParams);
    if (!key) next.delete('view');
    else next.set('view', key);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="forum-toolbar">
      <div className="forum-toolbar-inner">
        <div className="toolbar-tabs">
          {TABS.map((tab) => {
            const active = current === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                type="button"
                className={'toolbar-tab ' + (active ? 'active' : '')}
                onClick={() => setView(tab.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="mark-read-btn"
            onClick={() => setView('')}
            title="Clear filters"
          >
            ✓ Mark All Read
          </button>
          <button
            type="button"
            className="new-thread-btn"
            onClick={() => navigate('/forums/new')}
          >
            ✏ New Thread
          </button>
        </div>
      </div>
    </div>
  );
}

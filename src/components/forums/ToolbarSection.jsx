import { useSearchParams } from 'react-router-dom';
import ForumSearchBar from './ForumSearchBar.jsx';

const TABS = [
  { key: '',              label: 'All Forums' },
  { key: 'hot',           label: '\u{1F525} Hot Today' },
  { key: 'new',           label: '✨ New Posts' },
  { key: 'unanswered',    label: '❓ Unanswered' },
  { key: 'solved',        label: '✓ Solved' },
  { key: 'subscriptions', label: '\u{1F516} My Subscriptions' },
  { key: 'my-posts',      label: '\u{1F464} My Posts' },
];

export default function ToolbarSection() {
  const [searchParams, setSearchParams] = useSearchParams();
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
                style={{ background: 'transparent', border: 'none', font: 'inherit', cursor: 'pointer' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <ForumSearchBar size="md" placeholder="Search threads…" className="toolbar-search" />
      </div>
    </div>
  );
}

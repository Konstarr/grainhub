import '../styles/events.css';
import EventsPageHeader from '../components/events/EventsPageHeader.jsx';
import EventsFilterTabs from '../components/events/EventsFilterTabs.jsx';
import EventsGrid from '../components/events/EventsGrid.jsx';
import EventsSidebar from '../components/events/EventsSidebar.jsx';
import {
  EVENTS_PAGE_HEADER,
  EVENTS_FILTER_TABS,
  SUBMIT_EVENT_CARD,
  NEWSLETTER,
} from '../data/eventsData.js';
import { useSupabaseList } from '../hooks/useSupabaseList.js';
import { mapEventRow } from '../lib/mappers.js';

export default function Events() {
  const { data: rows } = useSupabaseList('events', {
    filter: (q) => q.eq('is_approved', true).gte('start_date', new Date(Date.now() - 30 * 86400000).toISOString()),
    order: { column: 'start_date', ascending: true },
    limit: 40,
  });

  const liveEvents = rows.map(mapEventRow);

  return (
    <>
      <EventsPageHeader data={EVENTS_PAGE_HEADER} />
      <EventsFilterTabs tabs={EVENTS_FILTER_TABS} />

      <div className="main-wrap">
        <div className="content">
          {liveEvents.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
              No upcoming events yet.
            </div>
          ) : (
            <EventsGrid events={liveEvents} />
          )}
        </div>
        <EventsSidebar
          submitCard={SUBMIT_EVENT_CARD}
          newsletter={NEWSLETTER}
        />
      </div>
    </>
  );
}

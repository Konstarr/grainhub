import '../styles/events.css';
import EventsPageHeader from '../components/events/EventsPageHeader.jsx';
import EventsFilterTabs from '../components/events/EventsFilterTabs.jsx';
import FeaturedEvent from '../components/events/FeaturedEvent.jsx';
import EventsGrid from '../components/events/EventsGrid.jsx';
import EventsSidebar from '../components/events/EventsSidebar.jsx';
import {
  EVENTS_PAGE_HEADER,
  EVENTS_FILTER_TABS,
  FEATURED_EVENT,
  EVENT_LISTINGS,
  SUBMIT_EVENT_CARD,
  SAVE_THE_DATE,
  SPONSOR_AD,
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

  const liveEvents = rows.length ? rows.map(mapEventRow) : EVENT_LISTINGS;

  return (
    <>
      <EventsPageHeader data={EVENTS_PAGE_HEADER} />
      <EventsFilterTabs tabs={EVENTS_FILTER_TABS} />

      <div className="main-wrap">
        <div className="content">
          <FeaturedEvent event={FEATURED_EVENT} />
          <EventsGrid events={liveEvents} />
        </div>
        <EventsSidebar
          submitCard={SUBMIT_EVENT_CARD}
          saveTheDate={SAVE_THE_DATE}
          sponsor={SPONSOR_AD}
          newsletter={NEWSLETTER}
        />
      </div>
    </>
  );
}

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

export default function Events() {
  return (
    <>
      <EventsPageHeader data={EVENTS_PAGE_HEADER} />
      <EventsFilterTabs tabs={EVENTS_FILTER_TABS} />

      <div className="main-wrap">
        <div className="content">
          <FeaturedEvent event={FEATURED_EVENT} />
          <EventsGrid events={EVENT_LISTINGS} />
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

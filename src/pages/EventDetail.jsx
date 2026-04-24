import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';

/**
 * /events/:slug
 *
 * Public event detail page. Fetches the event by slug and renders the
 * cover image, when/where, description (markdown), and a register button.
 */
export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setErr(error); setLoading(false); return; }
      setEvent(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageBack backTo="/events" backLabel="Back to Events" />
        <div className="main-wrap">
          <div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading event…</div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <PageBack backTo="/events" backLabel="Back to Events" />
        <div className="main-wrap">
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 6 }}>Event not found</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
              {err ? 'Error: ' + (err.message || 'unknown') : 'No event matched: ' + slug}
            </p>
            <Link to="/events" style={{ color: 'var(--wood-warm)' }}>← Back to Events</Link>
          </div>
        </div>
      </>
    );
  }

  const start = event.start_date ? new Date(event.start_date) : null;
  const end = event.end_date ? new Date(event.end_date) : null;
  const fmtDate = (d) => d ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const fmtTime = (d) => d ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';

  const sameDay = start && end && start.toDateString() === end.toDateString();
  const whenPrimary = start ? fmtDate(start) : '';
  const whenSub = start
    ? (end
        ? (sameDay ? `${fmtTime(start)} – ${fmtTime(end)}` : `through ${fmtDate(end)}`)
        : fmtTime(start))
    : '';

  const typeLabels = {
    'conference': 'Conference',
    'trade-show': 'Trade Show',
    'workshop':   'Workshop',
    'meetup':     'Meetup',
    'webinar':    'Webinar',
  };

  return (
    <>
      <PageBack
        backTo="/events"
        backLabel="Back to Events"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Events', to: '/events' },
          { label: event.title },
        ]}
      />

      <div className="main-wrap">
        <article>
          {event.cover_image_url && (
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 7',
                backgroundImage: 'url(' + event.cover_image_url + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 14,
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
              }}
            />
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {event.event_type && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 12px',
                  borderRadius: 999,
                  background: 'var(--wood-cream, #FBF6EC)',
                  color: 'var(--wood-warm)',
                  fontWeight: 600,
                  fontSize: 12,
                  border: '1px solid var(--border)',
                }}
              >
                {typeLabels[event.event_type] || event.event_type}
              </span>
            )}
            {event.is_online && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 12px',
                  borderRadius: 999,
                  background: '#E6F1FB',
                  color: '#185FA5',
                  fontWeight: 600,
                  fontSize: 12,
                  border: '1px solid #BFDCEF',
                }}
              >
                Online
              </span>
            )}
            {event.trade && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 12px',
                  borderRadius: 999,
                  background: 'var(--white)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  border: '1px solid var(--border)',
                }}
              >
                {event.trade}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 0.75rem', lineHeight: 1.15 }}>
            {event.title}
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              padding: '1.1rem 1.25rem',
              border: '1px solid var(--border)',
              borderRadius: 12,
              background: 'var(--white)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>When</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{whenPrimary || '—'}</div>
              {whenSub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{whenSub}</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Where</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {event.is_online ? 'Online' : (event.venue_name || event.location || '—')}
              </div>
              {!event.is_online && event.venue_name && event.location && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{event.location}</div>
              )}
            </div>
            {event.registration_url && (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #8A5030, #6B3D20)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(90, 66, 38, 0.2)',
                  }}
                >
                  Register →
                </a>
              </div>
            )}
          </div>

          <div
            className="post-text-md"
            style={{ fontSize: 15.5, lineHeight: 1.75, color: 'var(--text-primary)' }}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (<a {...props} target="_blank" rel="noopener noreferrer" />),
                img: ({ node, ...props }) => (
                  <img {...props} loading="lazy" style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid var(--border)', margin: '1rem 0' }} />
                ),
              }}
            >
              {event.description || ''}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  );
}

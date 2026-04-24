import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import CoverImageUploader from '../../components/admin/CoverImageUploader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../lib/adminDb.js';

const EVENT_TYPES = [
  { value: 'conference',  label: 'Conference' },
  { value: 'trade-show',  label: 'Trade Show' },
  { value: 'workshop',    label: 'Workshop' },
  { value: 'meetup',      label: 'Meetup' },
  { value: 'webinar',     label: 'Webinar' },
];

const TRADES = [
  'Cabinetmaking',
  'Millwork',
  'Flooring',
  'Finishing',
  'CNC',
  'General',
];

/**
 * Format a JS Date (or ISO string) into the shape <input type="datetime-local">
 * expects (YYYY-MM-DDTHH:MM, in the browser's local timezone).
 */
function toDatetimeLocal(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  );
}

/**
 * /admin/events/new  or  /admin/events/:id
 */
export default function AdminEventsEdit() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);
  const [descMode, setDescMode] = useState('write');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    event_type: 'conference',
    start_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    is_online: false,
    registration_url: '',
    cover_image_url: '',
    trade: '',
    is_approved: false,
    created_at: null,
  });

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getEvent(id);
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message || 'Event not found');
        setLoading(false);
        return;
      }
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        event_type: data.event_type || 'conference',
        start_date: toDatetimeLocal(data.start_date),
        end_date: toDatetimeLocal(data.end_date),
        location: data.location || '',
        venue_name: data.venue_name || '',
        is_online: !!data.is_online,
        registration_url: data.registration_url || '',
        cover_image_url: data.cover_image_url || '',
        trade: data.trade || '',
        is_approved: !!data.is_approved,
        created_at: data.created_at,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isNew]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // Event times — end must not be before start.
  const datesInvalid =
    !!form.start_date &&
    !!form.end_date &&
    new Date(form.end_date).getTime() < new Date(form.start_date).getTime();

  const canSubmit =
    form.title.trim().length >= 4 &&
    form.description.trim().length >= 10 &&
    !!form.start_date &&
    !datesInvalid &&
    !saving;

  const handleSave = async (approveOverride) => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    const payload = {
      authorId: user?.id,
      title: form.title,
      slug: form.slug,
      description: form.description,
      eventType: form.event_type,
      startDate: form.start_date,
      endDate: form.end_date || null,
      location: form.location,
      venueName: form.venue_name,
      isOnline: form.is_online,
      registrationUrl: form.registration_url,
      coverImageUrl: form.cover_image_url,
      trade: form.trade,
      isApproved: typeof approveOverride === 'boolean' ? approveOverride : form.is_approved,
    };
    if (isNew) {
      const { data, error } = await createEvent(payload);
      setSaving(false);
      if (error) { setError(error.message || 'Could not create'); return; }
      navigate('/admin/events/' + data.id);
    } else {
      const dbPatch = {
        title: payload.title.trim(),
        slug: payload.slug || undefined,
        description: payload.description,
        event_type: payload.eventType || null,
        start_date: payload.startDate,
        end_date: payload.endDate,
        location: payload.location || null,
        venue_name: payload.venueName || null,
        is_online: payload.isOnline,
        registration_url: payload.registrationUrl || null,
        cover_image_url: payload.coverImageUrl || null,
        trade: payload.trade || null,
        is_approved: payload.isApproved,
      };
      Object.keys(dbPatch).forEach((k) => dbPatch[k] === undefined && delete dbPatch[k]);
      const { data, error } = await updateEvent(id, dbPatch);
      setSaving(false);
      if (error) { setError(error.message || 'Could not save'); return; }
      if (data) {
        setForm((f) => ({
          ...f,
          ...data,
          start_date: toDatetimeLocal(data.start_date),
          end_date: toDatetimeLocal(data.end_date),
        }));
      }
      setOkMsg(payload.isApproved ? 'Saved & approved.' : 'Saved.');
      setTimeout(() => setOkMsg(null), 2500);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setSaving(true);
    const { error } = await deleteEvent(id);
    setSaving(false);
    if (error) { setError(error.message || 'Could not delete'); return; }
    navigate('/admin/events');
  };

  if (loading) {
    return (
      <AdminLayout title="Loading…">
        <div className="adm-card">Loading event…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? 'New event' : (form.title || 'Edit event')}
      subtitle={
        isNew
          ? 'Add an industry event, trade show, workshop, or meetup.'
          : (form.is_approved ? 'Approved' : 'Draft') + ' · ' +
            (form.created_at ? new Date(form.created_at).toLocaleDateString() : '')
      }
      actions={
        <>
          <Link to="/admin/events" className="adm-btn">← All events</Link>
        </>
      }
    >
      <div className="adm-card">
        {error && <div className="adm-error" style={{ marginBottom: 12 }}>{error}</div>}
        {okMsg && <div className="adm-ok" style={{ marginBottom: 12 }}>{okMsg}</div>}
        {datesInvalid && (
          <div className="adm-error" style={{ marginBottom: 12 }}>
            The end date is before the start date. Fix the dates before saving.
          </div>
        )}

        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Title</label>
            <input
              type="text"
              className="adm-input"
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              placeholder="e.g. IWF Atlanta 2026"
              maxLength={200}
            />
            <div className="adm-hint">{form.title.length}/200</div>
          </div>

          <div className="adm-form-grid">
            <div className="adm-field">
              <label className="adm-label">Slug</label>
              <input
                type="text"
                className="adm-input"
                value={form.slug}
                onChange={(e) => set('slug')(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-'))}
                placeholder="leave blank to auto-generate"
              />
            </div>

            <div className="adm-field">
              <label className="adm-label">Event type</label>
              <select className="adm-select" value={form.event_type} onChange={(e) => set('event_type')(e.target.value)}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label className="adm-label">Starts</label>
              <input
                type="datetime-local"
                className="adm-input"
                value={form.start_date}
                onChange={(e) => set('start_date')(e.target.value)}
              />
            </div>

            <div className="adm-field">
              <label className="adm-label">Ends (optional)</label>
              <input
                type="datetime-local"
                className="adm-input"
                value={form.end_date}
                onChange={(e) => set('end_date')(e.target.value)}
              />
            </div>

            <div className="adm-field">
              <label className="adm-label">Venue</label>
              <input
                type="text"
                className="adm-input"
                value={form.venue_name}
                onChange={(e) => set('venue_name')(e.target.value)}
                placeholder="Georgia World Congress Center"
                disabled={form.is_online}
              />
            </div>

            <div className="adm-field">
              <label className="adm-label">Location</label>
              <input
                type="text"
                className="adm-input"
                value={form.location}
                onChange={(e) => set('location')(e.target.value)}
                placeholder="Atlanta, GA"
                disabled={form.is_online}
              />
            </div>

            <div className="adm-field">
              <label className="adm-label">Trade</label>
              <select className="adm-select" value={form.trade} onChange={(e) => set('trade')(e.target.value)}>
                <option value="">—</option>
                {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label className="adm-label">Registration URL</label>
              <input
                type="text"
                className="adm-input"
                value={form.registration_url}
                onChange={(e) => set('registration_url')(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="adm-switch">
            <button
              type="button"
              className={'adm-switch-toggle ' + (form.is_online ? 'on' : '')}
              onClick={() => set('is_online')(!form.is_online)}
              aria-label="Online event"
              aria-pressed={form.is_online}
            />
            <div className="adm-switch-text">
              <strong>{form.is_online ? 'Online event' : 'In-person event'}</strong>
              <span>
                {form.is_online
                  ? 'Venue and location fields are ignored for online events.'
                  : 'Fill in venue + location above.'}
              </span>
            </div>
          </div>

          <div className="adm-field full">
            <label className="adm-label">Cover image</label>
            <CoverImageUploader
              value={form.cover_image_url}
              onChange={(url) => set('cover_image_url')(url)}
              folder="events"
            />
          </div>

          <div className="adm-field">
            <div className="adm-tabs">
              <button type="button" className={'adm-tab ' + (descMode === 'write' ? 'active' : '')} onClick={() => setDescMode('write')}>Write</button>
              <button type="button" className={'adm-tab ' + (descMode === 'preview' ? 'active' : '')} onClick={() => setDescMode('preview')}>Preview</button>
              <div style={{ marginLeft: 'auto', padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontSize: 11.5 }}>
                Description · markdown supported
              </div>
            </div>
            {descMode === 'write' ? (
              <textarea
                className="adm-textarea"
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                placeholder="What is this event? Who should attend? Agenda, speakers, cost, etc."
              />
            ) : (
              <div className="adm-preview">
                {form.description.trim() ? (
                  <ReactMarkdown>{form.description}</ReactMarkdown>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Nothing to preview yet.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="adm-switch">
            <button
              type="button"
              className={'adm-switch-toggle ' + (form.is_approved ? 'on' : '')}
              onClick={() => set('is_approved')(!form.is_approved)}
              aria-label="Approved"
              aria-pressed={form.is_approved}
            />
            <div className="adm-switch-text">
              <strong>{form.is_approved ? 'Approved — visible on /events' : 'Draft — not visible yet'}</strong>
              <span>
                {form.is_approved
                  ? 'This event shows on the public Events page.'
                  : 'Only staff can see this until you approve it.'}
              </span>
            </div>
          </div>

          <div className="adm-footer">
            <div className="adm-timestamp">
              {!isNew && form.created_at
                ? 'Created ' + new Date(form.created_at).toLocaleString()
                : ''}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isNew && (
                <button type="button" className="adm-btn danger" onClick={handleDelete} disabled={saving}>
                  Delete
                </button>
              )}
              <button type="button" className="adm-btn" onClick={() => handleSave(false)} disabled={!canSubmit}>
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button type="button" className="adm-btn primary" onClick={() => handleSave(true)} disabled={!canSubmit}>
                {form.is_approved ? (saving ? 'Saving…' : 'Save & keep approved') : (saving ? 'Approving…' : 'Approve & publish')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

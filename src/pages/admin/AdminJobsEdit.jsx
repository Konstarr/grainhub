import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getJob, createJob, updateJob, deleteJob } from '../../lib/adminDb.js';

const EMPLOYMENT_TYPES = [
  { value: '',               label: '—' },
  { value: 'full-time',      label: 'Full-time' },
  { value: 'part-time',      label: 'Part-time' },
  { value: 'contract',       label: 'Contract' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'temporary',      label: 'Temporary / Seasonal' },
];

const TRADES = ['Cabinetmaking', 'Millwork', 'Flooring', 'Finishing', 'CNC', 'Supply / Distribution', 'General'];

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export default function AdminJobsEdit() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    trade: '',
    employment_type: 'full-time',
    salary_min: '',
    salary_max: '',
    salary_period: 'year',
    description: '',
    requirements: '',
    benefits: '',
    apply_url: '',
    apply_email: '',
    expires_at: '',
    is_approved: false,
    is_filled: false,
    author_id: null,
    posted_at: null,
  });

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getJob(id);
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message || 'Job not found');
        setLoading(false);
        return;
      }
      setForm({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        trade: data.trade || '',
        employment_type: data.employment_type || 'full-time',
        salary_min: data.salary_min ?? '',
        salary_max: data.salary_max ?? '',
        salary_period: data.salary_period || 'year',
        description: data.description || '',
        requirements: data.requirements || '',
        benefits: data.benefits || '',
        apply_url: data.apply_url || '',
        apply_email: data.apply_email || '',
        expires_at: toDatetimeLocal(data.expires_at),
        is_approved: !!data.is_approved,
        is_filled: !!data.is_filled,
        author_id: data.author_id || null,
        posted_at: data.posted_at || null,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isNew]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.title.trim().length >= 4 &&
    form.company.trim().length >= 2 &&
    form.location.trim().length >= 2 &&
    form.description.trim().length >= 20 &&
    !saving;

  const buildPayload = (approveOverride) => ({
    author_id:       form.author_id || user?.id || null,
    title:           form.title.trim(),
    company:         form.company.trim(),
    location:        form.location.trim(),
    trade:           form.trade || null,
    employment_type: form.employment_type || null,
    salary_min:      form.salary_min === '' ? null : Number(form.salary_min),
    salary_max:      form.salary_max === '' ? null : Number(form.salary_max),
    salary_period:   form.salary_period,
    description:     form.description,
    requirements:    form.requirements || null,
    benefits:        form.benefits || null,
    apply_url:       form.apply_url || null,
    apply_email:     form.apply_email || null,
    expires_at:      form.expires_at ? new Date(form.expires_at).toISOString() : null,
    is_approved:     typeof approveOverride === 'boolean' ? approveOverride : form.is_approved,
    is_filled:       form.is_filled,
  });

  const handleSave = async (approveOverride) => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    const payload = buildPayload(approveOverride);
    if (isNew) {
      const { data, error } = await createJob(payload);
      setSaving(false);
      if (error) { setError(error.message || 'Could not create'); return; }
      navigate('/admin/jobs/' + data.id);
    } else {
      const { data, error } = await updateJob(id, payload);
      setSaving(false);
      if (error) { setError(error.message || 'Could not save'); return; }
      if (data) {
        setForm((f) => ({ ...f, ...data, expires_at: toDatetimeLocal(data.expires_at) }));
      }
      setOkMsg(payload.is_approved ? 'Saved & approved.' : 'Saved as draft.');
      setTimeout(() => setOkMsg(null), 2500);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setSaving(true);
    const { error } = await deleteJob(id);
    setSaving(false);
    if (error) { setError(error.message || 'Could not delete'); return; }
    navigate('/admin/jobs');
  };

  if (loading) {
    return (
      <AdminLayout title="Loading…">
        <div className="adm-card">Loading job…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? 'New job' : (form.title || 'Edit job')}
      subtitle={
        isNew
          ? 'Post a new opening. Applicants click through to Apply URL or Apply email.'
          : (form.is_filled ? 'Filled' : (form.is_approved ? 'Approved' : 'Draft')) +
            (form.posted_at ? ' · Posted ' + new Date(form.posted_at).toLocaleDateString() : '')
      }
      actions={
        <>
          <Link to="/admin/jobs" className="adm-btn">← All jobs</Link>
          {!isNew && form.is_approved && (
            <Link to={'/jobs/' + id} className="adm-btn" target="_blank">View public</Link>
          )}
        </>
      }
    >
      <div className="adm-card">
        {error && <div className="adm-error" style={{ marginBottom: 12 }}>{error}</div>}
        {okMsg && <div className="adm-ok" style={{ marginBottom: 12 }}>{okMsg}</div>}

        <div className="adm-form">
          <div className="adm-form-grid">
            <div className="adm-field full">
              <label className="adm-label">Title</label>
              <input type="text" className="adm-input" value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                placeholder="e.g. Lead Cabinet Maker — Custom Residential" maxLength={180} />
            </div>

            <div className="adm-field">
              <label className="adm-label">Company</label>
              <input type="text" className="adm-input" value={form.company} onChange={(e) => set('company')(e.target.value)} placeholder="Heritage Millwork Co." />
            </div>
            <div className="adm-field">
              <label className="adm-label">Location</label>
              <input type="text" className="adm-input" value={form.location} onChange={(e) => set('location')(e.target.value)} placeholder="Denver, CO" />
            </div>

            <div className="adm-field">
              <label className="adm-label">Employment type</label>
              <select className="adm-select" value={form.employment_type} onChange={(e) => set('employment_type')(e.target.value)}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Primary trade</label>
              <select className="adm-select" value={form.trade} onChange={(e) => set('trade')(e.target.value)}>
                <option value="">—</option>
                {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="adm-field">
              <label className="adm-label">Salary period</label>
              <select className="adm-select" value={form.salary_period} onChange={(e) => set('salary_period')(e.target.value)}>
                <option value="year">per year</option>
                <option value="hour">per hour</option>
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Expires (optional)</label>
              <input type="datetime-local" className="adm-input" value={form.expires_at} onChange={(e) => set('expires_at')(e.target.value)} />
            </div>

            <div className="adm-field">
              <label className="adm-label">Salary min</label>
              <input type="number" className="adm-input" value={form.salary_min} onChange={(e) => set('salary_min')(e.target.value)} placeholder={form.salary_period === 'hour' ? 'e.g. 28' : 'e.g. 55000'} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Salary max</label>
              <input type="number" className="adm-input" value={form.salary_max} onChange={(e) => set('salary_max')(e.target.value)} placeholder={form.salary_period === 'hour' ? 'e.g. 38' : 'e.g. 75000'} />
            </div>

            <div className="adm-field">
              <label className="adm-label">Apply URL</label>
              <input type="text" className="adm-input" value={form.apply_url} onChange={(e) => set('apply_url')(e.target.value)} placeholder="https://yourcompany.com/careers/…" />
              <div className="adm-hint">Preferred — the Apply button opens this.</div>
            </div>
            <div className="adm-field">
              <label className="adm-label">Apply email (fallback)</label>
              <input type="email" className="adm-input" value={form.apply_email} onChange={(e) => set('apply_email')(e.target.value)} placeholder="hiring@yourcompany.com" />
              <div className="adm-hint">Used only if no Apply URL is set.</div>
            </div>
          </div>

          <div className="adm-field">
            <label className="adm-label">Description</label>
            <textarea
              className="adm-input"
              style={{ fontFamily: 'inherit', minHeight: 180, lineHeight: 1.55 }}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="What does this role do day-to-day? What does success look like?"
            />
            <div className="adm-hint">{form.description.length} chars · plain text, paragraph breaks preserved.</div>
          </div>

          <div className="adm-field">
            <label className="adm-label">Requirements (optional)</label>
            <textarea
              className="adm-input"
              style={{ fontFamily: 'inherit', minHeight: 120, lineHeight: 1.55 }}
              value={form.requirements}
              onChange={(e) => set('requirements')(e.target.value)}
              placeholder="5+ yrs millwork experience, CNC programming knowledge, etc."
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Benefits (optional)</label>
            <textarea
              className="adm-input"
              style={{ fontFamily: 'inherit', minHeight: 100, lineHeight: 1.55 }}
              value={form.benefits}
              onChange={(e) => set('benefits')(e.target.value)}
              placeholder="Health, PTO, company truck, overtime, paid cert programs, etc."
            />
          </div>

          <div className="adm-switch">
            <button
              type="button"
              className={'adm-switch-toggle ' + (form.is_approved ? 'on' : '')}
              onClick={() => set('is_approved')(!form.is_approved)}
              aria-pressed={form.is_approved}
            />
            <div className="adm-switch-text">
              <strong>{form.is_approved ? 'Approved — visible on /jobs' : 'Draft — not visible yet'}</strong>
              <span>Approved jobs show on the public jobs page unless marked Filled.</span>
            </div>
          </div>

          <div className="adm-switch">
            <button
              type="button"
              className={'adm-switch-toggle ' + (form.is_filled ? 'on' : '')}
              onClick={() => set('is_filled')(!form.is_filled)}
              aria-pressed={form.is_filled}
            />
            <div className="adm-switch-text">
              <strong>{form.is_filled ? 'Marked filled' : 'Accepting applicants'}</strong>
              <span>Filled jobs are hidden from the public list but kept in your admin for records.</span>
            </div>
          </div>

          <div className="adm-footer">
            <div className="adm-timestamp">
              {form.posted_at ? 'Posted ' + new Date(form.posted_at).toLocaleString() : ''}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isNew && (
                <button type="button" className="adm-btn danger" onClick={handleDelete} disabled={saving}>Delete</button>
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

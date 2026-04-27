import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchMyForHireListing,
  submitForHire,
  closeMyForHire,
  uploadResume,
} from '../lib/forHireDb.js';

const TRADES = ['millwork', 'cabinet', 'finishing', 'install', 'cnc', 'lumber', 'other'];
const EMP_TYPES = ['full-time', 'part-time', 'contract', 'apprenticeship'];

export default function ForHireNew() {
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState(null);

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [trade, setTrade]             = useState('');
  const [location, setLocation]       = useState('');
  const [employmentType, setEmpType]  = useState('full-time');
  const [years, setYears]             = useState('');
  const [rateMin, setRateMin]         = useState('');
  const [rateMax, setRateMax]         = useState('');
  const [resumeUrl, setResumeUrl]     = useState('');
  const [portfolio, setPortfolio]     = useState('');
  const [contactEmail, setContact]    = useState('');
  const [uploading, setUploading]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [err, setErr]                 = useState('');

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await fetchMyForHireListing();
      if (cancelled) return;
      if (data) {
        setExisting(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setTrade(data.trade || '');
        setLocation(data.location || '');
        setEmpType(data.employment_type || 'full-time');
        setYears(data.years_experience ?? '');
        setRateMin(data.hourly_rate_min ?? '');
        setRateMax(data.hourly_rate_max ?? '');
        setResumeUrl(data.resume_url || '');
        setPortfolio((data.portfolio_urls || []).join('\n'));
        setContact(data.apply_email || user?.email || '');
      } else if (user?.email) {
        setContact(user.email);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isAuthed, user?.id]);

  const handlePickResume = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setUploading(true); setErr('');
    const { data, error } = await uploadResume(f);
    setUploading(false);
    if (error) { setErr(error.message); return; }
    if (data?.url) setResumeUrl(data.url);
  };

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true); setErr('');
    const portfolioArr = portfolio
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s))
      .slice(0, 8);
    const { error } = await submitForHire({
      title,
      description,
      trade: trade || null,
      location,
      employmentType,
      years: years === '' ? null : Number(years),
      rateMin: rateMin === '' ? null : Number(rateMin),
      rateMax: rateMax === '' ? null : Number(rateMax),
      resumeUrl: resumeUrl || null,
      portfolio: portfolioArr,
      contactEmail,
    });
    setSubmitting(false);
    if (error) {
      const m = error.message || '';
      setErr(
        m.includes('title_required') ? 'Title is required (4+ chars).'
        : m.includes('description_required') ? 'Description is required (20+ chars).'
        : m.includes('auth_required') ? 'Please sign in.'
        : (m || 'Could not save listing.')
      );
      return;
    }
    navigate('/jobs?kind=seeking');
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm('Take down your For Hire listing?')) return;
    const { error } = await closeMyForHire();
    if (error) { setErr(error.message || 'Could not close listing.'); return; }
    navigate('/jobs?kind=seeking');
  };

  if (!isAuthed) {
    return (
      <div className="wrap" style={{ padding: 32 }}>
        <PageBack backTo="/jobs" backLabel="Back to Jobs" />
        <h1>Post yourself For Hire</h1>
        <p>Please <a href="/signup?next=/jobs/for-hire/new">sign in</a> to post a For Hire listing.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="wrap" style={{ padding: 32 }}>Loading…</div>;
  }

  return (
    <div className="wrap" style={{ padding: 32, maxWidth: 760 }}>
      <PageBack
        backTo="/jobs"
        backLabel="Back to Jobs"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Jobs', to: '/jobs' }, { label: 'For Hire' }]}
      />
      <h1 style={{ marginTop: 12 }}>{existing ? 'Edit your For Hire listing' : 'Post yourself For Hire'}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>
        One active listing per user. Employers can find you on the For Hire tab and contact you directly.
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label className="claim-field">
          <span>Headline</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior cabinetmaker available — 12 yrs exp"
            maxLength={120}
            required
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="claim-field">
            <span>Trade</span>
            <select value={trade} onChange={(e) => setTrade(e.target.value)}>
              <option value="">— select —</option>
              {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="claim-field">
            <span>Looking for</span>
            <select value={employmentType} onChange={(e) => setEmpType(e.target.value)}>
              {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="claim-field">
            <span>Years experience</span>
            <input
              type="number" min="0" max="60" inputMode="numeric"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </label>
          <label className="claim-field">
            <span>Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Charlotte, NC"
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label className="claim-field">
            <span>Hourly rate min ($)</span>
            <input type="number" min="0" value={rateMin} onChange={(e) => setRateMin(e.target.value)} />
          </label>
          <label className="claim-field">
            <span>Hourly rate max ($)</span>
            <input type="number" min="0" value={rateMax} onChange={(e) => setRateMax(e.target.value)} />
          </label>
        </div>

        <label className="claim-field">
          <span>About / specialties</span>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell employers what you specialize in, projects you're proud of, and what you're looking for."
            maxLength={4000}
            required
          />
        </label>

        <label className="claim-field">
          <span>Resume (PDF, max 8 MB)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label className="claim-btn ghost" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              {uploading ? 'Uploading…' : (resumeUrl ? 'Replace PDF' : 'Upload PDF')}
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePickResume}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                View current resume →
              </a>
            )}
            {resumeUrl && (
              <button
                type="button"
                className="claim-btn ghost"
                onClick={() => setResumeUrl('')}
              >
                Remove
              </button>
            )}
          </div>
        </label>

        <label className="claim-field">
          <span>Portfolio links (one URL per line, up to 8)</span>
          <textarea
            rows={3}
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder={'https://my-portfolio.com\nhttps://instagram.com/myshop'}
          />
        </label>

        <label className="claim-field">
          <span>Contact email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {err && <div className="claim-error">{err}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
          {existing
            ? <button type="button" className="claim-btn ghost" onClick={remove}>Take down listing</button>
            : <span />}
          <button type="submit" className="claim-btn primary" disabled={submitting}>
            {submitting ? 'Saving…' : (existing ? 'Update listing' : 'Post listing')}
          </button>
        </div>
      </form>
    </div>
  );
}

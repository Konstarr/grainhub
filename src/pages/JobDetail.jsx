import { useEffect, useState } from 'react';
import { recordJobView, recordJobClick } from '../lib/forHireDb.js';
import { Link, useParams } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function normalizeUrl(raw) {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (/^\s*javascript:/i.test(v)) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('/')) return v;
  if (/^\/\//.test(v)) return 'https:' + v;
  return 'https://' + v;
}

function formatSalary(row) {
  if (row.salary_min == null && row.salary_max == null) return null;
  const period = row.salary_period || 'year';
  if (period === 'hour') {
    const a = row.salary_min != null ? '$' + row.salary_min : null;
    const b = row.salary_max != null ? '$' + row.salary_max : null;
    return [a, b].filter(Boolean).join(' – ') + '/hr';
  }
  const fmt = (n) => n >= 1000 ? '$' + Math.round(n / 1000) + 'K' : '$' + n;
  const a = row.salary_min != null ? fmt(row.salary_min) : null;
  const b = row.salary_max != null ? fmt(row.salary_max) : null;
  return [a, b].filter(Boolean).join(' – ') + '/yr';
}

function daysSince(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d <= 0) return 'Posted today';
  if (d === 1) return '1 day ago';
  if (d < 30) return d + ' days ago';
  if (d < 60) return '1 month ago';
  return Math.floor(d / 30) + ' months ago';
}

/**
 * /jobs/:id — public job detail. Fetches the row, renders full
 * description + requirements + benefits, and exposes an Apply CTA that
 * routes to apply_url if present, falls back to mailto:apply_email, or
 * finally shows a notice.
 */
export default function JobDetail() {
  const { id } = useParams();
  const { isAuthed, user, isStaff } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error) { setErr(error); setLoading(false); return; }
      setJob(data);
      setLoading(false);
      // Record a view (server skips self-views).
      if (data?.id) recordJobView(data.id);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onApplyClick = () => {
    if (job?.id) recordJobClick(job.id);
  };

  const isOwner = !!user?.id && job?.author_id === user.id;
  const showStats = isOwner || isStaff;

  if (loading) {
    return (
      <>
        <PageBack backTo="/jobs" backLabel="Back to Jobs" />
        <div className="main-wrap"><div style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading job…</div></div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PageBack backTo="/jobs" backLabel="Back to Jobs" />
        <div className="main-wrap">
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)' }}>Job not found</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
              {err ? 'Error: ' + (err.message || 'unknown') : 'This listing may have been taken down.'}
            </p>
            <Link to="/jobs" style={{ color: 'var(--wood-warm)' }}>← Browse all jobs</Link>
          </div>
        </div>
      </>
    );
  }

  const applyUrl   = normalizeUrl(job.apply_url);
  const applyEmail = job.apply_email || null;
  const salary     = formatSalary(job);
  const posted     = daysSince(job.posted_at);

  const ApplyCTA = () => {
    if (applyUrl) {
      // Parsing can throw on pathological inputs even after normalize — guard.
      let host = '';
      try { host = new URL(applyUrl).hostname.replace(/^www\./, ''); }
      catch { host = ''; }
      return (
        <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="jd-apply-btn" onClick={onApplyClick}>
          {host ? 'Apply on ' + host + ' →' : 'Apply →'}
        </a>
      );
    }
    if (applyEmail) {
      const subject = encodeURIComponent('Application: ' + (job.title || ''));
      return (
        <a href={'mailto:' + applyEmail + '?subject=' + subject} className="jd-apply-btn" onClick={onApplyClick}>
          Apply via email →
        </a>
      );
    }
    return (
      <button
        type="button"
        className="jd-apply-btn"
        onClick={() => alert('The employer hasn\u2019t added an apply link yet. Check back soon, or contact them directly on the site.')}
      >
        Apply →
      </button>
    );
  };

  return (
    <>
      <PageBack
        backTo="/jobs"
        backLabel="Back to Jobs"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Jobs', to: '/jobs' },
          { label: job.title },
        ]}
      />

      <style>{`
        .jd-wrap { max-width: 1040px; margin: 0 auto; padding: 1rem 1.25rem 4rem; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 1.5rem; align-items: start; }
        @media (max-width: 900px) { .jd-wrap { grid-template-columns: 1fr; } }

        .jd-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; }
        .jd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 0.85rem; }
        .jd-chip { display: inline-flex; align-items: center; padding: 3px 11px; border-radius: 999px; background: var(--wood-cream, #FBF6EC); border: 1px solid var(--border); color: var(--text-secondary); font-size: 12px; font-weight: 500; }
        .jd-chip.urgent { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
        .jd-title { font-family: var(--font-display); font-size: 1.85rem; color: var(--text-primary); margin: 0 0 0.35rem; line-height: 1.15; }
        .jd-company { color: var(--text-secondary); font-size: 15px; margin-bottom: 0.25rem; }
        .jd-meta-row { display: flex; flex-wrap: wrap; gap: 14px; color: var(--text-muted); font-size: 13px; margin-top: 8px; }
        .jd-section-title { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary); margin: 1rem 0 0.5rem; }
        .jd-body { font-size: 14.5px; line-height: 1.75; color: var(--text-primary); white-space: pre-wrap; }
        .jd-apply-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.65rem 1.25rem;
          background: linear-gradient(135deg, #8A5030, #6B3D20);
          color: #fff; text-decoration: none;
          border-radius: 999px; font-weight: 600; font-size: 14px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 4px rgba(90,66,38,0.2);
          transition: filter 120ms, transform 100ms;
        }
        .jd-apply-btn:hover { filter: brightness(1.08); }
        .jd-apply-btn:active { transform: translateY(1px); }
        .jd-stat { background: var(--wood-cream, #FBF6EC); border-radius: 10px; padding: 0.9rem 1.1rem; margin-top: 1rem; }
        .jd-stat-label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 2px; }
        .jd-stat-value { font-family: var(--font-display); font-size: 1.25rem; color: var(--text-primary); }
      `}</style>

      {showStats && (
        <div style={{
          maxWidth: 1040, margin: '0 auto', padding: '12px 1.25rem 0',
        }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
            background: '#FFF8EE',
            border: '1px solid var(--border-light, #EDD9B0)',
            borderRadius: 10,
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--wood-warm, #6B3F1F)' }}>
              {isOwner ? 'Your listing' : 'Admin view'}
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              <Stat label="Views" value={job.view_count || 0} />
              <Stat label="Clicks" value={job.click_count || 0} />
              <Stat
                label="Click rate"
                value={(job.view_count || 0) > 0 ? Math.round(((job.click_count || 0) / job.view_count) * 100) + '%' : '—'}
              />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Self-views aren't counted. Stats update on each refresh.
            </div>
          </div>
        </div>
      )}

      <div className="jd-wrap">
        <div>
          <div className="jd-card">
            <div className="jd-chips">
              {job.employment_type && <span className="jd-chip" style={{ textTransform: 'capitalize' }}>{job.employment_type.replace('-', ' ')}</span>}
              {job.trade && <span className="jd-chip">{job.trade}</span>}
              {job.expires_at && new Date(job.expires_at).getTime() - Date.now() < 3 * 86400000 && (
                <span className="jd-chip urgent">Closing soon</span>
              )}
            </div>
            <h1 className="jd-title">{job.title}</h1>
            <div className="jd-company">
              <strong>{job.company}</strong>
              {job.location && <> · {job.location}</>}
            </div>
            <div className="jd-meta-row">
              {salary && <span>💰 {salary}</span>}
              {posted && <span>🗓 {posted}</span>}
            </div>

            <div style={{ marginTop: '1.1rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ApplyCTA />
              {!isAuthed && (
                <Link to="/login" className="jd-apply-btn" style={{ background: 'var(--white)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }}>
                  Log in to save
                </Link>
              )}
            </div>
          </div>

          {job.description && (
            <div className="jd-card">
              <div className="jd-section-title">About the role</div>
              <div className="jd-body">{job.description}</div>
            </div>
          )}

          {job.requirements && (
            <div className="jd-card">
              <div className="jd-section-title">Requirements</div>
              <div className="jd-body">{job.requirements}</div>
            </div>
          )}

          {job.benefits && (
            <div className="jd-card">
              <div className="jd-section-title">Benefits</div>
              <div className="jd-body">{job.benefits}</div>
            </div>
          )}

          <div className="jd-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>
              Ready to apply? One click and you&apos;re on your way.
            </div>
            <ApplyCTA />
          </div>
        </div>

        <aside>
          <div className="jd-card" style={{ marginBottom: '1rem' }}>
            <div className="jd-section-title" style={{ marginTop: 0 }}>Quick facts</div>
            {job.employment_type && (
              <div className="jd-stat"><div className="jd-stat-label">Employment</div><div className="jd-stat-value" style={{ textTransform: 'capitalize' }}>{job.employment_type.replace('-', ' ')}</div></div>
            )}
            {salary && (
              <div className="jd-stat"><div className="jd-stat-label">Salary</div><div className="jd-stat-value">{salary}</div></div>
            )}
            {job.location && (
              <div className="jd-stat"><div className="jd-stat-label">Location</div><div className="jd-stat-value">{job.location}</div></div>
            )}
          </div>

          <SponsorSidebar />
        </aside>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--text-muted, #9A7B5C)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 1, fontVariantNumeric: 'tabular-nums', color: '#2C1A0E' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  fetchForumSettings,
  updateForumSetting,
} from '../../lib/forumAdminDb.js';

/**
 * /admin/forums/reputation — admin-tunable reputation gains.
 * Stored as rows in forum_settings; the upvote triggers read each
 * value via get_forum_setting() with safe fallback defaults.
 *
 * Badge thresholds used to live on this page too, but they moved
 * to /admin/forums/badges where you can also edit icons, names,
 * descriptions and create new tiers. This page now just links
 * across.
 */
export default function AdminForumReputation() {
  const [vals, setVals] = useState({
    rep_thread_upvote: '',
    rep_post_upvote: '',
    rep_accepted_answer: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchForumSettings();
      if (cancelled) return;
      setVals((v) => {
        const next = { ...v };
        Object.keys(next).forEach((k) => { if (data[k] != null) next[k] = data[k]; });
        return next;
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (key) => (e) => setVals((v) => ({ ...v, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null); setOkMsg(null);

    // Validate everything is a non-negative integer first
    for (const v of Object.values(vals)) {
      const n = parseInt(v, 10);
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
        setBusy(false);
        setErr('All values must be whole numbers between 0 and 1,000,000.');
        return;
      }
    }

    // Push them all in parallel
    const results = await Promise.all(
      Object.entries(vals).map(([k, v]) => updateForumSetting(k, parseInt(v, 10))),
    );
    setBusy(false);
    const firstErr = results.find((r) => r.error);
    if (firstErr) {
      setErr(firstErr.error.message || 'Save failed.');
      return;
    }
    setOkMsg('Saved. New values apply to the next upvote.');
    setTimeout(() => setOkMsg(null), 3000);
  };

  return (
    <AdminLayout
      title="Reputation"
      subtitle="Tune the rep awarded per upvote. Badge icons, names and thresholds live on the Badges page."
      actions={
        <Link to="/admin/forums" className="cart-btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
          ← Back to forum mod.
        </Link>
      }
    >
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <form onSubmit={handleSave}>

          {/* ── Reputation rewards ── */}
          <section style={card}>
            <h2 style={cardTitle}>Reputation rewards</h2>
            <p style={cardSub}>
              Points the post / thread author gains when their content is upvoted.
              Lower numbers slow rep growth; higher numbers reward engagement faster.
            </p>
            <div style={grid}>
              <Field
                label="Per thread upvote"
                value={vals.rep_thread_upvote}
                onChange={set('rep_thread_upvote')}
                hint="Default 2"
              />
              <Field
                label="Per post upvote"
                value={vals.rep_post_upvote}
                onChange={set('rep_post_upvote')}
                hint="Default 1"
              />
              <Field
                label="Per accepted answer"
                value={vals.rep_accepted_answer}
                onChange={set('rep_accepted_answer')}
                hint="Default 10. Reserved for future wiring."
              />
            </div>
          </section>

          {/* ── Pointer to the Badges admin page ── */}
          <section style={{
            ...card,
            background: '#FBF2E5',
            borderColor: '#A56939',
            borderLeft: '4px solid #A56939',
          }}>
            <h2 style={cardTitle}>Levels & accolades</h2>
            <p style={cardSub}>
              Badge icons, names, descriptions, tiers and unlock rules
              (reputation, post upvotes, threads, posts, solved questions, etc.)
              are managed on the Badges page. You can also create new levels
              and accolades there.
            </p>
            <Link
              to="/admin/forums/badges"
              className="cart-btn primary"
              style={{
                display: 'inline-block',
                padding: '0.55rem 1.1rem',
                fontSize: 13.5,
                textDecoration: 'none',
              }}
            >
              Open Badges admin →
            </Link>
          </section>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="cart-btn primary"
              disabled={busy}
              style={{ padding: '0.6rem 1.25rem', fontSize: 14 }}
            >
              {busy ? 'Saving…' : 'Save all settings'}
            </button>
            {okMsg && <span style={{ color: '#1B4332', fontSize: 13 }}>{okMsg}</span>}
            {err && <span style={{ color: '#991b1b', fontSize: 13 }}>{err}</span>}
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1.1rem',
            background: '#FDFBF5',
            border: '1px dashed var(--border)',
            borderRadius: 10,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            Changes apply to <strong>future</strong> upvotes only. Existing reputation
            scores aren't recalculated. Lowering a badge threshold doesn't retroactively
            award badges either — only users who hit the new threshold via fresh
            activity will receive them.
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange, hint }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>{label}</span>
      <input
        type="number"
        min="0"
        max="1000000"
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
      {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>}
    </label>
  );
}

const card = {
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  marginBottom: '1rem',
};
const cardTitle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  margin: '0 0 4px',
  color: 'var(--text-primary)',
};
const cardSub = {
  margin: '0 0 0.85rem',
  fontSize: 13,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};
const inputStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--white)',
  width: 140,
};

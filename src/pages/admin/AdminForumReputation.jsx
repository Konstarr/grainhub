import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import {
  fetchForumSettings,
  updateForumSetting,
} from '../../lib/forumAdminDb.js';

/**
 * /admin/forums/reputation — admin-tunable reputation gains and
 * badge thresholds. Both groups are stored as rows in
 * forum_settings; the upvote triggers read each value via
 * get_forum_setting() with safe fallback defaults.
 */
export default function AdminForumReputation() {
  const [vals, setVals] = useState({
    rep_thread_upvote: '',
    rep_post_upvote: '',
    rep_accepted_answer: '',
    badge_trusted_rep: '',
    badge_respected_rep: '',
    badge_liked_upvotes: '',
    badge_helpful_upvotes: '',
    badge_authority_upvotes: '',
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
    for (const [k, v] of Object.entries(vals)) {
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
      title="Reputation & badges"
      subtitle="Tune the rep awarded per upvote and the unlock thresholds for each badge."
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

          {/* ── Badge thresholds ── */}
          <section style={card}>
            <h2 style={cardTitle}>Badge thresholds</h2>
            <p style={cardSub}>
              When users hit these milestones, the corresponding badge is awarded
              automatically. Adjust to make badges easier or harder to earn.
            </p>
            <BadgeRow
              icon="🛡️"
              name="Trusted"
              metric="reputation"
              suffix="rep"
              value={vals.badge_trusted_rep}
              onChange={set('badge_trusted_rep')}
              hint="Default 100"
            />
            <BadgeRow
              icon="🏅"
              name="Respected"
              metric="reputation"
              suffix="rep"
              value={vals.badge_respected_rep}
              onChange={set('badge_respected_rep')}
              hint="Default 500"
            />
            <BadgeRow
              icon="❤️"
              name="Liked"
              metric="total post upvotes"
              suffix="upvotes"
              value={vals.badge_liked_upvotes}
              onChange={set('badge_liked_upvotes')}
              hint="Default 10"
            />
            <BadgeRow
              icon="💡"
              name="Helpful"
              metric="total post upvotes"
              suffix="upvotes"
              value={vals.badge_helpful_upvotes}
              onChange={set('badge_helpful_upvotes')}
              hint="Default 50"
            />
            <BadgeRow
              icon="👑"
              name="Authority"
              metric="total post upvotes"
              suffix="upvotes"
              value={vals.badge_authority_upvotes}
              onChange={set('badge_authority_upvotes')}
              hint="Default 250"
            />
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
            {okMsg && <span style={{ color: '#2D5016', fontSize: 13 }}>{okMsg}</span>}
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

function BadgeRow({ icon, name, metric, suffix, value, onChange, hint }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0.75rem 0',
      borderTop: '1px solid var(--border-light)',
      flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: 24, lineHeight: 1, width: 32, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Awarded at {metric}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          min="0"
          max="1000000"
          value={value}
          onChange={onChange}
          style={{ ...inputStyle, width: 110 }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{suffix}</span>
      </div>
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 90, textAlign: 'right' }}>
          {hint}
        </span>
      )}
    </div>
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

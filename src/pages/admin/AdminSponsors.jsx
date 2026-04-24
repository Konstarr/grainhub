import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { fetchSponsorDashboard, slotsForTier } from '../../lib/adminDb.js';

/**
 * /admin/sponsors — overview dashboard, grouped by tier.
 *
 * Every sponsor card links through to the user's profile edit page, where
 * the sponsor section now owns all the media CRUD. Staff come here for a
 * quick "who's active, who's missing creative" read.
 */
const TIERS = [
  { key: 'platinum', label: 'Platinum', bg: 'linear-gradient(135deg, #F4E5A8, #D4A849)', accent: '#8A5B0C' },
  { key: 'gold',     label: 'Gold',     bg: 'linear-gradient(135deg, #FDF3D2, #E4BC55)', accent: '#7A5416' },
  { key: 'silver',   label: 'Silver',   bg: 'linear-gradient(135deg, #EDEDED, #BFBFBF)', accent: '#4E4E4E' },
];

const SLOT_LABEL = {
  marquee:     'Marquee',
  leaderboard: 'Leaderboard',
  sidebar:     'Sidebar',
  hero:        'Hero',
  other:       'Other',
};

export default function AdminSponsors() {
  const [data, setData] = useState({ platinum: [], gold: [], silver: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await fetchSponsorDashboard();
      if (cancelled) return;
      if (error) setErr(error.message || 'Failed to load');
      setData(data || { platinum: [], gold: [], silver: [] });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const totals = (data.platinum.length || 0) + (data.gold.length || 0) + (data.silver.length || 0);

  return (
    <AdminLayout
      title="Sponsors"
      subtitle={loading
        ? 'Loading…'
        : `${totals} active sponsor${totals === 1 ? '' : 's'} · ${data.platinum.length} Platinum · ${data.gold.length} Gold · ${data.silver.length} Silver`}
      actions={<Link to="/admin/users" className="adm-btn">Promote a user →</Link>}
    >
      {err && <div className="adm-error" style={{ marginBottom: 12 }}>{err}</div>}

      <div
        className="adm-card"
        style={{ padding: '1rem 1.25rem', marginBottom: 14, background: 'var(--wood-cream, #FBF6EC)' }}
      >
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text-primary)' }}>How this works.</strong>{' '}
          A user becomes a sponsor the moment you assign them a tier on their profile. Their tier
          automatically unlocks matching ad slots, and they can upload media directly inside their
          user edit page. Nothing to double-manage here.
          <div style={{ marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <TierMap tier="silver"   slots={slotsForTier('silver')} />
            <TierMap tier="gold"     slots={slotsForTier('gold')} />
            <TierMap tier="platinum" slots={slotsForTier('platinum')} />
          </div>
        </div>
      </div>

      {TIERS.map((tier) => {
        const sponsors = data[tier.key] || [];
        return (
          <div key={tier.key} className="adm-card" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: tier.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tier.accent, fontWeight: 800, fontSize: 11,
                  letterSpacing: '0.08em', textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                }}>
                  {tier.label[0]}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>
                    {tier.label} sponsors
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                    Unlocks: {slotsForTier(tier.key).map((s) => SLOT_LABEL[s]).join(' · ') || 'no slots'}
                  </div>
                </div>
              </div>
              <span className="adm-pill pub">{sponsors.length}</span>
            </div>

            {sponsors.length === 0 ? (
              <div className="adm-empty">No {tier.label.toLowerCase()} sponsors yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {sponsors.map((s) => (
                  <SponsorCard key={s.id} sponsor={s} accent={tier.accent} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </AdminLayout>
  );
}

function TierMap({ tier, slots }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
      <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 600 }}>
        {tier}:
      </strong>{' '}
      {slots.map((s) => SLOT_LABEL[s]).join(' · ') || '—'}
    </div>
  );
}

function SponsorCard({ sponsor, accent }) {
  const initials = (sponsor.full_name || sponsor.username || '??')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  // Per-slot coverage: which slots have at least one approved+active asset?
  const bySlot = {};
  (sponsor.media || []).forEach((m) => {
    (bySlot[m.slot] = bySlot[m.slot] || []).push(m);
  });

  // Show up to 3 thumbnail previews
  const thumbs = (sponsor.media || []).slice(0, 3);

  return (
    <Link
      to={'/admin/users/' + sponsor.id}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '0.9rem 1rem',
        background: 'var(--white)',
        transition: 'transform 120ms, box-shadow 120ms, border-color 120ms',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--wood-warm)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(90,66,38,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)';     e.currentTarget.style.transform = '';                    e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: sponsor.avatar_url
              ? 'url(' + sponsor.avatar_url + ') center/cover no-repeat'
              : 'linear-gradient(135deg, #4A2A12, #A0642B)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {!sponsor.avatar_url && initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sponsor.sponsor_company || sponsor.full_name || sponsor.username}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{sponsor.username}
            </div>
          </div>
        </div>

        {thumbs.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, height: 48 }}>
            {thumbs.map((m) => (
              <div
                key={m.id}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #F1E4CC, #E6D5B3)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 3,
                  overflow: 'hidden',
                }}
              >
                <img src={m.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10, fontSize: 10.5 }}>
          {slotsForTier(sponsor.sponsor_tier).map((slot) => {
            const count = (bySlot[slot] || []).filter((m) => m.is_approved && m.is_active).length;
            const missing = count === 0;
            return (
              <span
                key={slot}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 999,
                  border: '1px solid ' + (missing ? '#fecaca' : 'var(--border)'),
                  background: missing ? '#fef2f2' : 'var(--wood-cream, #FBF6EC)',
                  color: missing ? '#991b1b' : accent,
                  fontWeight: 600,
                }}
              >
                {missing ? '○' : '●'} {SLOT_LABEL[slot]} ({count})
              </span>
            );
          })}
        </div>

        <div style={{ fontSize: 11, color: 'var(--wood-warm)', marginTop: 10, fontWeight: 600 }}>
          Edit sponsor →
        </div>
      </div>
    </Link>
  );
}

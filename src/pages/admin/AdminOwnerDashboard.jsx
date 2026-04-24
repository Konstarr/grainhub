import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { supabase } from '../../lib/supabase.js';
import {
  INDIVIDUAL_TIERS,
  BUSINESS_TIERS,
  ROLE_PACKS,
  SPONSOR_TIERS,
  findIndividualTier,
  findBusinessTier,
  findPackTier,
  findSponsorTier,
} from '../../lib/pricing.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

/**
 * /admin/dashboard — Owner-only business overview.
 *
 * All financial figures are computed client-side from:
 *   1) Raw counts returned by SECURITY DEFINER RPCs
 *   2) Prices defined in lib/pricing.js
 * so pricing.js remains the single source of truth.
 *
 * No new chart-library dependency — everything is pure SVG.
 */
export default function AdminOwnerDashboard() {
  const { isOwner, loading: authLoading } = useAuth();

  if (!authLoading && !isOwner) return <Navigate to="/admin/news" replace />;

  const [windowDays, setWindowDays] = useState(30);
  const [signups, setSignups]   = useState([]);
  const [usersByTier, setUBT]   = useState([]);
  const [packBreak,  setPacks]  = useState([]);
  const [spBreak,    setSp]     = useState([]);
  const [content,    setContent]= useState(null);
  const [loading,    setLoading]= useState(true);
  const [err,        setErr]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const [a, b, c, d, e] = await Promise.all([
        supabase.rpc('owner_user_signups_by_day', { days: windowDays }),
        supabase.rpc('owner_users_by_tier',       {}),
        supabase.rpc('owner_packs_breakdown',     {}),
        supabase.rpc('owner_sponsor_breakdown',   {}),
        supabase.rpc('owner_content_counts',      {}),
      ]);
      if (cancelled) return;
      const firstErr =
        a.error || b.error || c.error || d.error || e.error;
      if (firstErr) {
        setErr('Could not load dashboard — ensure migration-owner-dashboard.sql has been run. (' + firstErr.message + ')');
      }
      setSignups((a.data || []).map((r) => ({ day: r.day, signups: Number(r.signups || 0) })));
      setUBT((b.data || []).map((r) => ({ ...r, users: Number(r.users || 0) })));
      setPacks((c.data || []).map((r) => ({ ...r, users: Number(r.users || 0) })));
      setSp((d.data || []).map((r) => ({ ...r, users: Number(r.users || 0) })));
      setContent(Array.isArray(e.data) ? e.data[0] || null : e.data || null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [windowDays]);

  /** ═══════════ Revenue computation (client-side) ═══════════ */
  const finance = useMemo(() => {
    // Membership MRR
    let membershipMrr = 0;
    const membershipBreakdown = [];
    usersByTier.forEach((row) => {
      const tier =
        row.account_type === 'business'
          ? findBusinessTier(row.membership_tier)
          : findIndividualTier(row.membership_tier);
      const monthly = tier?.priceMonthly || 0;
      const rev = monthly * row.users;
      membershipMrr += rev;
      if (rev > 0) {
        membershipBreakdown.push({
          label: (row.account_type === 'business' ? 'Business' : 'Individual') + ' · ' + tier.name,
          users: row.users,
          mrr: rev,
        });
      }
    });

    // Role-pack MRR
    let packsMrr = 0;
    const packsBreakdown = [];
    packBreak.forEach((row) => {
      const tier = findPackTier(row.pack_slug, row.tier_slug);
      const monthly = tier?.priceMonthly || 0;
      const rev = monthly * row.users;
      packsMrr += rev;
      if (rev > 0) {
        const packName = ROLE_PACKS.find((p) => p.id === row.pack_slug)?.name || row.pack_slug;
        packsBreakdown.push({
          label: packName + ' · ' + (tier?.name || row.tier_slug),
          users: row.users,
          mrr: rev,
        });
      }
    });

    // Sponsorship MRR
    let sponsorMrr = 0;
    const sponsorBreakdown = [];
    spBreak.forEach((row) => {
      const t = findSponsorTier(row.sponsor_tier);
      const monthly = t?.priceMonthly || 0;
      const rev = monthly * row.users;
      sponsorMrr += rev;
      if (rev > 0) {
        sponsorBreakdown.push({
          label: t.name,
          users: row.users,
          mrr: rev,
        });
      }
    });

    const totalMrr = membershipMrr + packsMrr + sponsorMrr;
    const arr = totalMrr * 12;

    // Paying users — any tier with monthly > 0 OR any active pack OR any sponsor tier
    const paying =
      usersByTier.reduce((s, r) => {
        const t = r.account_type === 'business'
          ? findBusinessTier(r.membership_tier)
          : findIndividualTier(r.membership_tier);
        return s + ((t?.priceMonthly || 0) > 0 ? r.users : 0);
      }, 0);

    return {
      membershipMrr,
      packsMrr,
      sponsorMrr,
      totalMrr,
      arr,
      paying,
      membershipBreakdown,
      packsBreakdown,
      sponsorBreakdown,
    };
  }, [usersByTier, packBreak, spBreak]);

  // Revenue by axis (for the stacked bar)
  const byAxis = useMemo(() => ([
    { label: 'Memberships', value: finance.membershipMrr, color: '#6B3F1F' },
    { label: 'Role packs',  value: finance.packsMrr,      color: '#A0522D' },
    { label: 'Sponsorships',value: finance.sponsorMrr,    color: '#C08050' },
  ]), [finance]);

  return (
    <AdminLayout
      title="Owner dashboard"
      subtitle={loading ? 'Loading…' : `$${finance.totalMrr.toLocaleString()} MRR · $${finance.arr.toLocaleString()} ARR · ${finance.paying} paying / ${content?.users_total ?? 0} total users`}
      actions={
        <select
          value={windowDays}
          onChange={(e) => setWindowDays(Number(e.target.value))}
          className="adm-btn"
          style={{ paddingRight: 24 }}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      }
    >
      {err && <div className="adm-error" style={{ marginBottom: 16 }}>{err}</div>}

      {/* ───── Headline KPIs ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <Kpi label="Monthly recurring revenue" value={'$' + finance.totalMrr.toLocaleString()} accent="#6B3F1F" big />
        <Kpi label="Annual run-rate"           value={'$' + finance.arr.toLocaleString()} />
        <Kpi label="Paying users"              value={finance.paying.toLocaleString()} accent="#2D5016" />
        <Kpi label="Total users"               value={(content?.users_total ?? 0).toLocaleString()}
             sub={content ? `${content.users_individual} individual · ${content.users_business} business` : ''} />
      </div>

      {/* ───── Signups over time line chart ───── */}
      <div className="adm-card" style={{ padding: '1rem 1.25rem', marginBottom: 16 }}>
        <SectionTitle>
          <span>New signups</span>
          <span style={mutedLabel}>daily · last {windowDays} days</span>
        </SectionTitle>
        {signups.length === 0 ? (
          <Empty>No signup data yet.</Empty>
        ) : (
          <LineChart data={signups} valueKey="signups" />
        )}
      </div>

      {/* ───── Revenue by axis ───── */}
      <div className="adm-card" style={{ padding: '1rem 1.25rem', marginBottom: 16 }}>
        <SectionTitle>
          <span>Revenue mix</span>
          <span style={mutedLabel}>monthly recurring, by source</span>
        </SectionTitle>
        <StackedBar rows={byAxis} total={finance.totalMrr} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          {byAxis.map((r) => (
            <MiniKpi key={r.label} label={r.label} value={'$' + r.value.toLocaleString()} color={r.color} />
          ))}
        </div>
      </div>

      {/* ───── Breakdowns grid ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <SectionTitle><span>Users by tier</span></SectionTitle>
          <UsersByTier rows={usersByTier} />
        </div>
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <SectionTitle><span>Revenue lines</span></SectionTitle>
          <RevenueLines
            membershipBreakdown={finance.membershipBreakdown}
            packsBreakdown={finance.packsBreakdown}
            sponsorBreakdown={finance.sponsorBreakdown}
          />
        </div>
      </div>

      {/* ───── Content volume strip ───── */}
      {content && (
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <SectionTitle><span>Content volume</span><span style={mutedLabel}>lifetime</span></SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <MiniKpi label="Articles"   value={`${content.articles_published}/${content.articles_total}`} sub="published / total" />
            <MiniKpi label="Threads"    value={content.threads_total.toLocaleString()} />
            <MiniKpi label="Posts"      value={content.posts_total.toLocaleString()} />
            <MiniKpi label="Listings"   value={`${content.listings_active}/${content.listings_total}`} sub="active / total" />
            <MiniKpi label="Jobs"       value={`${content.jobs_active}/${content.jobs_total}`} sub="active / total" />
            <MiniKpi label="Events"     value={content.events_total.toLocaleString()} />
            <MiniKpi label="Suppliers"  value={content.suppliers_total.toLocaleString()} />
            <MiniKpi label="Messages"   value={content.messages_total.toLocaleString()} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* ═════════════════ UI primitives ═════════════════ */

const mutedLabel = {
  fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
  color: 'var(--text-muted)', textTransform: 'uppercase',
};

function SectionTitle({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 10, fontFamily: 'Montserrat, sans-serif',
      fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
    }}>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ padding: '2rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>{children}</div>;
}

function Kpi({ label, value, sub, accent, big }) {
  return (
    <div className="adm-card" style={{ padding: big ? '1rem 1.15rem' : '0.85rem 1rem' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
        color: 'var(--text-muted)', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: big ? 32 : 24, fontWeight: 700,
        color: accent || 'var(--text-primary)',
        marginTop: 4, letterSpacing: '-0.3px',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniKpi({ label, value, sub, color }) {
  return (
    <div style={{
      padding: '8px 12px',
      border: '1px solid var(--border-light)',
      borderRadius: 8,
      borderLeft: color ? `3px solid ${color}` : undefined,
    }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.1 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

/* ─── Stacked horizontal bar ────────────────────────────── */
function StackedBar({ rows, total }) {
  if (!total || total <= 0) {
    return (
      <div style={{
        height: 36, background: '#F0E5CF', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 12.5,
      }}>No recurring revenue yet.</div>
    );
  }
  return (
    <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
      {rows.map((r) => {
        const pct = (r.value / total) * 100;
        if (pct === 0) return null;
        return (
          <div key={r.label} title={`${r.label} — $${r.value.toLocaleString()} (${pct.toFixed(1)}%)`}
               style={{
                 width: pct + '%', background: r.color,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
               }}>
            {pct >= 8 ? Math.round(pct) + '%' : ''}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Users by tier grouped bars ────────────────────────── */
function UsersByTier({ rows }) {
  // Pivot into individual[] and business[] arrays
  const ind = INDIVIDUAL_TIERS.map((t) => ({
    name: t.name,
    users: rows.filter((r) => r.account_type === 'individual' && r.membership_tier === t.id).reduce((s, r) => s + r.users, 0),
  }));
  const biz = BUSINESS_TIERS.map((t) => ({
    name: t.name,
    users: rows.filter((r) => r.account_type === 'business' && r.membership_tier === t.id).reduce((s, r) => s + r.users, 0),
  }));
  const max = Math.max(1, ...ind.map((r) => r.users), ...biz.map((r) => r.users));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <TierColumn title="Individuals" rows={ind} max={max} color="#6B3F1F" />
      <TierColumn title="Businesses"  rows={biz} max={max} color="#A0522D" />
    </div>
  );
}
function TierColumn({ title, rows, max, color }) {
  return (
    <div>
      <div style={{ ...mutedLabel, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map((r) => {
          const pct = Math.round((r.users / max) * 100);
          return (
            <div key={r.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{r.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.users}
                </span>
              </div>
              <div style={{ height: 6, background: '#F0E5CF', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: color, transition: 'width .3s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Revenue lines list ────────────────────────────────── */
function RevenueLines({ membershipBreakdown, packsBreakdown, sponsorBreakdown }) {
  const combined = [...membershipBreakdown, ...packsBreakdown, ...sponsorBreakdown]
    .sort((a, b) => b.mrr - a.mrr);
  if (combined.length === 0) {
    return <Empty>No paying customers yet.</Empty>;
  }
  const max = Math.max(...combined.map((r) => r.mrr));
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {combined.map((r) => {
        const pct = Math.round((r.mrr / max) * 100);
        return (
          <div key={r.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {r.label} <span style={{ color: 'var(--text-muted)' }}>× {r.users}</span>
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                ${r.mrr.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 5, background: '#F0E5CF', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: pct + '%', height: '100%',
                background: 'linear-gradient(90deg, #6B3F1F 0%, #A0522D 100%)',
                transition: 'width .3s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Reusable SVG line chart (mirrors the news one) ──── */
function LineChart({ data, valueKey = 'views' }) {
  const W = 800, H = 220, padL = 40, padR = 12, padT = 12, padB = 28;
  const values = data.map((d) => Number(d[valueKey] || 0));
  const max = Math.max(1, ...values);
  const niceMax = niceCeil(max);
  const xStep = data.length > 1 ? (W - padL - padR) / (data.length - 1) : 0;
  const yScale = (v) => padT + (H - padT - padB) * (1 - v / niceMax);

  const points = data.map((d, i) => ({
    x: padL + i * xStep,
    y: yScale(Number(d[valueKey] || 0)),
    ...d,
  }));
  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
  const areaD = points.length
    ? 'M' + points[0].x + ' ' + (H - padB) + ' L' +
      points.map((p) => p.x + ' ' + p.y).join(' L') +
      ' L' + points[points.length - 1].x + ' ' + (H - padB) + ' Z'
    : '';
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="ownerAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6B3F1F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6B3F1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => {
          const y = yScale(t);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E8DFCB" strokeWidth="1" />
              <text x={padL - 6} y={y + 3} fontSize="10" textAnchor="end" fill="#9A8070">{t}</text>
            </g>
          );
        })}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={d.day} x={padL + i * xStep} y={H - padB + 14}
                  fontSize="10" textAnchor="middle" fill="#9A8070">
              {fmtShortDate(d.day)}
            </text>
          ) : null
        )}
        {areaD && <path d={areaD} fill="url(#ownerAreaGrad)" />}
        {pathD && <path d={pathD} fill="none" stroke="#6B3F1F" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" />}
        {points.map((p) => (
          <circle key={p.day} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#6B3F1F" strokeWidth="1.5">
            <title>{fmtShortDate(p.day)}: {p[valueKey]}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function niceCeil(n) {
  if (n <= 1) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const frac = n / mag;
  let nice;
  if      (frac <= 1)  nice = 1;
  else if (frac <= 2)  nice = 2;
  else if (frac <= 5)  nice = 5;
  else                 nice = 10;
  return nice * mag;
}

function fmtShortDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

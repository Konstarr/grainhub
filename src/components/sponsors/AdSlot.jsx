import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import '../../styles/sponsorAd.css';

/**
 * AdSlot + three specialized components (SponsorHero, SponsorLeaderboard,
 * SponsorSidebar) that pull approved + active rows from sponsor_media for
 * a given slot and render one of them. If there are multiple candidates
 * we pick a random one on first render so sponsors get fair rotation
 * across page loads without any scheduling work on our side.
 *
 * Tier gating is enforced at the DB by the editor (media can only be
 * created for a slot the owner's tier unlocks) and by admin approval,
 * so here we just trust the rows we get back.
 */

function normalizeClickUrl(raw) {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (/^\s*javascript:/i.test(v)) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('/')) return v;
  if (/^\/\//.test(v)) return 'https:' + v;
  return 'https://' + v;
}

function pickOne(rows) {
  if (!rows || rows.length === 0) return null;
  if (rows.length === 1) return rows[0];
  return rows[Math.floor(Math.random() * rows.length)];
}

export function useSponsorAsset(slot, { tier } = {}) {
  const assets = useSponsorAssets(slot, { tier, limit: 1 });
  return assets[0] || null;
}

/**
 * Fetch up to `limit` approved+active sponsor rows for a slot,
 * optionally filtered by tier ('platinum' / 'gold' / etc.).
 * The full set is shuffled on each mount so sponsors rotate
 * fairly across page loads.
 */
export function useSponsorAssets(slot, { tier, limit = 1 } = {}) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase
        .from('sponsor_media')
        .select(`
          id, image_url, click_url, alt_text, tier, starts_at, ends_at, sort_order,
          owner:owner_id ( username, business_name, sponsor_company )
        `)
        .eq('slot', slot)
        .eq('is_approved', true)
        .eq('is_active', true);
      if (tier) q = q.eq('tier', tier);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) { setAssets([]); return; }
      const now = Date.now();
      const live = (data || []).filter((r) => {
        if (r.starts_at && new Date(r.starts_at).getTime() > now) return false;
        if (r.ends_at   && new Date(r.ends_at).getTime()   < now) return false;
        return true;
      });
      // Shuffle and take top `limit` so all sponsors get airtime
      // across page loads without scheduling work.
      const shuffled = [...live].sort(() => Math.random() - 0.5);
      setAssets(shuffled.slice(0, limit));
    })();
    return () => { cancelled = true; };
  }, [slot, tier, limit]);

  return assets;
}

function AdWrapper({ asset, children, className }) {
  const displayName = asset?.owner?.business_name
    || asset?.owner?.sponsor_company
    || asset?.alt_text
    || '';

  const href = normalizeClickUrl(asset?.click_url);
  const profileHref = asset?.owner?.username ? '/profile/' + asset.owner.username : null;

  if (href && /^https?:/i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer sponsored" className={className} title={displayName}>
        {children}
      </a>
    );
  }
  if (href && href.startsWith('/')) {
    return <Link to={href} className={className} title={displayName}>{children}</Link>;
  }
  if (profileHref) {
    return <Link to={profileHref} className={className} title={displayName}>{children}</Link>;
  }
  return <div className={className} title={displayName}>{children}</div>;
}

/* ----- Hero ----- */
export function SponsorHero() {
  const a = useSponsorAsset('hero');
  if (!a) return null;
  return (
    <div className="ad-wrap ad-wrap-hero" aria-label="Sponsored">
      <div className="ad-label">Sponsored by</div>
      <AdWrapper asset={a} className="ad-hero">
        <img src={a.image_url} alt={a.alt_text || (a.owner?.business_name || 'Sponsor')} loading="lazy" />
      </AdWrapper>
    </div>
  );
}

/* ----- Leaderboard ----- */
export function SponsorLeaderboard() {
  const a = useSponsorAsset('leaderboard');
  if (!a) return null;
  return (
    <div className="ad-wrap ad-wrap-leaderboard" aria-label="Sponsored">
      <div className="ad-label">Sponsored by</div>
      <AdWrapper asset={a} className="ad-leaderboard">
        <img src={a.image_url} alt={a.alt_text || (a.owner?.business_name || 'Sponsor')} loading="lazy" />
      </AdWrapper>
    </div>
  );
}

/* ----- Featured (platinum-only, single, compact) -----
 * Top of the right rail on the Forums page. Designed to sit
 * shoulder-to-shoulder with the Online Members strip — short
 * card, single platinum sponsor, "Featured sponsors" label. */
export function SponsorFeatured() {
  const a = useSponsorAsset('sidebar', { tier: 'platinum' });
  if (!a) {
    return (
      <div className="ad-wrap ad-wrap-featured" aria-label="Featured sponsorship slot">
        <div className="ad-label">Featured sponsors</div>
        <Link to="/sponsor" className="ad-featured ad-featured-empty">
          <div className="ad-empty-title">Premier slot open</div>
          <div className="ad-empty-cta">Become a Platinum sponsor →</div>
        </Link>
      </div>
    );
  }
  return (
    <div className="ad-wrap ad-wrap-featured" aria-label="Featured sponsor">
      <div className="ad-label">Featured sponsors</div>
      <AdWrapper asset={a} className="ad-featured">
        <img src={a.image_url} alt={a.alt_text || (a.owner?.business_name || 'Sponsor')} loading="lazy" />
      </AdWrapper>
      {(a.owner?.business_name || a.owner?.sponsor_company) && (
        <div className="ad-sponsor-name">
          {a.owner?.business_name || a.owner?.sponsor_company}
        </div>
      )}
    </div>
  );
}

/* ----- Multi (gold tier, up to 4 ads in a 2×2 grid) -----
 * Bottom of the right rail. Quad of gold-tier sponsors so the
 * slot rewards the broader pool of paying sponsors who didn't
 * pony up for platinum. */
export function SponsorMulti() {
  const assets = useSponsorAssets('sidebar', { tier: 'gold', limit: 4 });
  if (assets.length === 0) {
    return (
      <div className="ad-wrap ad-wrap-multi" aria-label="Sponsorship slot">
        <div className="ad-label">Sponsored by</div>
        <Link to="/sponsor" className="ad-multi-empty">
          <div className="ad-empty-title">This space is open</div>
          <div className="ad-empty-sub">4 spots for gold sponsors.</div>
          <span className="ad-empty-cta">Become a sponsor →</span>
        </Link>
      </div>
    );
  }
  return (
    <div className="ad-wrap ad-wrap-multi" aria-label="Sponsored">
      <div className="ad-label">Sponsored by</div>
      <div className="ad-multi-grid">
        {assets.map((a) => (
          <AdWrapper key={a.id} asset={a} className="ad-multi-cell">
            <img
              src={a.image_url}
              alt={a.alt_text || (a.owner?.business_name || 'Sponsor')}
              loading="lazy"
            />
          </AdWrapper>
        ))}
      </div>
    </div>
  );
}

/* ----- Sidebar -----
 * When there's no approved sponsor for this slot we render a soft
 * "Become a sponsor" fallback instead of nothing — that way the
 * sidebar real estate stays tied to the sponsorship circuit and
 * never blends into the page background. */
export function SponsorSidebar() {
  const a = useSponsorAsset('sidebar');
  if (!a) {
    return (
      <div className="ad-wrap ad-wrap-sidebar" aria-label="Sponsorship slot">
        <div className="ad-label">Sponsored by</div>
        <Link to="/sponsor" className="ad-sidebar ad-sidebar-empty">
          <div className="ad-empty-title">This space is open</div>
          <div className="ad-empty-sub">Reach the Millwork.io community.</div>
          <span className="ad-empty-cta">Become a sponsor →</span>
        </Link>
      </div>
    );
  }
  return (
    <div className="ad-wrap ad-wrap-sidebar" aria-label="Sponsored">
      <div className="ad-label">Sponsored by</div>
      <AdWrapper asset={a} className="ad-sidebar">
        <img src={a.image_url} alt={a.alt_text || (a.owner?.business_name || 'Sponsor')} loading="lazy" />
      </AdWrapper>
      {(a.owner?.business_name || a.owner?.sponsor_company) && (
        <div className="ad-sponsor-name">
          {a.owner?.business_name || a.owner?.sponsor_company}
        </div>
      )}
    </div>
  );
}

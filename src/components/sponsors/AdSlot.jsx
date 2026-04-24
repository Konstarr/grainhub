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

export function useSponsorAsset(slot) {
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('sponsor_media')
        .select(`
          id, image_url, click_url, alt_text, tier, starts_at, ends_at, sort_order,
          owner:owner_id ( username, business_name, sponsor_company )
        `)
        .eq('slot', slot)
        .eq('is_approved', true)
        .eq('is_active', true);
      if (cancelled) return;
      if (error) { setAsset(null); return; }
      const now = Date.now();
      const live = (data || []).filter((r) => {
        if (r.starts_at && new Date(r.starts_at).getTime() > now) return false;
        if (r.ends_at   && new Date(r.ends_at).getTime()   < now) return false;
        return true;
      });
      setAsset(pickOne(live));
    })();
    return () => { cancelled = true; };
  }, [slot]);

  return asset;
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
      <div className="ad-label">Featured sponsor</div>
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
      <div className="ad-label">Advertisement</div>
      <AdWrapper asset={a} className="ad-leaderboard">
        <img src={a.image_url} alt={a.alt_text || (a.owner?.business_name || 'Sponsor')} loading="lazy" />
      </AdWrapper>
    </div>
  );
}

/* ----- Sidebar ----- */
export function SponsorSidebar() {
  const a = useSponsorAsset('sidebar');
  if (!a) return null;
  return (
    <div className="ad-wrap ad-wrap-sidebar" aria-label="Sponsored">
      <div className="ad-label">Advertisement</div>
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';

const MIN_CHIPS_PER_GROUP = 10;
const SECONDS_PER_CHIP = 4.0; // was 3.2 — 25% slower scroll

/**
 * Normalize a user-entered click URL so the browser treats it as an
 * absolute link. Admins often paste "themillworkstudio.com" without a
 * protocol — React would then route it as a relative path, producing
 * garbage URLs like /current-path/themillworkstudio.com. Also strip
 * javascript: and other unsafe schemes defensively.
 */
function normalizeClickUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (/^\s*javascript:/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return 'https:' + trimmed;
  if (trimmed.startsWith('/')) return trimmed; // internal route
  return 'https://' + trimmed;
}

/**
 * Pulls approved + active marquee assets from sponsor_media and joins
 * the owner's business info in a single request so the chip can show
 * both the logo and a readable business name.
 */
async function fetchMarqueeAssets() {
  const { data, error } = await supabase
    .from('sponsor_media')
    .select(`
      id, image_url, click_url, alt_text, sort_order, tier, starts_at, ends_at,
      owner:owner_id ( username, business_name, sponsor_company, sponsor_tier )
    `)
    .eq('slot', 'marquee')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  const now = Date.now();
  return (data || []).filter((r) => {
    if (r.starts_at && new Date(r.starts_at).getTime() > now) return false;
    if (r.ends_at   && new Date(r.ends_at).getTime()   < now) return false;
    return true;
  });
}

export default function SponsorStrip() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchMarqueeAssets();
      if (!cancelled) setAssets(data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  if (assets.length === 0) return null;

  const sponsors = assets.map((a) => {
    const displayName =
      a.owner?.business_name ||
      a.owner?.sponsor_company ||
      a.alt_text ||
      '';
    return {
      id: a.id,
      name: displayName,
      logoUrl: a.image_url,
      clickUrl: normalizeClickUrl(a.click_url),
      profileHandle: a.owner?.username || null,
    };
  });

  const reps = Math.max(1, Math.ceil(MIN_CHIPS_PER_GROUP / sponsors.length));
  const expanded = Array.from({ length: reps }).flatMap((_, r) =>
    sponsors.map((s) => ({ ...s, _rep: r }))
  );
  const durationSeconds = Math.max(24, Math.round(expanded.length * SECONDS_PER_CHIP));
  const trackStyle = { '--sponsor-duration': durationSeconds + 's' };

  const renderChip = (s, key) => {
    const content = (
      <>
        {s.logoUrl ? (
          <img src={s.logoUrl} alt={s.name ? s.name + ' logo' : ''} className="sponsor-logo-badge sponsor-logo-img" loading="lazy" decoding="async" />
        ) : (
          <span className="sponsor-logo-badge">{(s.name || '?').charAt(0)}</span>
        )}
        {/* Business name intentionally omitted — marquee is logo-only. */}
      </>
    );

    if (s.clickUrl && /^https?:/i.test(s.clickUrl)) {
      return (
        <a
          key={key}
          href={s.clickUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="sponsor-logo"
          title={s.name || ''}
        >
          {content}
        </a>
      );
    }
    if (s.clickUrl && s.clickUrl.startsWith('/')) {
      return (
        <Link key={key} to={s.clickUrl} className="sponsor-logo" title={s.name || ''}>
          {content}
        </Link>
      );
    }
    if (s.profileHandle) {
      return (
        <Link key={key} to={'/profile/' + s.profileHandle} className="sponsor-logo" title={s.name || ''}>
          {content}
        </Link>
      );
    }
    return (
      <div key={key} className="sponsor-logo" title={s.name || ''}>{content}</div>
    );
  };

  const renderGroup = (keyPrefix) => (
    <div className="sponsor-group" aria-hidden={keyPrefix === 'b' ? 'true' : undefined}>
      {expanded.map((s) => renderChip(s, keyPrefix + '-' + s._rep + '-' + s.id))}
    </div>
  );

  return (
    <div className="sponsor-strip">
      <span className="sponsor-label">Sponsors</span>
      <div className="sponsor-marquee" aria-label="Featured sponsors">
        <div className="sponsor-track" style={trackStyle}>
          {renderGroup('a')}
          {renderGroup('b')}
        </div>
      </div>
      <Link to="/sponsor" className="sponsor-cta">Become a Sponsor</Link>
    </div>
  );
}

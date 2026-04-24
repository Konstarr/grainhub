import { useEffect, useState } from 'react';
import { fetchPublicSponsorMedia } from '../../lib/adminDb.js';
import '../../styles/sponsorMarquee.css';

/**
 * SponsorMarquee — horizontally scrolling logo strip of approved sponsor
 * assets from the 'marquee' slot. Ticks left continuously using a pure-CSS
 * animation (no JS per-frame work). Duplicates the list so the loop is
 * seamless.
 *
 * If there are zero approved assets the component renders nothing.
 */
export default function SponsorMarquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchPublicSponsorMedia('marquee');
      if (!cancelled) setItems(data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  // Duplicate so the scroll wraps seamlessly
  const display = [...items, ...items];

  return (
    <section className="spm-wrap" aria-label="Sponsors">
      <div className="spm-inner">
        <div className="spm-track">
          {display.map((a, idx) => {
            const img = (
              <img
                src={a.image_url}
                alt={a.alt_text || a.name}
                className="spm-logo"
                loading="lazy"
                title={a.name}
              />
            );
            return a.click_url ? (
              <a key={a.id + '-' + idx} href={a.click_url} target="_blank" rel="noopener noreferrer" className="spm-item">
                {img}
              </a>
            ) : (
              <div key={a.id + '-' + idx} className="spm-item">{img}</div>
            );
          })}
        </div>
      </div>
      <div className="spm-label">Supported by our sponsors</div>
    </section>
  );
}

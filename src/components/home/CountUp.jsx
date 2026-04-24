import { useEffect, useRef, useState } from 'react';

/**
 * Roll-up counter that:
 *   1. Re-animates whenever `value` changes (so it works with async
 *      data where the prop starts at 0 and becomes the real number).
 *   2. Waits until the element is in the viewport before kicking off
 *      via IntersectionObserver, so a count-up never plays off-screen
 *      and never gets desynced from the user's scroll.
 *   3. Eases out so the last digit lands gracefully.
 *
 * Accepts a numeric `value` (preferred) OR a pre-formatted string
 * like "12.4K" / "3M" / "1,250". The same suffix and grouping is
 * preserved through the animation.
 */
export default function CountUp({ value, duration = 1500 }) {
  const { target, formatFor } = parseTarget(value);
  const [display, setDisplay] = useState(() => formatFor(0));
  const elRef  = useRef(null);
  const rafRef = useRef(null);
  const lastTarget = useRef(null);
  const inViewRef  = useRef(false);

  // ── Visibility gate ──
  useEffect(() => {
    if (!elRef.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for old browsers — just animate on mount.
      inViewRef.current = true;
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            inViewRef.current = true;
            // Trigger re-evaluation once we know we're visible.
            if (lastTarget.current !== target) startAnim();
            obs.disconnect();
          }
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(elRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animate when target changes (and we're visible) ──
  useEffect(() => {
    if (!inViewRef.current) return undefined;
    startAnim();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  function startAnim() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startFrom = lastTarget.current ?? 0;
    const delta     = target - startFrom;
    if (delta === 0) {
      setDisplay(formatFor(target));
      lastTarget.current = target;
      return;
    }
    const t0 = performance.now();
    const tick = (now) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      // Ease out cubic — feels punchy without overshooting.
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startFrom + delta * eased;
      setDisplay(formatFor(current));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(formatFor(target));
        lastTarget.current = target;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  return <span ref={elRef}>{display}</span>;
}

/* ── Helpers ── */

// Accepts either a number or a string like "24,800" / "142K" / "3.6M"
// and returns { target: <number>, formatFor: (n) => string } that
// re-applies the same shape to the animating value.
function parseTarget(input) {
  // Numeric inputs: format with K/M abbreviation when large.
  if (typeof input === 'number' && Number.isFinite(input)) {
    return { target: input, formatFor: (n) => formatNumber(n) };
  }

  const raw = String(input || '').trim();
  const suffixMatch = raw.match(/([KMB])\s*$/i);
  const suffix = suffixMatch ? suffixMatch[1].toUpperCase() : '';
  const numericPart = suffix ? raw.slice(0, -1) : raw;
  const num = Number(numericPart.replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return { target: 0, formatFor: () => raw };
  }
  const multiplier =
    suffix === 'K' ? 1_000 :
    suffix === 'M' ? 1_000_000 :
    suffix === 'B' ? 1_000_000_000 : 1;
  const target = num * multiplier;

  const formatFor = (n) => {
    if (suffix === 'K') {
      const v = n / 1_000;
      return `${v >= 10 ? Math.round(v) : v.toFixed(1)}K`;
    }
    if (suffix === 'M') {
      const v = n / 1_000_000;
      return `${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
    }
    if (suffix === 'B') {
      const v = n / 1_000_000_000;
      return `${v >= 10 ? Math.round(v) : v.toFixed(1)}B`;
    }
    return Math.round(n).toLocaleString('en-US');
  };
  return { target, formatFor };
}

function formatNumber(n) {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}K`;
  }
  return Math.round(n).toLocaleString('en-US');
}

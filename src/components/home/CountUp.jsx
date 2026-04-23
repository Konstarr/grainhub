import { useEffect, useRef, useState } from 'react';

// Parse a formatted string like "24,800", "142K", "3.6M", "890"
// into { value, formatFor } where formatFor(n) re-applies the suffix
// and comma formatting used in the original string.
function parseTarget(str) {
  const raw = String(str || '').trim();
  const suffixMatch = raw.match(/([KMB])\s*$/i);
  const suffix = suffixMatch ? suffixMatch[1].toUpperCase() : '';
  const numericPart = suffix ? raw.slice(0, -1) : raw;
  const num = Number(numericPart.replace(/,/g, ''));
  if (!Number.isFinite(num)) {
    return { value: 0, formatFor: () => raw };
  }

  const multiplier = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : 1;
  const value = num * multiplier;

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

  return { value, formatFor };
}

export default function CountUp({ value, duration = 1800, startFraction = 0.87 }) {
  const { value: target, formatFor } = parseTarget(value);
  const [display, setDisplay] = useState(() => formatFor(target * startFraction));
  const rafRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const start = Math.floor(target * startFraction);
    const delta = target - start;
    const t0 = performance.now();

    const tick = (now) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = start + delta * eased;
      setDisplay(formatFor(current));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(formatFor(target));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{display}</>;
}

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * PriceRangeSlider
 *
 * Dual-handle range slider with paired number inputs. The handles snap
 * to a stepped scale so you can drag from $0 to $100k smoothly without
 * the slider feeling impossibly twitchy. The number inputs accept
 * direct entry for precision and the slider follows along.
 *
 * Props:
 *   minValue / maxValue   string|number  current bounds (empty string =
 *                                          no bound, treated as MIN/MAX)
 *   onChange              ({ priceMin, priceMax }) => void
 *   floor                 number   absolute slider min (default 0)
 *   ceiling               number   absolute slider max (default 100000)
 *   step                  number   slider step (default 250)
 */
const TRACK_HEIGHT = 4;
const HANDLE_SIZE  = 18;

function clamp(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function fmt(n) {
  if (n == null || n === '') return '';
  if (n >= 1000) return '$' + Math.round(n / 100) / 10 + 'k';
  return '$' + n;
}

export default function PriceRangeSlider({
  minValue,
  maxValue,
  onChange,
  floor = 0,
  ceiling = 100000,
  step = 250,
}) {
  // Internal numeric state — strings outside become numbers we drag.
  const min = useMemo(() => {
    const n = Number(minValue);
    return Number.isFinite(n) && minValue !== '' ? clamp(n, floor, ceiling) : floor;
  }, [minValue, floor, ceiling]);

  const max = useMemo(() => {
    const n = Number(maxValue);
    return Number.isFinite(n) && maxValue !== '' ? clamp(n, floor, ceiling) : ceiling;
  }, [maxValue, floor, ceiling]);

  // Local typed state for the two number inputs so they don't
  // overwrite a user's keystrokes mid-typing.
  const [minInput, setMinInput] = useState(minValue || '');
  const [maxInput, setMaxInput] = useState(maxValue || '');

  // Keep local inputs in sync when parent updates (e.g., Clear all).
  const last = useRef({ minValue, maxValue });
  useEffect(() => {
    if (last.current.minValue !== minValue) setMinInput(minValue || '');
    if (last.current.maxValue !== maxValue) setMaxInput(maxValue || '');
    last.current = { minValue, maxValue };
  }, [minValue, maxValue]);

  const pctMin = ((min - floor) / (ceiling - floor)) * 100;
  const pctMax = ((max - floor) / (ceiling - floor)) * 100;

  const emit = (nextMin, nextMax) => {
    // Empty string when the bound is "no bound" (i.e., extremes), so
    // the parent's existing logic that treats '' as unbounded keeps
    // working without changes.
    const minOut = nextMin > floor   ? String(nextMin) : '';
    const maxOut = nextMax < ceiling ? String(nextMax) : '';
    onChange({ priceMin: minOut, priceMax: maxOut });
    setMinInput(minOut);
    setMaxInput(maxOut);
  };

  const handleSliderMin = (e) => {
    const v = Number(e.target.value);
    // Don't let the min cross the max (leave at least one step gap).
    const next = Math.min(v, max - step);
    emit(clamp(next, floor, ceiling), max);
  };
  const handleSliderMax = (e) => {
    const v = Number(e.target.value);
    const next = Math.max(v, min + step);
    emit(min, clamp(next, floor, ceiling));
  };

  const commitMinInput = () => {
    if (minInput === '') { emit(floor, max); return; }
    const n = Math.round(Number(minInput));
    if (!Number.isFinite(n)) { setMinInput(min === floor ? '' : String(min)); return; }
    const cleaned = clamp(n, floor, max - step);
    emit(cleaned, max);
  };
  const commitMaxInput = () => {
    if (maxInput === '') { emit(min, ceiling); return; }
    const n = Math.round(Number(maxInput));
    if (!Number.isFinite(n)) { setMaxInput(max === ceiling ? '' : String(max)); return; }
    const cleaned = clamp(n, min + step, ceiling);
    emit(min, cleaned);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Live range labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--text-secondary, #555)',
        marginBottom: 6,
      }}>
        <span>{min === floor ? 'Any' : fmt(min)}</span>
        <span>{max === ceiling ? fmt(ceiling) + '+' : fmt(max)}</span>
      </div>

      {/* Slider */}
      <div
        style={{
          position: 'relative',
          height: HANDLE_SIZE + 6,
          margin: '0 ' + (HANDLE_SIZE / 2) + 'px',
        }}
      >
        {/* Track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: TRACK_HEIGHT,
          marginTop: -TRACK_HEIGHT / 2,
          background: 'var(--border, #ddd)',
          borderRadius: TRACK_HEIGHT,
        }} />

        {/* Selected fill */}
        <div style={{
          position: 'absolute',
          top: '50%',
          height: TRACK_HEIGHT,
          marginTop: -TRACK_HEIGHT / 2,
          background: 'var(--wood-warm, #2D6A4F)',
          borderRadius: TRACK_HEIGHT,
          left: pctMin + '%',
          right: (100 - pctMax) + '%',
        }} />

        {/* Min handle */}
        <input
          type="range"
          min={floor}
          max={ceiling}
          step={step}
          value={min}
          onChange={handleSliderMin}
          style={rangeStyle({ z: 3 })}
          aria-label="Minimum price"
        />
        {/* Max handle */}
        <input
          type="range"
          min={floor}
          max={ceiling}
          step={step}
          value={max}
          onChange={handleSliderMax}
          style={rangeStyle({ z: 4 })}
          aria-label="Maximum price"
        />
      </div>

      {/* Number inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
      }}>
        <input
          className="price-input"
          type="text"
          inputMode="numeric"
          placeholder="Min $"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={commitMinInput}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitMinInput(); } }}
          style={inputStyle}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>-</span>
        <input
          className="price-input"
          type="text"
          inputMode="numeric"
          placeholder="Max $"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={commitMaxInput}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitMaxInput(); } }}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  minWidth: 0,
  padding: '0.4rem 0.55rem',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

// Two range inputs stacked. We make their tracks transparent and move
// pointer events to the handle only so both handles are draggable
// independently. The native handle is sized via inline ::-webkit-/
// ::-moz- pseudo-element CSS injected once globally below.
function rangeStyle({ z }) {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
    background: 'transparent',
    pointerEvents: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    margin: 0,
    padding: 0,
    outline: 'none',
    zIndex: z,
  };
}

// Inject the handle styles once. These have to live in real CSS rules
// because ::-webkit-slider-thumb and ::-moz-range-thumb cannot be set
// inline. Idempotent.
if (typeof document !== 'undefined' && !document.getElementById('gh-prs-styles')) {
  const css = `
.filter-col input[type=range]::-webkit-slider-thumb,
input[type=range].gh-prs::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  width: ${HANDLE_SIZE}px;
  height: ${HANDLE_SIZE}px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--wood-warm, #2D6A4F);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  cursor: grab;
}
.filter-col input[type=range]::-webkit-slider-thumb:active,
input[type=range].gh-prs::-webkit-slider-thumb:active { cursor: grabbing; }

.filter-col input[type=range]::-moz-range-thumb,
input[type=range].gh-prs::-moz-range-thumb {
  pointer-events: auto;
  width: ${HANDLE_SIZE}px;
  height: ${HANDLE_SIZE}px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--wood-warm, #2D6A4F);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  cursor: grab;
}
.filter-col input[type=range]::-moz-range-track,
input[type=range].gh-prs::-moz-range-track { background: transparent; }
.filter-col input[type=range]::-webkit-slider-runnable-track,
input[type=range].gh-prs::-webkit-slider-runnable-track { background: transparent; }
.filter-col input[type=range]:focus { outline: none; }
.filter-col input[type=range]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.25);
}
.filter-col input[type=range]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.25);
}
`;
  const tag = document.createElement('style');
  tag.id = 'gh-prs-styles';
  tag.textContent = css;
  document.head.appendChild(tag);
}

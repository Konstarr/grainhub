import { useState } from 'react';
import MultiImageUploader from './MultiImageUploader.jsx';
import { geocodeZip, looksLikeZip } from '../../lib/geocode.js';

/**
 * Shared form for /marketplace/new (initial=null) and
 * /marketplace/edit/:id (initial=existing row). Caller decides what to
 * do with the resulting payload via onSubmit.
 *
 * The zip code is geocoded to lat/lng via Nominatim before the payload
 * is handed to the caller, so distance filtering on the public
 * marketplace just reads the stored coordinates and does Haversine.
 */

export const MARKETPLACE_CATEGORIES = [
  'CNC Machinery',
  'Edgebanders',
  'Moulders',
  'Finishing',
  'Stationary Tools',
  'Combination',
  'Hand/Power Tools',
  'Panel Saws',
  'Dust Collection',
  'Lumber',
  'Sheet Goods',
  'Hardware',
  'Sanders',
  'Tooling',
  'Misc',
];

export const MARKETPLACE_CONDITIONS = [
  { value: 'new',            label: 'New' },
  { value: 'used-excellent', label: 'Excellent' },
  { value: 'used-good',      label: 'Good' },
  { value: 'used-fair',      label: 'Fair' },
];

const MARKETPLACE_TRADES = [
  '', 'cabinetmaker', 'millworker', 'finisher', 'woodworker',
  'cnc-operator', 'lumber-supplier', 'shop-owner',
];

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontFamily: 'inherit',
  fontSize: 14,
  background: 'var(--surface)',
  color: 'var(--text-primary)',
};

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--text-primary)',
  marginBottom: 6,
};

const fieldStyle = { marginBottom: '1.1rem' };

export default function MarketplaceListingForm({
  initial = null,
  busy = false,
  submitLabel = 'Publish listing',
  onSubmit,
  onCancel,
  adminExtras = null,
}) {
  const [title, setTitle]             = useState(initial?.title || '');
  const [category, setCategory]       = useState(initial?.category || '');
  const [trade, setTrade]             = useState(initial?.trade || '');
  const [condition, setCondition]     = useState(initial?.condition || 'used-good');
  const [price, setPrice]             = useState(
    initial?.price != null ? String(initial.price) : ''
  );
  const [currency, setCurrency]       = useState(initial?.currency || 'USD');
  const [location, setLocation]       = useState(initial?.location || '');
  const [zipCode, setZipCode]         = useState(initial?.zip_code || initial?.zipCode || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [images, setImages]           = useState(
    Array.isArray(initial?.images) ? initial.images : []
  );

  const [err, setErr] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErr(null);

    if (!title.trim() || title.trim().length < 5) {
      setErr('Title must be at least 5 characters.');
      return;
    }
    if (!category) {
      setErr('Pick a category so buyers can find your listing.');
      return;
    }
    if (!looksLikeZip(zipCode)) {
      setErr('Zip / postal code is required so buyers can filter by distance.');
      return;
    }

    const priceNum = price === '' ? null : Number(price);
    if (price !== '' && (Number.isNaN(priceNum) || priceNum < 0)) {
      setErr('Price must be a positive number, or leave blank.');
      return;
    }

    // Geocode before submit. If the zip can't be resolved we still let
    // the listing through (just without lat/lng) so a quirky postcode
    // doesn't block posting -- distance filters will simply skip it.
    setGeocoding(true);
    let coords = null;
    try {
      // Re-use existing coords when the seller hasn't changed the zip.
      const initialZip = initial?.zip_code || initial?.zipCode || '';
      if (initial && initialZip === zipCode.trim() && initial.latitude != null) {
        coords = { lat: initial.latitude, lng: initial.longitude };
      } else {
        coords = await geocodeZip(zipCode);
      }
    } catch (_) {
      coords = null;
    }
    setGeocoding(false);

    const payload = {
      title: title.trim(),
      category,
      trade: trade || null,
      condition,
      price: priceNum,
      currency: currency || 'USD',
      location: location.trim(),
      zip_code: zipCode.trim(),
      latitude: coords ? coords.lat : null,
      longitude: coords ? coords.lng : null,
      description: description.trim(),
      images: images.slice(0, 15),
    };

    try {
      await onSubmit(payload);
    } catch (e2) {
      setErr(e2?.message || String(e2));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={fieldStyle}>
        <label style={labelStyle}>
          Title <span style={{ color: 'var(--cinnabar)' }}>*</span>
        </label>
        <input
          style={inputStyle}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. SCM Minimax FS41 Combination Jointer/Planer"
          maxLength={200}
          required
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {title.length}/200 - be specific. Brand, model, year, and key specs sell faster.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Category <span style={{ color: 'var(--cinnabar)' }}>*</span>
          </label>
          <select
            style={inputStyle}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Pick a category...</option>
            {MARKETPLACE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Condition</label>
          <select
            style={inputStyle}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {MARKETPLACE_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.9rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Asking price</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Leave blank for OBO / contact for price"
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Currency</label>
          <select
            style={inputStyle}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>City / area</label>
          <input
            style={inputStyle}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Cleveland, OH"
            maxLength={120}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Zip / postal <span style={{ color: 'var(--cinnabar)' }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="44101"
            maxLength={12}
            required
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Trade focus (optional)</label>
          <select
            style={inputStyle}
            value={trade || ''}
            onChange={(e) => setTrade(e.target.value)}
          >
            {MARKETPLACE_TRADES.map((t) => (
              <option key={t || '_'} value={t}>{t || '- None -'}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 160, resize: 'vertical', fontFamily: 'inherit' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Year, hours, included tooling, ship-from city, condition notes, why you're selling..."
          maxLength={4000}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {description.length}/4000
        </span>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Photos</label>
        <MultiImageUploader
          value={images}
          onChange={setImages}
          max={15}
          folder="marketplace"
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>
          The first photo is the cover. Drag to reorder, or click "Set cover".
        </span>
      </div>

      {adminExtras}

      {err && (
        <div style={{
          padding: '0.6rem 0.8rem',
          background: '#fff4f4',
          color: '#9c1f1f',
          border: '1px solid #f3c9c9',
          borderRadius: 8,
          marginBottom: '1rem',
          fontSize: 13,
        }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || geocoding}
            className="act-btn"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={busy || geocoding}
          className="act-btn primary"
        >
          {geocoding ? 'Looking up zip...' : busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

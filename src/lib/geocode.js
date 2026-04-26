/**
 * geocode.js
 *
 * Lightweight zip -> { lat, lng } lookup via the public Nominatim API
 * (OpenStreetMap). No API key, no billing. Polite rate limit: max one
 * outbound request per second.
 *
 * Results are cached to localStorage permanently keyed by the
 * normalized zip + country, so the same zip never gets looked up
 * twice for a user.
 *
 * Returns { lat, lng } on success, or null when the zip cannot be
 * resolved. The function never throws on network failure -- it just
 * resolves to null so the caller can decide how to surface the error.
 */

const CACHE_KEY = 'gh:geocode:v1';
const ENDPOINT  = 'https://nominatim.openstreetmap.org/search';

// Local in-process gate so two simultaneous calls from the same page
// load (e.g. user types fast) don't fire two concurrent Nominatim
// requests. Resolves immediately if no request is already in flight.
let inflight = Promise.resolve();

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveCache(map) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch (_) {
    // localStorage full / disabled / private mode -- silently skip.
  }
}

/**
 * normalize a zip + country into a stable cache key. Trims whitespace,
 * uppercases letters (UK postcodes), strips internal spaces, and
 * defaults country to 'us'.
 */
function cacheKey(zip, country) {
  const z = String(zip || '').trim().toUpperCase().replace(/\s+/g, '');
  const c = (country || 'us').toLowerCase();
  return c + ':' + z;
}

/**
 * Geocode a zip / postal code. country is a 2-letter ISO code; default
 * 'us'. Returns { lat, lng } or null.
 */
export async function geocodeZip(zip, country = 'us') {
  if (!zip || typeof zip !== 'string') return null;
  const trimmed = zip.trim();
  if (trimmed.length < 3) return null;

  const key = cacheKey(trimmed, country);
  const cache = loadCache();
  if (cache[key] === null) return null;                    // negative cache
  if (cache[key]) return cache[key];                       // hit

  // Serialize against any in-flight request so we honor Nominatim's
  // 1 req/sec rate limit without a wall of 429s.
  const run = inflight.then(async () => {
    // 1 second floor between outbound requests.
    await new Promise((res) => setTimeout(res, 1000));
    try {
      const url = ENDPOINT
        + '?postalcode=' + encodeURIComponent(trimmed)
        + '&country=' + encodeURIComponent(country)
        + '&format=json&limit=1';
      const res = await fetch(url, {
        headers: {
          // Nominatim requires a UA. Identify the app so the public
          // service knows who's calling.
          'Accept': 'application/json',
        },
      });
      if (!res.ok) {
        cache[key] = null; saveCache(cache);
        return null;
      }
      const json = await res.json();
      const first = Array.isArray(json) && json[0];
      if (!first || !first.lat || !first.lon) {
        cache[key] = null; saveCache(cache);
        return null;
      }
      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        cache[key] = null; saveCache(cache);
        return null;
      }
      const out = { lat, lng };
      cache[key] = out;
      saveCache(cache);
      return out;
    } catch (_) {
      // Don't poison the cache on transient network failures -- let a
      // future call retry.
      return null;
    }
  });

  inflight = run.catch(() => null);
  return run;
}

/**
 * Haversine distance in miles between two lat/lng pairs.
 */
export function haversineMiles(lat1, lng1, lat2, lng2) {
  if (
    !Number.isFinite(lat1) || !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) || !Number.isFinite(lng2)
  ) {
    return Infinity;
  }
  const R = 3958.8; // earth radius in miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Loose validation -- accepts US 5/9 digit zips and Canadian/UK style
 * postcodes. Used for client-side form validation only.
 */
export function looksLikeZip(s) {
  if (!s) return false;
  const t = String(s).trim();
  if (t.length < 3 || t.length > 12) return false;
  return /^[A-Za-z0-9 \-]+$/.test(t);
}

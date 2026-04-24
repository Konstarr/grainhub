/**
 * Centralized URL validation. ALL user-supplied URLs that the app
 * will render in an <a href>, an <img src>, or a CSS background-image
 * MUST go through one of these helpers first. This is the single
 * place we block javascript:, data:, file:, and other unsafe
 * protocols, and the single place we normalize bare domains to
 * https://.
 */

const SAFE_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];
const SAFE_IMG_PROTOCOLS  = ['http:', 'https:'];

/**
 * Validate an outbound link URL. Returns the cleaned-up URL string
 * if it's safe, or `null` if it isn't. Rejects anything other than
 * http/https/mailto/tel and any bare/relative paths that don't
 * start with `/`.
 *
 * Pass the result through to your <a href> — if you got null, render
 * a span instead, or fall back to a safe default.
 */
export function safeLinkUrl(raw) {
  if (!raw) return null;
  let str = String(raw).trim();
  if (!str) return null;
  // Bare-domain support: "grainhub.com" → "https://grainhub.com"
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(str)) {
    str = 'https://' + str;
  }
  try {
    const u = new URL(str);
    if (!SAFE_LINK_PROTOCOLS.includes(u.protocol)) return null;
    return u.toString();
  } catch (_) {
    return null;
  }
}

/**
 * Validate an image URL specifically. Stricter than `safeLinkUrl`:
 * only http/https are allowed (no mailto, no data: — even though
 * data:image is technically safe, we reject it to keep stored URLs
 * predictable).
 */
export function safeImageUrl(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;
  try {
    const u = new URL(str, window.location.origin);
    if (!SAFE_IMG_PROTOCOLS.includes(u.protocol)) return null;
    return u.toString();
  } catch (_) {
    return null;
  }
}

/**
 * Build a CSS `background-image: url(...)` value safely. Quotes the
 * URL so a path with whitespace or weird characters can't break out
 * of the declaration. Returns null if the URL is unsafe.
 */
export function cssBackgroundImage(raw) {
  const safe = safeImageUrl(raw);
  if (!safe) return null;
  // Escape any embedded double-quotes / parens that would close the
  // CSS url(...) early. Belt + suspenders — URL() should already have
  // escaped most of this.
  const cleaned = safe.replace(/"/g, '%22').replace(/\)/g, '%29');
  return `url("${cleaned}")`;
}

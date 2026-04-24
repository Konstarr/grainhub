import { supabase } from '../../../lib/supabase.js';

/**
 * Upload a single image file to the public `media` bucket under the given
 * folder prefix and return the resulting public URL.
 *
 * Safety:
 *   - MIME must start with image/
 *   - Extension must be on an allowlist mapped from MIME (user-supplied
 *     filename is NEVER used to pick the extension — spoofing "image.php"
 *     with a jpeg payload would still save as .jpeg).
 *   - Filename is a fresh random id; the original filename is discarded
 *     so no path-traversal or unicode-homoglyph attempts survive.
 */
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/svg+xml': 'svg',
};

function randomId() {
  // 16 chars of base36 — effectively collision-free
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export async function uploadInlineImage(file, folder = 'news') {
  if (!file) throw new Error('No file');
  if (!file.type || !file.type.startsWith('image/')) throw new Error('Not an image');
  const ext = MIME_TO_EXT[file.type.toLowerCase()];
  if (!ext) throw new Error('Unsupported image type');
  if (file.size > 50 * 1024 * 1024) throw new Error('Image is too large (max 50 MB)');

  const key = `${folder}/${Date.now()}-${randomId()}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(key, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;

  const { data: pub } = supabase.storage.from('media').getPublicUrl(key);
  return pub?.publicUrl || '';
}

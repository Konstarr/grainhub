import { supabase } from '../../../lib/supabase.js';

/**
 * Upload a single image file to the public `media` bucket under the given
 * folder prefix and return the resulting public URL. Used by the TipTap
 * slash-menu Image command and the drop/paste handler.
 */
export async function uploadInlineImage(file, folder = 'news') {
  if (!file) throw new Error('No file');
  if (!file.type.startsWith('image/')) throw new Error('Not an image');
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is too large (max 8 MB)');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeBase = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${folder}/${Date.now()}-${rand}-${safeBase}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(key, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;

  const { data: pub } = supabase.storage.from('media').getPublicUrl(key);
  return pub?.publicUrl || '';
}

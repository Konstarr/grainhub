# Millwork.io Image Uploads — Supabase Storage Setup

Every image on the site now reads from a URL column in a Supabase table. You upload an image to a public Storage bucket, copy its public URL, and paste that URL into the right column. The site picks it up on the next page load.

## 1. Create the bucket (one-time)

Supabase Dashboard -> Storage -> New bucket

- Name: `media`
- Public bucket: ON (must be checked so images render without signed URLs)
- File size limit: 10 MB is fine

Click Save. You now have a public bucket at
`https://<your-project-ref>.supabase.co/storage/v1/object/public/media/...`

## 2. Recommended folder layout inside the bucket

Organize so you can find stuff later. Click into the bucket and use "Create folder":

```
media/
  suppliers/
  news/
  wiki/
  events/
  marketplace/
  avatars/
```

## 3. Upload, then copy the public URL

Click into the folder, drag a file in, then click the file -> "Copy URL" (make sure it's the public URL, not signed). It looks like:

```
https://xxxxxxxx.supabase.co/storage/v1/object/public/media/suppliers/acme-logo.png
```

## 4. Paste the URL into the correct column

Use the Supabase Table Editor. Find the row, paste the URL into the column listed below.

| Where it shows on the site | Table | Column | Notes |
|---|---|---|---|
| Supplier logo (table + profile + sponsor strip) | `suppliers` | `logo_url` | Falls back to initials badge if empty |
| News article cover (hero + grid + home featured) | `news_articles` | `cover_image_url` | Falls back to gradient if empty |
| Wiki article cover (home grid + wiki index) | `wiki_articles` | `cover_image_url` | Falls back to "W" icon if empty |
| Event card cover | `events` | `cover_image_url` | Falls back to gradient if empty |
| Marketplace listing photos | `marketplace_listings` | `images` (text[]) | JSON array of URLs; first one is the card thumbnail. Example value: `{"https://.../saw1.jpg","https://.../saw2.jpg"}` |
| User avatar (forum posts, author chips) | `profiles` | `avatar_url` | Falls back to initials |

## 5. Re-upload / replace an image

Two options:

1. Upload the new file with the SAME name in the same folder (overwrites). The site will keep working as long as the URL is unchanged.
2. Upload with a new name, copy its URL, paste into the column (replacing the old URL).

Tip: keep filenames URL-safe (lowercase, no spaces, use dashes).

## 6. Bulk paste tip

If you're wiring many rows at once, use the SQL Editor:

```sql
update suppliers
set logo_url = 'https://xxxxxxxx.supabase.co/storage/v1/object/public/media/suppliers/acme.png'
where slug = 'acme';
```

For marketplace listing image arrays:

```sql
update marketplace_listings
set images = array[
  'https://xxxxxxxx.supabase.co/storage/v1/object/public/media/marketplace/saw1.jpg',
  'https://xxxxxxxx.supabase.co/storage/v1/object/public/media/marketplace/saw2.jpg'
]
where slug = 'powermatic-saw-2024';
```

## 7. If an image doesn't load

- Open the URL directly in a new tab. If it 404s, the file isn't there or the bucket isn't public.
- Check the column has the exact URL you copied (no trailing whitespace, no quotes).
- Hard-refresh the page (Cmd/Ctrl+Shift+R) — the browser may have cached the empty state.

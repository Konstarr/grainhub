// Generates supabase/seed.sql from the current static data files.
// Run with: node scripts/gen_seed.mjs > supabase/seed.sql

import { FORUM_GROUPS } from '../src/data/forumsData.js';
import { SUPPLIER_LIST } from '../src/data/suppliersData.js';
import { itemTrade } from '../src/lib/trades.js';

// Postgres string literal: wrap in single quotes, double any internal single quotes.
const q = (v) => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
};

// Postgres text[] literal
const qArr = (arr) => {
  if (!arr || !arr.length) return "'{}'";
  const escaped = arr
    .map((s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"')
    .join(',');
  return "'{" + escaped + "}'::text[]";
};

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Source data has review counts as comma-formatted strings like "1,284".
// Strip commas and cast to int for Postgres.
const toInt = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseInt(String(v).replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

// Rating: "4.9" → numeric. Fallback to null when unparseable.
const toNumeric = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

const out = [];

out.push('-- ============================================================');
out.push('-- GrainHub seed data — generated from src/data/*.js');
out.push('-- Run AFTER schema.sql. Safe to re-run.');
out.push('-- ============================================================');
out.push('');

// forum_groups
out.push('-- forum_groups');
out.push('insert into public.forum_groups (id, name, description, icon, icon_color, display_order) values');
const groupRows = FORUM_GROUPS.map(
  (g, i) =>
    `  (${q(g.id)}, ${q(g.name)}, ${q(g.description)}, ${q(g.icon)}, ${q(g.iconColor)}, ${i})`
);
out.push(groupRows.join(',\n') + '\non conflict (id) do update set');
out.push('  name = excluded.name,');
out.push('  description = excluded.description,');
out.push('  icon = excluded.icon,');
out.push('  icon_color = excluded.icon_color,');
out.push('  display_order = excluded.display_order;');
out.push('');

// forum_categories
out.push('-- forum_categories');
out.push(
  'insert into public.forum_categories (id, group_id, name, description, icon, icon_color, trade, display_order) values'
);
const catRows = [];
let order = 0;
for (const g of FORUM_GROUPS) {
  for (const c of g.categories) {
    const trade = itemTrade(c) || null;
    catRows.push(
      `  (${q(c.id)}, ${q(g.id)}, ${q(c.name)}, ${q(c.description)}, ${q(c.icon)}, ${q(c.iconColor)}, ${q(trade)}, ${order++})`
    );
  }
}
out.push(catRows.join(',\n') + '\non conflict (id) do update set');
out.push('  group_id = excluded.group_id,');
out.push('  name = excluded.name,');
out.push('  description = excluded.description,');
out.push('  icon = excluded.icon,');
out.push('  icon_color = excluded.icon_color,');
out.push('  trade = excluded.trade,');
out.push('  display_order = excluded.display_order;');
out.push('');

// suppliers
out.push('-- suppliers');
out.push(
  'insert into public.suppliers (name, slug, category, trade, logo_initials, description, rating, review_count, badges, is_verified, is_approved) values'
);
const supplierRows = SUPPLIER_LIST.map((s) => {
  const trade = itemTrade(s) || null;
  return `  (${q(s.name)}, ${q(slug(s.name))}, ${q(s.category)}, ${q(trade)}, ${q(s.logo)}, ${q(s.description || '')}, ${toNumeric(s.rating) ?? 'null'}, ${toInt(s.reviews)}, ${qArr(s.badges || [])}, true, true)`;
});
out.push(supplierRows.join(',\n') + '\non conflict (slug) do update set');
out.push('  name = excluded.name,');
out.push('  category = excluded.category,');
out.push('  trade = excluded.trade,');
out.push('  logo_initials = excluded.logo_initials,');
out.push('  description = excluded.description,');
out.push('  rating = excluded.rating,');
out.push('  review_count = excluded.review_count,');
out.push('  badges = excluded.badges;');
out.push('');

out.push('-- ============================================================');
out.push('-- Done.');
out.push('--');
out.push('-- To make yourself an admin after your first signup, run:');
out.push("--   update public.profiles set role = 'admin' where username like 'yourname%';");
out.push('-- ============================================================');

process.stdout.write(out.join('\n') + '\n');

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { getWikiArticle, updateWikiArticle, deleteWikiArticle } from '../../lib/adminDb.js';
import { CLUSTERS } from '../../data/wikiTaxonomy.js';

const TRADES = ['', 'cabinetmaker', 'cabinet-making', 'finisher', 'installer', 'restorer', 'luthier', 'turner', 'carver', 'cooper'];

export default function AdminWikiEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [article, setArticle] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await getWikiArticle(id);
      if (cancelled) return;
      if (error) { setErr(error.message || 'Load failed.'); setLoading(false); return; }
      setArticle(data);
      setForm({
        title: data?.title || '',
        slug: data?.slug || '',
        category: data?.category || (CLUSTERS[0]?.key || ''),
        trade: data?.trade || '',
        excerpt: data?.excerpt || '',
        body: data?.body || '',
        cover_image_url: data?.cover_image_url || '',
        read_time_minutes: data?.read_time_minutes ?? 5,
        is_published: !!data?.is_published,
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true); setErr(''); setMsg('');
    const patch = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category || null,
      trade: form.trade || null,
      excerpt: form.excerpt || null,
      body: form.body || '',
      cover_image_url: form.cover_image_url || null,
      read_time_minutes: form.read_time_minutes ? Number(form.read_time_minutes) : null,
      is_published: !!form.is_published,
    };
    if (form.is_published && !article?.published_at) {
      patch.published_at = new Date().toISOString();
    }
    const { error } = await updateWikiArticle(id, patch);
    setSaving(false);
    if (error) { setErr(error.message || 'Save failed.'); return; }
    setMsg('Saved.');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${article?.title}"? This cannot be undone.`)) return;
    const { error } = await deleteWikiArticle(id);
    if (error) { setErr(error.message || 'Delete failed.'); return; }
    navigate('/admin/wiki');
  };

  if (loading) return <AdminLayout title="Edit article" subtitle="Loading…"><div>Loading…</div></AdminLayout>;
  if (!article) return (
    <AdminLayout title="Article not found" subtitle="That row doesn't exist or was deleted">
      <Link to="/admin/wiki">← Back to all articles</Link>
    </AdminLayout>
  );

  return (
    <AdminLayout
      title={`Edit: ${article.title}`}
      subtitle={(
        <>
          <Link to={`/wiki/article/${form.slug}`} target="_blank" rel="noreferrer">/wiki/article/{form.slug} ↗</Link>
          {' · '}
          {(article.view_count || 0).toLocaleString()} view{article.view_count === 1 ? '' : 's'}
        </>
      )}
      actions={(
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin/wiki" className="claim-btn ghost">← All articles</Link>
          <button type="button" className="claim-btn ghost" style={{ color: '#9B2222' }} onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    >
      <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 920 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <label className="claim-field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </label>
          <label className="claim-field">
            <span>Slug</span>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <label className="claim-field">
            <span>Field (cluster)</span>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {[...CLUSTERS].sort((a, b) => a.key.localeCompare(b.key)).map((c) => (
                <option key={c.key} value={c.key}>{c.key}</option>
              ))}
            </select>
          </label>
          <label className="claim-field">
            <span>Trade</span>
            <select value={form.trade} onChange={(e) => set('trade', e.target.value)}>
              {TRADES.map((t) => <option key={t} value={t}>{t || '— none —'}</option>)}
            </select>
          </label>
          <label className="claim-field">
            <span>Read time (min)</span>
            <input type="number" min="1" max="60"
              value={form.read_time_minutes ?? ''}
              onChange={(e) => set('read_time_minutes', e.target.value)} />
          </label>
        </div>

        <label className="claim-field">
          <span>Excerpt (search-result blurb)</span>
          <textarea rows={2} maxLength={500}
            value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
        </label>

        <label className="claim-field">
          <span>Cover image URL</span>
          <input value={form.cover_image_url} onChange={(e) => set('cover_image_url', e.target.value)} placeholder="https://…" />
        </label>

        <label className="claim-field">
          <span>Body (Markdown or HTML — see <Link to={`/wiki/article/${form.slug}`} target="_blank" rel="noreferrer">live preview</Link>)</span>
          <textarea
            rows={28}
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 13, lineHeight: 1.5 }}
          />
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={!!form.is_published}
            onChange={(e) => set('is_published', e.target.checked)} />
          <span>Published (visible on /wiki)</span>
        </label>

        {err && <div className="claim-error">{err}</div>}
        {msg && <div style={{ color: '#2E6F2E', fontSize: 13 }}>{msg}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link to="/admin/wiki" className="claim-btn ghost">Cancel</Link>
          <button type="submit" className="claim-btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/wikiArticle.css';
import PageBack from '../components/shared/PageBack.jsx';
import { supabase } from '../lib/supabase.js';
import { mapWikiRow } from '../lib/mappers.js';
import { SponsorSidebar } from '../components/sponsors/AdSlot.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { updateWikiArticle } from '../lib/adminDb.js';
import { CLUSTERS } from '../data/wikiTaxonomy.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function ArticleBody({ body }) {
  if (!body) return null;
  const looksLikeHtml = /<\w+[^>]*>/.test(body);
  if (looksLikeHtml) {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => {
          if (href && href.startsWith('/')) {
            return <Link to={href}>{children}</Link>;
          }
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        },
      }}
    >
      {body}
    </ReactMarkdown>
  );
}

export default function WikiArticle() {
  const { slug } = useParams();
  const { isStaff } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------- live-edit state ----------
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTrade, setEditTrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (!slug) { setArticle(null); setLoading(false); return; }
      const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) setArticle(null);
      else {
        setArticle({ ...mapWikiRow(data), id: data.id, view_count: data.view_count || 0 });
        if (data.id) supabase.rpc('record_wiki_view', { article_id_in: data.id });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const title = (editMode ? editTitle : article?.title) || (loading ? 'Loading...' : 'Article not found');

  // Extract H2 headings for the TOC. Supports both markdown and HTML bodies.
  const tocItems = [];
  if (article?.body && !editMode) {
    const looksLikeHtml = /<h2\b/i.test(article.body);
    if (looksLikeHtml) {
      const re = /<h2[^>]*\sid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;
      let m;
      while ((m = re.exec(article.body)) !== null) {
        const id = m[1].trim();
        const label = m[2].replace(/<[^>]+>/g, '').trim();
        if (label && id) tocItems.push({ label, id });
      }
    } else {
      const re = /^##\s+(.+?)$/gm;
      let m;
      while ((m = re.exec(article.body)) !== null) {
        const label = m[1].trim();
        const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        tocItems.push({ label, id });
      }
    }
  }

  // ---------- edit handlers ----------
  const startEdit = () => {
    if (!article) return;
    setEditTitle(article.title || '');
    setEditExcerpt(article.excerpt || '');
    setEditCategory(article.category || '');
    setEditTrade(article.trade || '');
    setSaveError('');
    setEditMode(true);
    // small delay so the editable div is mounted before we focus
    setTimeout(() => bodyRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    if (!saving) {
      setEditMode(false);
      setSaveError('');
    }
  };

  const saveEdit = async () => {
    if (!article) return;
    setSaving(true); setSaveError('');
    const newBody = bodyRef.current?.innerHTML ?? article.body;
    const patch = {
      title: editTitle.trim() || article.title,
      excerpt: editExcerpt.trim() || null,
      category: editCategory || null,
      trade: editTrade || null,
      body: newBody,
    };
    const { data, error } = await updateWikiArticle(article.id, patch);
    setSaving(false);
    if (error) { setSaveError(error.message || 'Save failed.'); return; }
    setArticle((a) => ({
      ...a,
      title: patch.title,
      excerpt: patch.excerpt || '',
      category: patch.category || '',
      trade: patch.trade || '',
      body: newBody,
      updatedAt: data?.updated_at || new Date().toISOString(),
    }));
    setEditMode(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  // contentEditable formatting helpers (execCommand still works in all browsers)
  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    bodyRef.current?.focus();
  };
  const insertHTML = (html) => {
    bodyRef.current?.focus();
    document.execCommand('insertHTML', false, html);
  };
  const promptLink = () => {
    const url = window.prompt('Link URL (paste full URL or /relative path):');
    if (url) exec('createLink', url);
  };
  const insertCallout = () => {
    const sel = window.getSelection();
    const text = (sel?.toString() || '').trim() || 'Note text here…';
    insertHTML(`<aside class="wa-callout"><strong>Note</strong> — ${text}</aside><p><br/></p>`);
  };
  const insertSection = () => {
    const id = 'section-' + Math.random().toString(36).slice(2, 8);
    insertHTML(`<h2 id="${id}">New section</h2><p>Section text…</p>`);
  };
  const insertSubsection = () => {
    insertHTML(`<h3>New subsection</h3><p>Subsection text…</p>`);
  };
  const insertTable = () => {
    insertHTML(
      '<table class="wa-table"><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>' +
      '<tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br/></p>'
    );
  };
  const insertRule = () => insertHTML('<hr/>');

  return (
    <>
      <PageBack
        backTo="/wiki"
        backLabel="Back to Resources"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Resources', to: '/wiki' },
          { label: title },
        ]}
      />

      {editMode && (
        <div className="live-edit-toolbar" role="toolbar" aria-label="Article editor">
          <div className="le-group">
            <button type="button" onClick={() => exec('bold')} title="Bold (Ctrl+B)"><b>B</b></button>
            <button type="button" onClick={() => exec('italic')} title="Italic (Ctrl+I)"><i>I</i></button>
            <button type="button" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
          </div>
          <div className="le-group">
            <button type="button" onClick={insertSection} title="Insert H2 section">+ Section</button>
            <button type="button" onClick={insertSubsection} title="Insert H3 subsection">+ Sub</button>
            <button type="button" onClick={() => exec('formatBlock', 'p')} title="Paragraph">P</button>
          </div>
          <div className="le-group">
            <button type="button" onClick={() => exec('insertUnorderedList')} title="Bullet list">• List</button>
            <button type="button" onClick={() => exec('insertOrderedList')} title="Numbered list">1. List</button>
            <button type="button" onClick={() => exec('formatBlock', 'blockquote')} title="Quote">❝</button>
          </div>
          <div className="le-group">
            <button type="button" onClick={promptLink} title="Insert link">🔗 Link</button>
            <button type="button" onClick={() => exec('unlink')} title="Remove link">✕ Link</button>
            <button type="button" onClick={insertCallout} title="Insert callout box">+ Callout</button>
            <button type="button" onClick={insertTable} title="Insert table">+ Table</button>
            <button type="button" onClick={insertRule} title="Horizontal rule">— HR</button>
          </div>
          <div className="le-group">
            <button type="button" onClick={() => exec('removeFormat')} title="Clear inline formatting">Clear</button>
            <button type="button" onClick={() => exec('undo')} title="Undo">↶</button>
            <button type="button" onClick={() => exec('redo')} title="Redo">↷</button>
          </div>
          <div style={{ flex: 1 }} />
          {saveError && <span className="le-error">{saveError}</span>}
          <button type="button" className="claim-btn ghost" onClick={cancelEdit} disabled={saving}>Cancel</button>
          <button type="button" className="claim-btn primary" onClick={saveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      <div className="wa-wrap">
        <aside className="toc-col">
          <div className="toc-card">
            <div className="toc-header">On this page</div>
            <div className="toc-body">
              <a href="#top" className="toc-item active">Introduction</a>
              {tocItems.map((t) => (
                <a key={t.id} href={'#' + t.id} className="toc-item">{t.label}</a>
              ))}
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-header">Article info</div>
            <div className="stats-body">
              {article?.readTime && (
                <div className="stat-row"><div className="stat-label">Read time</div><div className="stat-val">{article.readTime}</div></div>
              )}
              {article?.publishedAt && (
                <div className="stat-row"><div className="stat-label">Published</div><div className="stat-val">{formatDate(article.publishedAt)}</div></div>
              )}
              {article?.updatedAt && (
                <div className="stat-row"><div className="stat-label">Updated</div><div className="stat-val">{formatDate(article.updatedAt)}</div></div>
              )}
              {article?.trade && !editMode && (
                <div className="stat-row"><div className="stat-label">Trade</div><div className="stat-val">{article.trade}</div></div>
              )}

              {/* Staff-only live edit controls */}
              {isStaff && article && !editMode && (
                <button type="button" className="contrib-btn" onClick={startEdit}>
                  Edit this article
                </button>
              )}
              {isStaff && article && editMode && (
                <>
                  <div className="stat-row" style={{ display: 'block', borderBottom: 0 }}>
                    <div className="stat-label" style={{ marginBottom: 4 }}>Field</div>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      style={{ width: '100%', padding: 6, fontSize: 12, border: '1px solid var(--border-light)', borderRadius: 6 }}
                    >
                      <option value="">— none —</option>
                      {[...CLUSTERS].sort((a, b) => a.key.localeCompare(b.key)).map((c) => (
                        <option key={c.key} value={c.key}>{c.key}</option>
                      ))}
                    </select>
                  </div>
                  <div className="stat-row" style={{ display: 'block' }}>
                    <div className="stat-label" style={{ marginBottom: 4 }}>Trade</div>
                    <input
                      value={editTrade}
                      onChange={(e) => setEditTrade(e.target.value)}
                      placeholder="e.g. cabinetmaker"
                      style={{ width: '100%', padding: 6, fontSize: 12, border: '1px solid var(--border-light)', borderRadius: 6 }}
                    />
                  </div>
                  <button type="button" className="contrib-btn" onClick={saveEdit} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" className="contrib-btn" style={{ background: 'var(--wood-paper)', color: 'var(--text-primary)', marginTop: 6 }} onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                </>
              )}
              {savedFlash && (
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#DDEFD3', color: '#2E6F2E', borderRadius: 6, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                  Saved ✓
                </div>
              )}
            </div>
          </div>

          <SponsorSidebar />
        </aside>

        <article className={'article' + (editMode ? ' is-editing' : '')} id="top">
          {/* Category */}
          {editMode ? (
            <div className="article-category" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ opacity: 0.7 }}>Category:</span>
              <strong>{editCategory || '— none —'}</strong>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
                Use the sidebar to change
              </span>
            </div>
          ) : (
            article?.category && <div className="article-category">{article.category}</div>
          )}

          {/* Title */}
          {editMode ? (
            <input
              className="article-title-edit"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Article title"
              spellCheck="true"
            />
          ) : (
            <h1 className="article-title">{title}</h1>
          )}

          {/* Excerpt / tagline */}
          {editMode ? (
            <textarea
              className="article-tagline-edit"
              value={editExcerpt}
              onChange={(e) => setEditExcerpt(e.target.value)}
              rows={2}
              placeholder="Search-result blurb (optional)"
              spellCheck="true"
            />
          ) : (
            article?.excerpt && <p className="article-tagline">{article.excerpt}</p>
          )}

          <div className="article-meta-bar">
            <div className="meta-item">From <strong>AWI Florida Chapter Wiki</strong>, the community knowledge base</div>
            {article?.updatedAt && <div className="meta-item">Last updated {formatDate(article.updatedAt)}</div>}
            {article?.readTime && <div className="meta-item">{article.readTime}</div>}
            {article?.view_count != null && (
              <div className="meta-item">
                {article.view_count.toLocaleString()} view{article.view_count === 1 ? '' : 's'}
              </div>
            )}
            {editMode && (
              <div className="meta-item" style={{ marginLeft: 'auto', color: '#8C7A35', fontWeight: 600 }}>
                ✎ Editing — changes are not saved until you click Save
              </div>
            )}
          </div>

          <div className="article-body">
            {article && !editMode && (
              <aside className="infobox">
                <div className="infobox-title">{article.title}</div>
                {article.coverImage ? (
                  <div className="infobox-img" style={{ padding: 0 }}>
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', display: 'block', borderRadius: 0 }} />
                  </div>
                ) : (
                  <div className="infobox-img">Article</div>
                )}
                <div className="infobox-body">
                  {article.category && <div className="infobox-row"><div className="infobox-label">Category</div><div className="infobox-value">{article.category}</div></div>}
                  {article.trade && <div className="infobox-row"><div className="infobox-label">Trade</div><div className="infobox-value">{article.trade}</div></div>}
                  {article.readTime && <div className="infobox-row"><div className="infobox-label">Read time</div><div className="infobox-value">{article.readTime}</div></div>}
                  {article.publishedAt && <div className="infobox-row"><div className="infobox-label">Published</div><div className="infobox-value">{formatDate(article.publishedAt)}</div></div>}
                  {article.updatedAt && <div className="infobox-row"><div className="infobox-label">Updated</div><div className="infobox-value">{formatDate(article.updatedAt)}</div></div>}
                </div>
              </aside>
            )}

            {loading && <p style={{ color: 'var(--text-muted)' }}>Loading article...</p>}
            {!loading && !article && (
              <p style={{ color: 'var(--text-muted)' }}>
                We could not find that article. <Link to="/wiki">Back to the Wiki</Link>
              </p>
            )}

            {article && (
              editMode ? (
                <div
                  ref={bodyRef}
                  className="article-body-editable"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck="true"
                  dangerouslySetInnerHTML={{ __html: article.body || '<p>Start writing your article here…</p>' }}
                />
              ) : (
                article.body
                  ? <ArticleBody body={article.body} />
                  : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      This article is a stub. Body content has not been added yet.
                    </p>
              )
            )}

            <div style={{ clear: 'both' }} />
          </div>
        </article>
      </div>
    </>
  );
}

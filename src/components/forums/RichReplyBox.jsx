import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../lib/supabase.js';

const EMOJIS = [
  // common
  '👍', '👎', '❤️', '🔥', '✨', '😂', '😮', '😢', '👏', '🙌',
  '✅', '❌', '⚠️', '💡', '🎯', '🚀', '📌', '🔖', '🔗', '💬',
  // woodworking
  '🪵', '🌲', '🌳', '🪚', '🔨', '🔩', '📏', '📐', '📦', '🏗️',
  '🧰', '🪛', '⚙️', '🛠️', '🧱', '🪑', '🚪', '🏡', '🪞', '🖼️',
];

const TOOLBAR_BTN = {
  background: 'transparent',
  border: 'none',
  padding: '4px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'inherit',
  color: 'var(--text-secondary)',
  lineHeight: 1,
};

function ToolbarButton({ title, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      // Prevent the textarea from losing focus / clearing its
      // selection when the user clicks a toolbar button. Without
      // this, the wrap() helpers see selectionStart=selectionEnd=0
      // because focus moves to the button before our click handler
      // runs.
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      style={TOOLBAR_BTN}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--wood-cream, #f5ead6)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

export default function RichReplyBox({
  value,
  onChange,
  onSubmit,
  disabled,
  quoteSnippet,
  onCancelQuote,
  busy,
  signedIn,
}) {
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const [mode, setMode] = useState('write'); // 'write' | 'preview'
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  if (!signedIn) {
    return (
      <div className="reply-box">
        <div className="reply-box-header">
          <strong>Sign in to reply</strong>
        </div>
        <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Link to="/login" style={{ color: 'var(--wood-warm)' }}>Sign in</Link> or{' '}
          <Link to="/signup" style={{ color: 'var(--wood-warm)' }}>create an account</Link> to join this discussion.
        </div>
      </div>
    );
  }

  // Wrap current selection (or insert placeholder) with prefix/suffix.
  const wrap = (prefix, suffix = prefix, placeholder = 'text') => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || placeholder;
    const after = value.slice(end);
    const next = before + prefix + selected + suffix + after;
    onChange(next);
    // Restore selection around the inserted text.
    requestAnimationFrame(() => {
      ta.focus();
      const pos = before.length + prefix.length;
      ta.setSelectionRange(pos, pos + selected.length);
    });
  };

  // Insert at start of each selected line (for lists, quotes, headings).
  const linePrefix = (prefix) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    // Expand selection to full lines
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const realEnd = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(lineStart, realEnd);
    const lines = block.split('\n');
    const newBlock = lines.map((ln, i) => {
      if (typeof prefix === 'function') return prefix(i) + ln;
      return prefix + ln;
    }).join('\n');
    const next = value.slice(0, lineStart) + newBlock + value.slice(realEnd);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + newBlock.length);
    });
  };

  const insertAtCursor = (text) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const onPickEmoji = (emoji) => {
    insertAtCursor(emoji);
    setEmojiOpen(false);
  };

  const onInsertLink = () => {
    const url = window.prompt('Link URL:', 'https://');
    if (!url) return;
    wrap('[', `](${url})`, 'link text');
  };

  const onUploadClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  // ── File upload safety ───────────────────────────────────
  // Whitelist common safe types only. Executables, scripts, archives,
  // SVGs, and HTML are blocked because they can carry XSS or malware
  // even when uploaded through a trusted UI.
  const ALLOWED_MIME = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain', 'text/csv',
  ]);
  const ALLOWED_EXT = new Set([
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'csv',
  ]);
  // Per-file caps. Images compress reasonably so 5 MB covers any
  // phone photo. Non-images get 8 MB (PDFs / CSVs).
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const MAX_OTHER_BYTES = 8 * 1024 * 1024;

  const onFileChosen = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setUploadErr(null);

    // Validate type (MIME + extension — both must pass to defeat
    // simple "rename file.exe to file.png" tricks).
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME.has(mime) || !ALLOWED_EXT.has(ext)) {
      setUploadErr(
        'Unsupported file type. Allowed: images (JPG / PNG / GIF / WEBP), PDF, TXT, CSV.',
      );
      return;
    }

    // Validate size
    const isImage = mime.startsWith('image/');
    const cap = isImage ? MAX_IMAGE_BYTES : MAX_OTHER_BYTES;
    if (file.size > cap) {
      const capMb = Math.round(cap / (1024 * 1024));
      setUploadErr(
        `File too large. ${isImage ? 'Images' : 'Files'} must be ${capMb} MB or less.`,
      );
      return;
    }

    setUploadBusy(true);
    try {
      const safeBase = (file.name.split('.').slice(0, -1).join('.') || 'upload')
        .replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40);
      const key = `forum/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(key, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('media').getPublicUrl(key);
      const url = pub?.publicUrl;
      if (!url) throw new Error('Could not resolve public URL');
      const isImage = (file.type || '').startsWith('image/');
      const snippet = isImage ? `![${safeBase}](${url})` : `[${file.name}](${url})`;
      insertAtCursor('\n' + snippet + '\n');
    } catch (err) {
      setUploadErr(err.message || 'Upload failed');
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="reply-box" id="reply-box">
      <div className="reply-box-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong>Post a reply</strong>
        <div style={{ display: 'flex', gap: 4, fontSize: 12 }}>
          <button
            type="button"
            onClick={() => setMode('write')}
            style={{
              ...TOOLBAR_BTN,
              fontWeight: mode === 'write' ? 700 : 500,
              color: mode === 'write' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: mode === 'write' ? '2px solid var(--wood-warm)' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            style={{
              ...TOOLBAR_BTN,
              fontWeight: mode === 'preview' ? 700 : 500,
              color: mode === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: mode === 'preview' ? '2px solid var(--wood-warm)' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            Preview
          </button>
        </div>
      </div>

      {quoteSnippet && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--wood-cream)', borderBottom: '1px solid var(--border)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong>Replying to {quoteSnippet.authorName}:</strong>
            <div style={{ fontStyle: 'italic', marginTop: 4, color: 'var(--text-muted)' }}>
              "{(quoteSnippet.body || '').slice(0, 200)}{(quoteSnippet.body || '').length > 200 ? '…' : ''}"
            </div>
          </div>
          <button type="button" onClick={onCancelQuote} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
      )}

      {mode === 'write' && (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            padding: '6px 10px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--wood-cream, #FBF6EC)',
            position: 'relative',
          }}>
            <ToolbarButton title="Bold (Ctrl+B)" onClick={() => wrap('**', '**', 'bold')}>
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton title="Italic (Ctrl+I)" onClick={() => wrap('*', '*', 'italic')}>
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" onClick={() => wrap('~~', '~~', 'strike')}>
              <span style={{ textDecoration: 'line-through' }}>S</span>
            </ToolbarButton>
            <ToolbarButton title="Inline code" onClick={() => wrap('`', '`', 'code')}>
              <span style={{ fontFamily: 'monospace' }}>{'< >'}</span>
            </ToolbarButton>
            <span style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }} />

            <ToolbarButton title="Heading" onClick={() => linePrefix('## ')}>
              H
            </ToolbarButton>
            <ToolbarButton title="Quote" onClick={() => linePrefix('> ')}>
              ❝
            </ToolbarButton>
            <ToolbarButton title="Bulleted list" onClick={() => linePrefix('- ')}>
              •
            </ToolbarButton>
            <ToolbarButton title="Numbered list" onClick={() => linePrefix((i) => (i + 1) + '. ')}>
              1.
            </ToolbarButton>
            <ToolbarButton title="Code block" onClick={() => wrap('\n```\n', '\n```\n', 'code here')}>
              {'{ }'}
            </ToolbarButton>
            <span style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }} />

            <ToolbarButton title="Insert link" onClick={onInsertLink}>
              🔗
            </ToolbarButton>
            <ToolbarButton
              title={uploadBusy ? 'Uploading…' : 'Upload image or file'}
              onClick={onUploadClick}
              disabled={uploadBusy}
            >
              {uploadBusy ? '…' : '📎'}
            </ToolbarButton>
            <input
              ref={fileRef}
              type="file"
              onChange={onFileChosen}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx,.xls,.xlsx"
            />
            <ToolbarButton title="Emoji" onClick={() => setEmojiOpen((v) => !v)}>
              😊
            </ToolbarButton>

            {emojiOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 10,
                background: 'var(--white, #fff)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: 8,
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: 2,
                zIndex: 20,
                maxWidth: 320,
              }}>
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => onPickEmoji(em)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: 18,
                      padding: 4,
                      cursor: 'pointer',
                      borderRadius: 4,
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--wood-cream)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {uploadErr && (
            <div style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#991b1b', borderBottom: '1px solid #fecaca', fontSize: 12 }}>
              Upload failed: {uploadErr}
            </div>
          )}

          <textarea
            ref={taRef}
            className="reply-textarea"
            placeholder="Share your take… use **bold**, *italic*, `code`, or paste images. Markdown supported."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                wrap('**', '**', 'bold');
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                wrap('*', '*', 'italic');
              } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!busy && value.trim()) onSubmit();
              }
            }}
          />
        </>
      )}

      {mode === 'preview' && (
        <div
          className="reply-preview"
          style={{
            padding: '1rem 1.25rem',
            minHeight: 160,
            background: 'var(--white, #fff)',
            borderBottom: '1px solid var(--border)',
            fontSize: 14,
            color: 'var(--text-primary)',
            lineHeight: 1.55,
          }}
        >
          {value.trim() ? (
            <div className="md-body">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Nothing to preview. Switch back to Write and type something.
            </div>
          )}
        </div>
      )}

      <div className="reply-footer">
        <div className="reply-footer-left">
          Markdown supported · Ctrl+Enter to submit · Ctrl+B / Ctrl+I for formatting
        </div>
        <div className="reply-footer-right">
          <button
            type="button"
            className="act-btn primary"
            onClick={onSubmit}
            disabled={disabled || busy || !value.trim()}
          >
            {busy ? 'Posting…' : 'Post reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

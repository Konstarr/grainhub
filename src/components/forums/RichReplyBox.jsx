import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { supabase } from '../../lib/supabase.js';
import { safeLinkUrl } from '../../lib/urlSafety.js';

const EMOJIS = [
  '👍', '👎', '❤️', '🔥', '✨', '😂', '😮', '😢', '👏', '🙌',
  '✅', '❌', '⚠️', '💡', '🎯', '🚀', '📌', '🔖', '🔗', '💬',
  '🪵', '🌲', '🌳', '🪚', '🔨', '🔩', '📏', '📐', '📦', '🏗️',
  '🧰', '🪛', '⚙️', '🛠️', '🧱', '🪑', '🚪', '🏡', '🪞', '🖼️',
];

const TBTN = {
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
const TBTN_ACTIVE = {
  ...TBTN,
  background: 'var(--wood-warm)',
  color: '#fff',
};

function ToolbarButton({ title, onClick, children, active, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      style={active ? TBTN_ACTIVE : TBTN}
      onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = 'var(--wood-cream, #f5ead6)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
]);
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'csv']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_OTHER_BYTES = 8 * 1024 * 1024;

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
  const fileRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'reply-codeblock' } } }),
      LinkExt.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      ImageExt,
      Placeholder.configure({ placeholder: 'Type your reply…' }),
      Markdown.configure({ html: false, breaks: true, transformPastedText: true }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'reply-editor',
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          if (!busy && editor && editor.storage.markdown.getMarkdown().trim()) onSubmit();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
  });

  // If parent value changes externally (cleared after submit, quote
  // inserted, etc.) and the editor's serialized output is different,
  // reset the editor content to match.
  useEffect(() => {
    if (!editor) return;
    const current = editor.storage.markdown.getMarkdown();
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    if (editor.options.editable === !disabled) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

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

  const focus = () => editor?.chain().focus();

  const insertText = (text) => {
    if (!editor) return;
    editor.chain().focus().insertContent(text).run();
  };

  const onPickEmoji = (em) => {
    insertText(em);
    setEmojiOpen(false);
  };

  const onInsertLink = () => {
    const raw = window.prompt('Link URL:', 'https://');
    if (!raw) return;
    const safe = safeLinkUrl(raw);
    if (!safe) {
      alert('That URL isn\'t allowed. Only http://, https://, mailto:, and tel: links are accepted.');
      return;
    }
    if (safe.length > 2000) {
      alert('Link URL is too long (max 2000 characters).');
      return;
    }
    if (editor.state.selection.empty) {
      // No selection — insert "[link text](url)" placeholder
      editor.chain().focus().insertContent(`[link text](${safe})`).run();
    } else {
      editor.chain().focus().setLink({ href: safe }).run();
    }
  };

  const onUploadClick = () => fileRef.current?.click();

  const onFileChosen = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploadErr(null);

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME.has(mime) || !ALLOWED_EXT.has(ext)) {
      setUploadErr('Unsupported file type. Allowed: images (JPG / PNG / GIF / WEBP), PDF, TXT, CSV.');
      return;
    }
    const isImage = mime.startsWith('image/');
    const cap = isImage ? MAX_IMAGE_BYTES : MAX_OTHER_BYTES;
    if (file.size > cap) {
      const capMb = Math.round(cap / (1024 * 1024));
      setUploadErr(`File too large. ${isImage ? 'Images' : 'Files'} must be ${capMb} MB or less.`);
      return;
    }

    setUploadBusy(true);
    try {
      const safeBase = (file.name.split('.').slice(0, -1).join('.') || 'upload')
        .replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40);
      const key = `forum/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(key, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('media').getPublicUrl(key);
      const url = pub?.publicUrl;
      if (!url) throw new Error('Could not resolve public URL');
      if (isImage) {
        editor.chain().focus().setImage({ src: url, alt: safeBase }).run();
      } else {
        editor.chain().focus().insertContent(`[${file.name}](${url})`).run();
      }
    } catch (err) {
      setUploadErr(err.message || 'Upload failed');
    } finally {
      setUploadBusy(false);
    }
  };

  const isActive = (name, attrs) => editor?.isActive(name, attrs);
  const hasContent = () => editor?.storage.markdown.getMarkdown().trim().length > 0;

  return (
    <div className="reply-box" id="reply-box">
      <div className="reply-box-header">
        <strong>Post a reply</strong>
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

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--wood-cream, #FBF6EC)',
        position: 'relative',
      }}>
        <ToolbarButton title="Bold (Ctrl+B)" active={isActive('bold')} onClick={() => focus()?.toggleBold().run()}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={isActive('italic')} onClick={() => focus()?.toggleItalic().run()}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={isActive('strike')} onClick={() => focus()?.toggleStrike().run()}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarButton>
        <ToolbarButton title="Inline code" active={isActive('code')} onClick={() => focus()?.toggleCode().run()}>
          <span style={{ fontFamily: 'monospace' }}>{'< >'}</span>
        </ToolbarButton>
        <span style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }} />

        <ToolbarButton title="Heading" active={isActive('heading', { level: 2 })} onClick={() => focus()?.toggleHeading({ level: 2 }).run()}>
          H
        </ToolbarButton>
        <ToolbarButton title="Quote" active={isActive('blockquote')} onClick={() => focus()?.toggleBlockquote().run()}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Bulleted list" active={isActive('bulletList')} onClick={() => focus()?.toggleBulletList().run()}>
          •
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={isActive('orderedList')} onClick={() => focus()?.toggleOrderedList().run()}>
          1.
        </ToolbarButton>
        <ToolbarButton title="Code block" active={isActive('codeBlock')} onClick={() => focus()?.toggleCodeBlock().run()}>
          {'{ }'}
        </ToolbarButton>
        <span style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }} />

        <ToolbarButton title="Insert link" onClick={onInsertLink}>🔗</ToolbarButton>
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
          accept="image/*,.pdf,.txt,.csv"
        />
        <ToolbarButton title="Emoji" onClick={() => setEmojiOpen((v) => !v)}>😊</ToolbarButton>

        {emojiOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 10,
            background: 'var(--white, #fff)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            padding: 8, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 2, zIndex: 20, maxWidth: 320,
          }}>
            {EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => onPickEmoji(em)}
                style={{ background: 'transparent', border: 'none', fontSize: 18, padding: 4, cursor: 'pointer', borderRadius: 4, lineHeight: 1 }}
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

      <div className="reply-editor-shell">
        <EditorContent editor={editor} />
      </div>

      <div className="reply-footer">
        <div className="reply-footer-left">
          Ctrl+Enter to submit · Ctrl+B / Ctrl+I for formatting
        </div>
        <div className="reply-footer-right">
          <button
            type="button"
            className="act-btn primary"
            onClick={onSubmit}
            disabled={disabled || busy || !hasContent()}
          >
            {busy ? 'Posting…' : 'Post reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

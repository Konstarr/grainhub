import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { marked } from 'marked';
import Callout from './Callout.js';
import { uploadInlineImage } from './uploadInlineImage.js';

/**
 * BlockEditor — a Notion-style rich editor powered by TipTap.
 *
 * Features:
 *   • Persistent toolbar (H1/H2/H3, bold, italic, strike, code, lists,
 *     blockquote, link, divider, image upload, info/warning/tip/note callouts)
 *   • Slash menu — type "/" to open an inline block inserter
 *   • Floating bubble menu on text selection (bold/italic/strike/link/code)
 *   • Drag + drop images into the canvas — they upload to Supabase Storage
 *     under `{folder}/…` and are inserted inline.
 *
 * Content format: HTML (what TipTap emits). If `value` on load looks like
 * markdown (no leading '<'), it's converted via `marked` as a one-time
 * migration so existing articles still open cleanly.
 *
 * Props:
 *   value      — current HTML string (or legacy markdown)
 *   onChange   — (html: string) => void, called as the user edits
 *   folder     — storage prefix for inline image uploads (default 'news')
 *   placeholder— hint text when the editor is empty
 */
export default function BlockEditor({
  value = '',
  onChange,
  folder = 'news',
  placeholder = "Start writing — press '/' to insert blocks",
}) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const rootRef = useRef(null);

  const initialContent = normalizeInput(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'gh-pre' } },
        horizontalRule: { HTMLAttributes: { class: 'gh-hr' } },
      }),
      Image.configure({ HTMLAttributes: { class: 'gh-img' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'gh-link', target: '_blank', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder }),
      Callout,
    ],
    content: initialContent,
    onUpdate: ({ editor: ed }) => {
      if (onChange) onChange(ed.getHTML());
    },
  });

  // If the parent resets value (e.g. loads a different article), sync it in.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = normalizeInput(value);
    if (incoming && current !== incoming && current === '<p></p>') {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  // Slash menu: listen for key events after "/" at the start of a line
  useEffect(() => {
    if (!editor) return;
    const handleKeyUp = () => {
      const { state } = editor;
      const { $from } = state.selection;
      const lineText = $from.parent.textContent || '';
      const match = /\/([\w]*)$/.exec(lineText);
      if (match) {
        setSlashQuery(match[1] || '');
        const rect = editor.view.coordsAtPos(state.selection.from);
        const rootRect = rootRef.current?.getBoundingClientRect();
        if (rootRect) {
          setSlashPos({
            top: rect.bottom - rootRect.top + 4,
            left: rect.left - rootRect.left,
          });
        }
        setSlashOpen(true);
      } else {
        setSlashOpen(false);
      }
    };
    editor.on('selectionUpdate', handleKeyUp);
    editor.on('update', handleKeyUp);
    return () => {
      editor.off('selectionUpdate', handleKeyUp);
      editor.off('update', handleKeyUp);
    };
  }, [editor]);

  // Drag + drop: upload image files to Supabase when dropped anywhere in the editor
  useEffect(() => {
    if (!editor) return;
    const el = editor.view.dom;
    const onDrop = async (e) => {
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;
      e.preventDefault();
      setUploading(true);
      try {
        for (const f of files) {
          const url = await uploadInlineImage(f, folder);
          editor.chain().focus().setImage({ src: url, alt: f.name }).run();
        }
      } catch (err) {
        alert('Image upload failed: ' + (err.message || 'unknown'));
      } finally {
        setUploading(false);
      }
    };
    el.addEventListener('drop', onDrop);
    return () => el.removeEventListener('drop', onDrop);
  }, [editor, folder]);

  if (!editor) return null;

  // --- Toolbar actions ---
  const setHeading = (level) => editor.chain().focus().toggleHeading({ level }).run();
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const insertDivider = () => editor.chain().focus().setHorizontalRule().run();

  const insertLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const insertCallout = (kind) => {
    editor.chain().focus().setCallout(kind).run();
  };

  const triggerImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadInlineImage(file, folder);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (err) {
        alert('Image upload failed: ' + (err.message || 'unknown'));
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const clearSlashTrigger = () => {
    // remove the "/query" text the user typed to open the menu
    const { state } = editor;
    const { $from } = state.selection;
    const lineText = $from.parent.textContent || '';
    const match = /\/([\w]*)$/.exec(lineText);
    if (!match) return;
    const from = state.selection.from - match[0].length;
    editor.chain().focus().setTextSelection({ from, to: state.selection.from }).deleteSelection().run();
  };

  const runSlash = (fn) => {
    setSlashOpen(false);
    clearSlashTrigger();
    fn();
  };

  const SLASH_ITEMS = [
    { key: 'h1',       label: 'Heading 1',     desc: 'Big section title',         run: () => runSlash(() => setHeading(1)) },
    { key: 'h2',       label: 'Heading 2',     desc: 'Medium section title',      run: () => runSlash(() => setHeading(2)) },
    { key: 'h3',       label: 'Heading 3',     desc: 'Small section title',       run: () => runSlash(() => setHeading(3)) },
    { key: 'bullet',   label: 'Bulleted list', desc: 'Unordered list',            run: () => runSlash(() => toggleBulletList()) },
    { key: 'ordered',  label: 'Numbered list', desc: 'Ordered list',              run: () => runSlash(() => toggleOrderedList()) },
    { key: 'quote',    label: 'Quote',         desc: 'Block quotation',           run: () => runSlash(() => toggleBlockquote()) },
    { key: 'divider',  label: 'Divider',       desc: 'Horizontal line',           run: () => runSlash(() => insertDivider()) },
    { key: 'image',    label: 'Image',         desc: 'Upload or paste an image',  run: () => runSlash(() => triggerImagePick()) },
    { key: 'code',     label: 'Code block',    desc: 'Formatted code',            run: () => runSlash(() => editor.chain().focus().toggleCodeBlock().run()) },
    { key: 'info',     label: 'Info callout',  desc: 'Blue callout box',          run: () => runSlash(() => insertCallout('info')) },
    { key: 'warning',  label: 'Warning',       desc: 'Red/amber warning box',     run: () => runSlash(() => insertCallout('warning')) },
    { key: 'tip',      label: 'Tip',           desc: 'Green tip box',             run: () => runSlash(() => insertCallout('tip')) },
    { key: 'note',     label: 'Note',          desc: 'Neutral note box',          run: () => runSlash(() => insertCallout('note')) },
  ];

  const q = slashQuery.toLowerCase();
  const filtered = q
    ? SLASH_ITEMS.filter((i) => i.key.includes(q) || i.label.toLowerCase().includes(q))
    : SLASH_ITEMS;

  return (
    <div ref={rootRef} className="gh-editor-root" style={{ position: 'relative' }}>
      <Toolbar
        editor={editor}
        onImage={triggerImagePick}
        onLink={insertLink}
        onCallout={insertCallout}
        onDivider={insertDivider}
        uploading={uploading}
      />

      <EditorContent editor={editor} className="gh-editor" />

      {slashOpen && filtered.length > 0 && (
        <div
          className="gh-slash"
          style={{ position: 'absolute', top: slashPos.top, left: slashPos.left }}
        >
          <div className="gh-slash-head">Insert block</div>
          {filtered.map((item) => (
            <button
              key={item.key}
              type="button"
              className="gh-slash-item"
              onClick={item.run}
            >
              <div className="gh-slash-label">{item.label}</div>
              <div className="gh-slash-desc">{item.desc}</div>
            </button>
          ))}
        </div>
      )}

      {uploading && (
        <div className="gh-editor-uploading">Uploading image…</div>
      )}
    </div>
  );
}

function Toolbar({ editor, onImage, onLink, onCallout, onDivider, uploading }) {
  const btn = (label, cb, active = false, title = '') => (
    <button
      type="button"
      onClick={cb}
      title={title || label}
      className={'gh-tb-btn ' + (active ? 'active' : '')}
    >
      {label}
    </button>
  );
  return (
    <div className="gh-toolbar">
      {btn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'Heading 1')}
      {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2')}
      {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3')}
      <span className="gh-tb-sep" />
      {btn('B', () => editor.chain().focus().toggleBold().run(),    editor.isActive('bold'),    'Bold')}
      {btn('I', () => editor.chain().focus().toggleItalic().run(),  editor.isActive('italic'),  'Italic')}
      {btn('S', () => editor.chain().focus().toggleStrike().run(),  editor.isActive('strike'),  'Strike')}
      {btn('<>', () => editor.chain().focus().toggleCode().run(),   editor.isActive('code'),    'Inline code')}
      <span className="gh-tb-sep" />
      {btn('•', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bulleted list')}
      {btn('1.', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Numbered list')}
      {btn('“”', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Quote')}
      {btn('{ }', () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), 'Code block')}
      <span className="gh-tb-sep" />
      {btn('🔗', onLink, editor.isActive('link'), 'Link')}
      {btn('—', onDivider, false, 'Divider')}
      {btn('🖼 Image', onImage, false, 'Upload image')}
      <span className="gh-tb-sep" />
      {btn('ℹ Info',    () => onCallout('info'),    editor.isActive('callout', { kind: 'info' }),    'Info callout')}
      {btn('⚠ Warn',    () => onCallout('warning'), editor.isActive('callout', { kind: 'warning' }), 'Warning callout')}
      {btn('✓ Tip',     () => onCallout('tip'),     editor.isActive('callout', { kind: 'tip' }),     'Tip callout')}
      {btn('📝 Note',   () => onCallout('note'),    editor.isActive('callout', { kind: 'note' }),    'Note callout')}
      {uploading && <span className="gh-tb-loading">Uploading…</span>}
    </div>
  );
}

function BubbleBtn({ label, onClick, active, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={'gh-bubble-btn ' + (active ? 'active' : '')}
      style={style}
    >
      {label}
    </button>
  );
}

function normalizeInput(value) {
  if (!value) return '';
  const v = String(value).trim();
  if (!v) return '';
  if (v.startsWith('<')) return v;            // already HTML
  try { return marked.parse(v); } catch { return v; }  // legacy markdown
}

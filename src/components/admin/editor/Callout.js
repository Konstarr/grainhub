import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Callout — a block-level node that wraps content in a colored box.
 * Attributes: kind = 'info' | 'warning' | 'tip' | 'note'
 *
 * HTML representation:
 *   <aside class="gh-callout gh-callout-info" data-kind="info">content</aside>
 *
 * Usage in the editor: slash menu ("/info", "/warning", "/tip", "/note")
 * inserts one of these wrapping the current selection.
 */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'info',
        parseHTML: (el) => el.getAttribute('data-kind') || 'info',
        renderHTML: (attrs) => ({ 'data-kind': attrs.kind }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside[data-kind]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const kind = HTMLAttributes['data-kind'] || 'info';
    return [
      'aside',
      mergeAttributes(
        { class: 'gh-callout gh-callout-' + kind },
        HTMLAttributes
      ),
      0, // content
    ];
  },

  addCommands() {
    return {
      setCallout:
        (kind = 'info') =>
        ({ commands }) =>
          commands.wrapIn(this.name, { kind }),
      toggleCallout:
        (kind = 'info') =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { kind }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

export default Callout;

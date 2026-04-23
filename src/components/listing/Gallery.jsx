import { useState } from 'react';

export default function Gallery() {
  const [activeThumb, setActiveThumb] = useState(0);

  const thumbs = [
    { id: 0, class: 'gt-1', emoji: '🖥️' },
    { id: 1, class: 'gt-2', emoji: '⚙️' },
    { id: 2, class: 'gt-3', emoji: '🔧' },
    { id: 3, class: 'gt-4', emoji: '📋' },
    { id: 4, class: 'gt-5', emoji: '📐' },
  ];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <div className="gallery-badges">
          <span className="gallery-badge gb-featured">⭐ Featured Listing</span>
          <span className="gallery-badge gb-cond">Excellent Condition</span>
        </div>
        <span style={{ position: 'relative', zIndex: 1 }}>🖥️</span>
        <div className="gallery-zoom">🔍 Tap to zoom</div>
      </div>
      <div className="gallery-thumbs">
        {thumbs.map((thumb) => (
          <div
            key={thumb.id}
            className={`gallery-thumb ${thumb.class} ${activeThumb === thumb.id ? 'active' : ''}`}
            onClick={() => setActiveThumb(thumb.id)}
          >
            {thumb.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

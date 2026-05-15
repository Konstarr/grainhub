import { useEffect, useState } from 'react';

export default function Gallery({ listing }) {
  const images = (listing && Array.isArray(listing.images)) ? listing.images : [];
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [listing && listing.id]);

  if (images.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery-main" style={{ background: 'linear-gradient(135deg,#1B3A2E,#4B5563)' }}>
          <div className="gallery-badges">
            {listing && listing.condition && (
              <span className="gallery-badge gb-cond">{listing.condition}</span>
            )}
          </div>
          <span style={{ position: 'relative', zIndex: 1, fontSize: '64px' }}>📦</span>
          <div className="gallery-zoom">No photos uploaded yet</div>
        </div>
      </div>
    );
  }

  const activeUrl = images[active] || images[0];
  return (
    <div className="gallery">
      <div
        className="gallery-main"
        style={{ background: 'url("' + activeUrl + '") center/cover no-repeat, #1B3A2E' }}
      >
        <div className="gallery-badges">
          {listing && listing.condition && (
            <span className="gallery-badge gb-cond">{listing.condition}</span>
          )}
        </div>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((url, idx) => (
            <div
              key={url + '-' + idx}
              className={'gallery-thumb ' + (active === idx ? 'active' : '')}
              onClick={() => setActive(idx)}
              style={{ background: 'url("' + url + '") center/cover no-repeat' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

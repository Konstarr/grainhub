import { useState } from 'react';

export default function ReplyBox({ data }) {
  const [content, setContent] = useState('');

  return (
    <div className="reply-box">
      <div className="reply-box-header">{data.header}</div>

      <div className="reply-toolbar">
        {data.toolButtons.map((btn, idx) => {
          const prevIsSeparator = idx > 0 && data.toolButtons[idx - 1].isSeparator;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              {prevIsSeparator && <div className="tool-sep"></div>}
              <button className="tool-btn" title={btn.title}>
                {btn.icon}
              </button>
            </div>
          );
        })}
      </div>

      <textarea
        className="reply-textarea"
        placeholder={data.placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="reply-footer">
        <span className="reply-footer-left">{data.footerLeft}</span>
        <div className="reply-footer-right">
          <button className="act-btn">Preview</button>
          <button className="act-btn primary">Post Reply →</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function Post({ post }) {
  const [voted, setVoted] = useState(post.voted);

  return (
    <div className={`post ${post.type === 'op' ? 'op' : ''} ${post.type === 'best' ? 'best' : ''}`}>
      <div className="post-inner">
        {/* VOTE COLUMN */}
        <div className="vote-col">
          <button
            className={`vote-btn ${voted ? 'voted' : ''}`}
            onClick={() => setVoted(true)}
          >
            ▲
          </button>
          <div className="vote-count">{post.votes}</div>
          <button className="vote-btn">▼</button>
        </div>

        {/* USER COLUMN */}
        <div className="user-col">
          <div className={`user-avatar ${post.author.avatarClass}`}>
            {post.author.initials}
          </div>
          <div className="user-name">{post.author.name}</div>
          <div className="user-title">{post.author.title}</div>
          <div className="user-rep">{post.author.rep}</div>
          <div className="user-badges">
            {post.author.badges.map((badge, idx) => (
              <span key={idx} className="badge" title={badge.title}>
                {badge.emoji}
              </span>
            ))}
          </div>
          <div className="post-count">{post.author.postCount}</div>
        </div>

        {/* POST BODY */}
        <div className="post-body">
          <div className="post-header">
            <span className="post-num">#{post.number}</span>
            {post.type === 'op' && <span className="post-op-badge">OP</span>}
            <span>{post.timestamp}</span>
            {post.type === 'best' && <span className="best-badge">✓ Best Answer</span>}
          </div>

          {post.quote && (
            <div className="post-quote">
              <div className="post-quote-author">Originally posted by {post.quote.author}:</div>
              {post.quote.text}
            </div>
          )}

          <div className="post-text" dangerouslySetInnerHTML={{ __html: post.body }} />

          {post.image && (
            <div className="post-image-block">
              <div className="post-image-thumb">{post.image.emoji}</div>
              <div className="post-image-info">
                <strong>{post.image.title}</strong>
                {post.image.desc} &nbsp;·&nbsp; {post.image.size} &nbsp;·&nbsp; {post.image.action}
              </div>
            </div>
          )}

          <div className="post-footer">
            <button className="post-action">💬 Quote</button>
            <button className="post-action">↩ Reply</button>
            <button className={`post-action ${voted ? 'liked' : ''}`}>
              👍 Thank ({post.votes})
            </button>
            <div className="post-footer-spacer"></div>
            <span className="post-report">Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { useSupabaseList } from '../../hooks/useSupabaseList.js';
import { mapThreadRow } from '../../lib/mappers.js';

const AV_COLORS = ['av-a', 'av-b', 'av-c', 'av-d', 'av-e'];

export default function ForumSection() {
  const { data: rows } = useSupabaseList('forum_threads', {
    order: { column: 'last_reply_at', ascending: false },
    limit: 5,
  });

  const posts = rows.map((r) => {
    const t = mapThreadRow(r);
    const initials = (t.title || '??').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'MW';
    const s = t.slug || '';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    const avatarColor = AV_COLORS[Math.abs(h) % AV_COLORS.length];
    const statusTag = t.isPinned
      ? { label: 'Pinned', variant: 'pinned' }
      : (t.isSolved ? { label: 'Solved', variant: 'solved' } : null);
    return { ...t, avatar: initials, avatarColor, statusTag };
  });

  return (
    <div className="forum-section">
      <SectionHeader title="Forum Discussions" linkLabel="All forums" linkTo="/forums" />

      {posts.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)' }}>
          No forum threads yet.
        </div>
      ) : (
        <div className="forum-posts">
          {posts.map((post) => (
            <Link key={post.id} to={post.slug ? `/forums/thread/${post.slug}` : '/forums/thread'} className="forum-post">
              <div className={`forum-avatar ${post.avatarColor}`}>{post.avatar}</div>
              <div className="forum-post-body">
                <div className="forum-post-title">{post.title}</div>
                <div className="forum-post-meta">{post.lastReplyAgo}</div>
              </div>
              <div className="forum-stats">
                <div className="forum-stat">
                  <span className="forum-stat-num">{post.replyCount}</span>replies
                </div>
                <div className="forum-stat">
                  <span className="forum-stat-num">{post.viewCount}</span>views
                </div>
              </div>
              {post.statusTag && (
                <span className={`forum-post-tag ${post.statusTag.variant}`}>
                  {post.statusTag.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

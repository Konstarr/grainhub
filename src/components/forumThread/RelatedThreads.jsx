import { Link } from 'react-router-dom';

export default function RelatedThreads({ threads }) {
  return (
    <div className="rs-card">
      <div className="rs-header">Related Threads</div>
      <div className="rs-body">
        {threads.map((thread, idx) => (
          <Link key={idx} to="/forums/thread" className="related-thread" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="rt-title">{thread.title}</div>
            <div className="rt-meta">{thread.meta}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

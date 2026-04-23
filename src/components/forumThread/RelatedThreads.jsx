export default function RelatedThreads({ threads }) {
  return (
    <div className="rs-card">
      <div className="rs-header">Related Threads</div>
      <div className="rs-body">
        {threads.map((thread, idx) => (
          <div key={idx} className="related-thread">
            <div className="rt-title">{thread.title}</div>
            <div className="rt-meta">{thread.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

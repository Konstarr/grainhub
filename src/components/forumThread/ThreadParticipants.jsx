export default function ThreadParticipants({ participants, moreCount }) {
  return (
    <div className="rs-card">
      <div className="rs-header">Thread Participants</div>
      <div className="rs-body">
        <div className="participants">
          {participants.map((p, idx) => (
            <div key={idx} className="participant">
              <div className={`p-avatar ${p.avatarClass}`}>{p.initials}</div>
              <div>
                <div className="p-name">
                  {p.name}
                  {p.isOP && <span className="p-op">OP</span>}
                </div>
                <div className="p-posts">
                  {p.postCount}
                  {p.isBestAnswer && <span className="p-best"> · ✓ Best answer</span>}
                </div>
              </div>
            </div>
          ))}
          {moreCount > 0 && (
            <div className="more-participants">+{moreCount} more participants</div>
          )}
        </div>
      </div>
    </div>
  );
}

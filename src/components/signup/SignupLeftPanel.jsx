import { SIGNUP_PERKS, SIGNUP_PROOF_AVATARS } from '../../data/signupData.js';

export default function SignupLeftPanel() {
  return (
    <div className="signup-left-panel">
      <div className="signup-left-eyebrow">
        <div className="signup-eyebrow-dot"></div>
        312 professionals online right now
      </div>

      <h1>
        Join the <em>AWI Florida</em><br />Chapter.
      </h1>

      <p className="signup-left-sub">
        24,800 cabinet makers, CNC operators, estimators, and shop owners. One place for everything — forums, wiki, news, marketplace, jobs, and suppliers.
      </p>

      <div className="signup-perks">
        {SIGNUP_PERKS.map((perk) => (
          <div key={perk.title} className="signup-perk">
            <div className={`signup-perk-icon signup-${perk.iconColor}`}>
              {perk.icon}
            </div>
            <div>
              <div className="signup-perk-title">{perk.title}</div>
              <div className="signup-perk-desc">{perk.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="signup-proof-strip">
        <div className="signup-proof-avatars">
          {SIGNUP_PROOF_AVATARS.map((av) => (
            <div key={av.initials} className="signup-proof-av" style={{ background: av.bg }}>
              {av.initials}
            </div>
          ))}
        </div>
        <div className="signup-proof-text">
          <strong>24,800 members</strong> have already joined.<br />
          Free forever. No credit card needed.
        </div>
      </div>
    </div>
  );
}

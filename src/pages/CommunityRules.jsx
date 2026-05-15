import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /community-rules — Forum & community conduct rules for the
 * AWI Florida Chapter site. Trade-friendly, professional, firm.
 */
export default function CommunityRules() {
  useDocumentTitle('Forum & Community Rules');
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-eyebrow">Community</div>
          <h1>Forum & Community Rules</h1>
          <p className="legal-sub">
            How we keep the AWI Florida Chapter forum useful, professional, and worth coming back to.
          </p>
          <div className="legal-meta">
            <span>Effective: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>Version 1.0 — Chapter</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <section>
          <h2>The spirit of the place</h2>
          <p>
            The AWI Florida Chapter forum is for working professionals in architectural
            woodwork, cabinetmaking, millwork, and adjacent trades operating in Florida.
            Treat the place like a busy shop floor: people are here to learn, to do
            business, and to swap stories — not to argue politics, not to spam, and not
            to pick fights. We are trade-friendly and firm. A little sawdust language is
            fine. Cruelty is not.
          </p>
        </section>

        <section>
          <h2>1. Be professional</h2>
          <ul>
            <li>Respect other members. Disagree with the work, not the person.</li>
            <li>Use your real name or your company name. Anonymous handles slow down trust.</li>
            <li>No harassment, threats, slurs, or personal attacks. Hard line.</li>
            <li>Politics and unrelated culture-war topics belong somewhere else.</li>
          </ul>
        </section>

        <section>
          <h2>2. Self-promotion is limited</h2>
          <p>
            Supplier members are welcome and the chapter exists in part to help them
            connect with Manufacturer members. That said:
          </p>
          <ul>
            <li>Don’t spam the forum with product pitches. One announcement per quarter is fine; a daily plug is not.</li>
            <li>Sponsored content, paid placement, and chapter-event sponsorships live on the <Link to="/membership">Membership page</Link>. Don’t try to backdoor that through forum posts.</li>
            <li>Cross-posting the same pitch in multiple regional categories will be removed.</li>
            <li>If a member asks for vendor recommendations, member responses are welcome. Cold pitches without a question to anchor to are not.</li>
          </ul>
        </section>

        <section>
          <h2>3. Respect intellectual property</h2>
          <ul>
            <li>Don’t post other people’s shop drawings, photos, or proprietary documents without permission.</li>
            <li>Don’t quote AWS standards beyond a short reference — link to AWI national or buy a copy.</li>
            <li>Don’t reproduce articles from trade publications wholesale. Quote and link.</li>
          </ul>
        </section>

        <section>
          <h2>4. Florida-focused content is welcomed</h2>
          <p>
            This is the Florida Chapter. Local content is the point. Regional vendor
            recommendations, FL Building Code questions, hurricane-impact glazing
            coordination, FL labor market discussion, and meet-up coordination in the
            seven regional categories (South FL, Treasure Coast, Central FL, Tampa Bay,
            Southwest FL, North FL/Jax, Panhandle) are exactly what the forum is for.
          </p>
        </section>

        <section>
          <h2>5. Hiring is allowed; not spam</h2>
          <p>
            Member shops looking to hire or members looking for work can post — once per
            position. Keep the post in the Shop Floor → Hiring & crews category. No
            repost-bumping more often than once every two weeks. Job-board-style spam
            from non-members will be removed.
          </p>
        </section>

        <section>
          <h2>6. Moderator authority</h2>
          <p>
            Chapter staff and designated forum moderators can edit, lock, or remove
            posts that violate these rules. We try to be transparent — moderation
            actions are logged in the Mod Log and the original poster is typically
            notified. Repeat violations lead to a posting timeout and, eventually, a
            ban. The decision of the board on permanent bans is final.
          </p>
        </section>

        <section>
          <h2>7. Reporting a problem</h2>
          <p>
            If you see something that breaks these rules, use the “Report” button on the
            post or thread, or email the Forum moderation alias (we set this up once
            it’s available — contact the board for now). Reports are reviewed within a
            few business days.
          </p>
        </section>

        <section>
          <h2>8. These rules can change</h2>
          <p>
            The board may update these rules from time to time as the forum grows. We
            will post a note here when material changes are made. Continued posting
            after a change indicates acceptance.
          </p>
        </section>

        <section>
          <h2>9. Related documents</h2>
          <ul>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/membership">Chapter Membership</Link></li>
            <li><Link to="/board">Board of Directors</Link></li>
          </ul>
        </section>
      </main>
    </div>
  );
}

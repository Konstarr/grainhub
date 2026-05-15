import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /community-rules — Trade-friendly + firm.
 *
 * Welcoming for working professionals. No harassment, no spam, no
 * sketchy marketplace listings. Mod discretion is final. Folds into
 * the Terms of Service.
 */
export default function CommunityRules() {
  useDocumentTitle('Community Rules');
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-eyebrow">Community</div>
          <h1>Community Rules</h1>
          <p className="legal-sub">
            How we keep AWI Florida Chapter useful, respectful, and worth coming back to.
          </p>
          <div className="legal-meta">
            <span>Effective: April 26, 2026</span>
            <span>·</span>
            <span>Version 1.0</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <section>
          <h2>The spirit of the place</h2>
          <p>
            AWI Florida Chapter is a working-professionals community for woodworking, millwork,
            cabinet, and adjacent trades. Treat the place like a busy shop floor:
            people are here to learn, to do business, and to swap stories — not to
            argue politics, not to spam, and not to pick fights. We're trade-friendly
            and firm. A little sawdust language is fine. Cruelty is not.
          </p>
          <p>
            These rules are part of our <Link to="/terms">Terms of Service</Link>.
            Breaking them can get a post removed, a thread locked, or an account
            suspended. The mods' decision is final, but you can always appeal by
            emailing <a href="mailto:support@millwork.io">support@millwork.io</a>.
          </p>
        </section>

        <section>
          <h2>1. Be decent to other people</h2>
          <ul>
            <li>No personal attacks. Disagree with what someone said, not who they are.</li>
            <li>No harassment or pile-ons. If a thread is going off the rails, drop it.</li>
            <li>No slurs or hate speech. No content that targets people for their race, religion, gender, sexuality, disability, or national origin.</li>
            <li>No threats, no doxxing, no sharing other people's private contact info without permission.</li>
            <li>No impersonating other members, businesses, or staff.</li>
          </ul>
        </section>

        <section>
          <h2>2. Keep posts useful and honest</h2>
          <ul>
            <li>Post in the right place. Marketplace gear in the marketplace, jobs on the jobs board, questions in the right forum.</li>
            <li>Search before you post. Adding to an existing thread is usually better than starting a duplicate.</li>
            <li>Be honest about your experience and credentials. Don't pretend to be a master joiner if you're a first-year apprentice — both have something to share.</li>
            <li>Cite your sources if you're quoting somebody else's work, photos, or plans.</li>
            <li>If you correct a mistake, edit the post and add a note rather than deleting it silently.</li>
          </ul>
        </section>

        <section>
          <h2>3. Marketplace + supplier honesty</h2>
          <ul>
            <li>Only list things you actually own and can legally sell.</li>
            <li>Be accurate about condition, dimensions, and price. Photos must be of the actual item.</li>
            <li>No bait-and-switch listings, no fake "sold" relistings to bump posts.</li>
            <li>If you're a supplier or shop, claim your business profile rather than running it from a personal account.</li>
            <li>No multi-level-marketing recruitment.</li>
            <li>AWI Florida Chapter doesn't process payments. Don't ask people to wire money to a "verification address," and don't fall for it when someone else does.</li>
          </ul>
        </section>

        <section>
          <h2>4. Jobs board honesty</h2>
          <ul>
            <li>Real jobs only. Real employer, real role, real location (or clearly remote).</li>
            <li>State pay, or a pay range, when you can. Members appreciate it.</li>
            <li>No pay-to-apply schemes, no recruiting fees, no jobs that ask the applicant to pay for training kits.</li>
            <li>No discriminatory job posts. Equal opportunity, period.</li>
          </ul>
        </section>

        <section>
          <h2>5. Wiki contributions</h2>
          <ul>
            <li>Edit in good faith. Improve, don't vandalize.</li>
            <li>Don't paste copyrighted content from manufacturers, books, or trade publications without permission. Summarize and link instead.</li>
            <li>Distinguish opinion ("I prefer hide glue for this") from fact ("hide glue is reversible with heat and moisture").</li>
            <li>If you edit safety information, double-check it.</li>
          </ul>
        </section>

        <section>
          <h2>6. Forums and communities</h2>
          <ul>
            <li>Stay on topic for the forum or community. Off-topic posts may be moved or removed.</li>
            <li>One thread per question. Don't double-post across forums.</li>
            <li>Community owners can set additional rules — read the pinned posts in each community.</li>
            <li>Mods may lock heated threads to let things cool off. Take the hint.</li>
          </ul>
        </section>

        <section>
          <h2>7. Direct messages</h2>
          <ul>
            <li>Messages are between members. Don't use DMs to spam, recruit, or run scams.</li>
            <li>Respect "no thanks" the first time.</li>
            <li>If someone is harassing you in DMs, report them. We can review messages when investigating reports.</li>
          </ul>
        </section>

        <section>
          <h2>8. Safety, legality, and the line that doesn't move</h2>
          <ul>
            <li>No illegal content. No CSAM, no incitement, no instructions for violence or fraud.</li>
            <li>No promotion of regulated products (firearms, alcohol, prescription drugs) outside of clearly legal trade contexts.</li>
            <li>No malware, phishing, or "free download" links.</li>
            <li>If a topic is legal but high-risk (lifting a heavy machine, climbing scaffolding, working with reactive finishes), include a safety note. We're not your safety officer, but we're not pretending the risks don't exist either.</li>
          </ul>
        </section>

        <section>
          <h2>9. AI-generated content</h2>
          <ul>
            <li>Be transparent if a post or wiki edit was substantially AI-generated. People should know what they're reading.</li>
            <li>Don't use AI to flood the forums with low-effort posts to farm reputation.</li>
            <li>Don't pass off AI-generated images of work as your own. We'll remove fakes when reported.</li>
          </ul>
        </section>

        <section>
          <h2>10. Reporting and moderation</h2>
          <ul>
            <li>Use the report button on a post or member. That's the fastest path.</li>
            <li>Mods may remove content, lock threads, or suspend accounts. We try to give a reason.</li>
            <li>Bans for repeat or severe violations may be permanent. Trying to ban-evade with a new account doesn't end well.</li>
            <li>If you think a moderation call was wrong, appeal by emailing <a href="mailto:support@millwork.io">support@millwork.io</a>. We act in good faith and are happy to take another look.</li>
          </ul>
        </section>

        <section>
          <h2>11. Companies, sponsors, and self-promotion</h2>
          <ul>
            <li>Companies are welcome. Claim your supplier profile and be useful, not just promotional.</li>
            <li>Sponsor placements are clearly labeled. Don't try to backdoor sponsorship by spamming threads with your products.</li>
            <li>Sharing your own shop or YouTube channel in a relevant thread is fine. Drive-by self-promotion in unrelated threads is not.</li>
          </ul>
        </section>

        <section>
          <h2>12. Privacy and other people's stuff</h2>
          <ul>
            <li>Don't post other people's photos, designs, or plans without their permission.</li>
            <li>Don't post invoices, contracts, or messages from clients without redacting personal information.</li>
            <li>If you want a post that mentions you removed, email us and we'll handle it in good faith.</li>
          </ul>
        </section>

        <section>
          <h2>13. We get to update these</h2>
          <p>
            These rules will change as the community grows. When we make a substantive
            change we'll update the version above and post about it. Your continued
            participation means you accept the updated rules.
          </p>
        </section>

      </main>
    </div>
  );
}

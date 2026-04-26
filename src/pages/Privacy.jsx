import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /privacy — GrainHub LLC Privacy Policy.
 *
 * Plain-language explanation of what we collect, how we use it,
 * what we never do (sell, ad-target), and how members can take
 * control of their data. Florida-based; touches GDPR + CCPA at
 * a high level.
 */
export default function Privacy() {
  useDocumentTitle('Privacy Policy');
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
          <p className="legal-sub">
            We collect what we need to run the community, never sell your data, and
            give you the controls to take it back.
          </p>
          <div className="legal-meta">
            <span>Effective: April 26, 2026</span>
            <span>·</span>
            <span>Version 1.0</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <nav className="legal-toc" aria-label="Section list">
          <strong>On this page</strong>
          <ol>
            <li><a href="#tldr">1. The short version</a></li>
            <li><a href="#collect">2. Information we collect</a></li>
            <li><a href="#use">3. How we use your information</a></li>
            <li><a href="#share">4. When we share information</a></li>
            <li><a href="#never">5. Things we never do</a></li>
            <li><a href="#security">6. How we protect your data</a></li>
            <li><a href="#retention">7. How long we keep things</a></li>
            <li><a href="#rights">8. Your rights and controls</a></li>
            <li><a href="#cookies">9. Cookies and similar tech</a></li>
            <li><a href="#kids">10. Children</a></li>
            <li><a href="#intl">11. International users</a></li>
            <li><a href="#changes">12. Changes to this policy</a></li>
            <li><a href="#contact">13. Contact</a></li>
          </ol>
        </nav>

        <section id="tldr">
          <h2>1. The short version</h2>
          <ul>
            <li>We're a sponsor-supported community. We never run third-party ad networks.</li>
            <li>We never sell, rent, or trade personal information.</li>
            <li>Sponsors don't get your contact info or browsing data.</li>
            <li>We collect what's needed to run accounts, moderate the community, and improve the site.</li>
            <li>You can edit, export, or delete your data at any time — email <a href="mailto:support@grainhub.com">support@grainhub.com</a>.</li>
          </ul>
        </section>

        <section id="collect">
          <h2>2. Information we collect</h2>

          <h3>Information you give us</h3>
          <ul>
            <li><strong>Account info</strong> — username, email, password (stored hashed), and what you put on your profile (name, trade, location, avatar, bio, business details).</li>
            <li><strong>Content you post</strong> — forum threads and replies, wiki edits, news drafts, marketplace listings, job postings, event submissions, supplier profile content, community posts and comments, photos, files, and direct messages.</li>
            <li><strong>Membership / sponsorship info</strong> — plan you're on, transactions handled by our payment processor (we don't store card numbers).</li>
            <li><strong>Communications</strong> — emails or messages you send us.</li>
          </ul>

          <h3>Information we collect automatically</h3>
          <ul>
            <li>Sign-in events, IP addresses, device and browser info, and basic timing data so we can keep the site secure and debug problems.</li>
            <li>Aggregate usage stats (page views, feature usage) so we know what people use.</li>
          </ul>

          <h3>Information we don't ask for</h3>
          <p>
            We don't collect government IDs, social security numbers, or precise GPS
            location. If you ever paste sensitive data into a forum post or message,
            email us and we'll remove it.
          </p>
        </section>

        <section id="use">
          <h2>3. How we use your information</h2>
          <ul>
            <li>Run your account — sign you in, send important notices, recover lost access.</li>
            <li>Run the community — display content, deliver messages, organize search results.</li>
            <li>Moderate — investigate reports, enforce the <Link to="/community-rules">Community Rules</Link>, prevent abuse and spam.</li>
            <li>Communicate — service emails (always), digests and newsletters (only if you opt in).</li>
            <li>Improve — measure how features are used, debug, plan what to build next.</li>
            <li>Comply with the law — respond to lawful requests, protect rights, defend claims.</li>
          </ul>
          <p>
            <strong>Why we may read content.</strong> We don't browse your messages
            for fun. We may access content you post — including direct messages — when
            we need to investigate a report, debug a problem, or comply with the law.
            That's what the Stored Communications Act calls a service-provider
            exception, and it's what lets us keep the community safe.
          </p>
        </section>

        <section id="share">
          <h2>4. When we share information</h2>
          <p>We share narrowly and only when needed:</p>
          <ul>
            <li><strong>Service providers</strong> — companies that host, send email, process payments, or analyze errors for us, under contracts that limit their use to running GrainHub. Today these include: Supabase (database, auth, storage), Vercel (hosting), and an email/payment provider as we add them.</li>
            <li><strong>Other members</strong> — content you choose to post is visible to other signed-in members (or, for public surfaces, the public). Your profile shows whatever you put on it.</li>
            <li><strong>Law enforcement and legal compliance</strong> — when we are legally required to share information, or when sharing is necessary to protect rights, safety, or property.</li>
            <li><strong>Business transfer</strong> — if GrainHub is acquired or merged, your information may transfer. We'll tell you before that happens and give you a chance to delete your account.</li>
          </ul>
          <p>
            Sponsors and advertisers <em>do not</em> get your personal information. If
            you click on a sponsor placement and go to their site, what happens there
            is governed by their privacy policy.
          </p>
        </section>

        <section id="never">
          <h2>5. Things we never do</h2>
          <ul>
            <li>Sell, rent, or trade your personal information to anyone, ever.</li>
            <li>Show third-party display ads or run ad-tracking pixels.</li>
            <li>Read your messages for fun or for marketing.</li>
            <li>Use AI training providers in a way that lets them retain your content for their own model training.</li>
          </ul>
        </section>

        <section id="security">
          <h2>6. How we protect your data</h2>
          <ul>
            <li>All traffic is encrypted in transit (HTTPS/TLS).</li>
            <li>Data at rest is encrypted by our database host.</li>
            <li>Passwords are hashed; we never see your plain-text password.</li>
            <li>Database access is gated by row-level security so members can only read what they're allowed to read.</li>
            <li>Payments run through PCI-compliant providers; we don't store card numbers.</li>
          </ul>
          <p>
            No system is perfectly secure. If we ever discover a breach affecting your
            account, we'll notify you as required by law and give you steps to take.
          </p>
        </section>

        <section id="retention">
          <h2>7. How long we keep things</h2>
          <ul>
            <li><strong>Account data</strong> — kept while your account is active and for a short period after deletion to handle disputes.</li>
            <li><strong>Posts and content</strong> — kept while published; soft-deleted content is purged on a schedule.</li>
            <li><strong>Messages</strong> — kept for the conversation, soft-deleted on request, hard-deleted on a schedule.</li>
            <li><strong>Backups</strong> — retained for a short rolling window to recover from outages.</li>
            <li><strong>Audit logs</strong> — retained for security and abuse investigations.</li>
          </ul>
        </section>

        <section id="rights">
          <h2>8. Your rights and controls</h2>
          <p>
            You can do most of these from your account settings. For anything else,
            email <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            "Privacy request" in the subject and we'll handle it.
          </p>
          <ul>
            <li><strong>See what we have</strong> — request a copy of your data.</li>
            <li><strong>Correct it</strong> — fix inaccurate profile fields yourself or ask us.</li>
            <li><strong>Delete it</strong> — close your account; we erase content according to the schedule above.</li>
            <li><strong>Move it</strong> — request an export in a portable format.</li>
            <li><strong>Opt out</strong> — turn off non-essential emails.</li>
            <li><strong>Object</strong> — tell us if there's a specific use you don't want, and we'll see what we can do.</li>
          </ul>
          <p>
            <strong>California residents (CCPA/CPRA)</strong> — you have the right to
            know what we collect, to delete it, to correct it, and to opt out of any
            "sale" or "sharing" of personal information. We don't sell or share your
            personal information for cross-context behavioral advertising.
          </p>
          <p>
            <strong>EU/EEA/UK residents (GDPR)</strong> — our legal bases are (i)
            contract performance for running your account, (ii) legitimate interest
            for moderation and security, (iii) consent where we ask for it (e.g.
            optional newsletters), and (iv) legal obligations when applicable. You
            can lodge a complaint with your data-protection authority, but we'd
            appreciate the chance to fix things first.
          </p>
        </section>

        <section id="cookies">
          <h2>9. Cookies and similar tech</h2>
          <p>
            We use a small number of cookies and similar storage to keep you signed
            in, remember your preferences, and measure aggregate usage. We don't run
            third-party advertising cookies or cross-site tracking pixels. Your
            browser settings can clear them at any time.
          </p>
        </section>

        <section id="kids">
          <h2>10. Children</h2>
          <p>
            GrainHub is intended for adults working in the trades. We don't knowingly
            collect information from anyone under 16 (or under 13 in the United
            States). If you believe a child has created an account, email us and we
            will remove the account and its data.
          </p>
        </section>

        <section id="intl">
          <h2>11. International users</h2>
          <p>
            GrainHub is operated from the United States. If you use the service from
            another country, you consent to your information being transferred to and
            processed in the U.S., subject to the protections in this Policy.
          </p>
        </section>

        <section id="changes">
          <h2>12. Changes to this policy</h2>
          <p>
            We update this policy when we add features or respond to legal changes.
            When we make a substantive change we'll update the version number above
            and notify signed-in users. The latest version always lives at this URL.
          </p>
        </section>

        <section id="contact">
          <h2>13. Contact</h2>
          <p>
            <strong>GrainHub LLC</strong><br />
            Privacy contact: <a href="mailto:support@grainhub.com">support@grainhub.com</a>
          </p>
        </section>

        <p className="legal-friendly">
          We're a small operation. We can't always promise instant turnaround, but we
          do promise to take privacy questions seriously.
        </p>
      </main>
    </div>
  );
}

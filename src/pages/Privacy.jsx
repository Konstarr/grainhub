import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /privacy - GrainHub LLC Privacy Policy.
 * Florida-based; CCPA + GDPR + COPPA aware.
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
            <span>Version 1.1</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <nav className="legal-toc" aria-label="Section list">
          <strong>On this page</strong>
          <ol>
            <li><a href="#tldr">1. The short version</a></li>
            <li><a href="#collect">2. Information we collect</a></li>
            <li><a href="#sources">3. Where it comes from</a></li>
            <li><a href="#use">4. How we use information</a></li>
            <li><a href="#share">5. When we share</a></li>
            <li><a href="#processors">6. Sub-processors we use</a></li>
            <li><a href="#never">7. Things we never do</a></li>
            <li><a href="#security">8. How we protect data</a></li>
            <li><a href="#retention">9. Retention schedule</a></li>
            <li><a href="#rights">10. Your rights and controls</a></li>
            <li><a href="#ccpa">11. California (CCPA / CPRA)</a></li>
            <li><a href="#gdpr">12. EU / EEA / UK (GDPR)</a></li>
            <li><a href="#children">13. Children's privacy (COPPA)</a></li>
            <li><a href="#dnt">14. Do Not Track</a></li>
            <li><a href="#sensitive">15. Sensitive personal information</a></li>
            <li><a href="#cookies">16. Cookies and similar tech</a></li>
            <li><a href="#security-incidents">17. Security incidents</a></li>
            <li><a href="#intl">18. International users</a></li>
            <li><a href="#changes">19. Changes to this policy</a></li>
            <li><a href="#contact">20. Contact</a></li>
          </ol>
        </nav>

        <section id="tldr">
          <h2>1. The short version</h2>
          <ul>
            <li>We're a sponsor-supported community. We never run third-party ad networks.</li>
            <li>We never sell, rent, or trade personal information. We never will.</li>
            <li>Sponsors don't get your contact info or browsing data.</li>
            <li>We collect what's needed to run accounts, moderate the community, and improve the site.</li>
            <li>You can edit, export, or delete your data at any time - email <a href="mailto:support@grainhub.com">support@grainhub.com</a>.</li>
            <li>We don't knowingly collect data from anyone under 16, and we have no intention of doing so.</li>
          </ul>
        </section>

        <section id="collect">
          <h2>2. Information we collect</h2>

          <h3>Information you give us</h3>
          <ul>
            <li><strong>Account info</strong> - username, email, password (stored hashed and salted by Supabase Auth - we never see the plaintext), and the profile fields you choose to fill in (full name, trade, location, avatar, bio, business details).</li>
            <li><strong>Content you post</strong> - forum threads and replies, wiki edits, news drafts, marketplace listings, job postings, event submissions, supplier-profile content, community posts and comments, photos, files, and direct messages.</li>
            <li><strong>Membership / sponsorship info</strong> - plan you're on, billing email, transactions handled by our payment processor (we don't store card numbers).</li>
            <li><strong>Communications</strong> - emails, support tickets, abuse reports, or other messages you send us.</li>
          </ul>

          <h3>Information we collect automatically</h3>
          <ul>
            <li>Sign-in events, IP addresses, device and browser type, basic timing data so we can keep the site secure and debug problems.</li>
            <li>Aggregate usage metrics (page views, feature usage) - we do not connect these to personal identifiers for advertising.</li>
            <li>Cookies and local storage strictly necessary to keep you signed in and remember preferences.</li>
          </ul>

          <h3>Information we don't ask for</h3>
          <p>
            We don't collect government IDs, social security numbers, biometric data,
            health data, or precise GPS location. If you ever paste sensitive data
            into a forum post or message, email us and we'll remove it.
          </p>
        </section>

        <section id="sources">
          <h2>3. Where the information comes from</h2>
          <ul>
            <li><strong>Directly from you</strong> - sign-up, profile edits, posts, support emails.</li>
            <li><strong>Automatically</strong> - logs from your browser when you use the service.</li>
            <li><strong>From service providers</strong> - our payment processor tells us whether a charge succeeded.</li>
            <li><strong>From other members</strong> - if a mod or another user reports your content, that report is now data we hold.</li>
          </ul>
        </section>

        <section id="use">
          <h2>4. How we use your information</h2>
          <ul>
            <li>Run your account - sign you in, send transactional notices, recover lost access.</li>
            <li>Run the community - display content, deliver messages, build search results, surface relevant communities.</li>
            <li>Moderate - investigate reports, enforce the <Link to="/community-rules">Community Rules</Link>, prevent abuse and spam.</li>
            <li>Communicate - service emails (always), digests and newsletters (only if you opt in).</li>
            <li>Improve - measure feature usage, debug, plan what to build next.</li>
            <li>Comply with the law - respond to lawful requests, protect rights, defend claims.</li>
          </ul>
          <p>
            <strong>Why we may read content.</strong> We don't browse your messages
            for fun. We may access content you post - including direct messages -
            when we need to investigate a report, debug a problem, or comply with the
            law. The Stored Communications Act allows providers like us to access our
            own systems for these purposes, and you consent under 18 U.S.C. §
            2702(b)(3) to that access for the reasons listed above.
          </p>
        </section>

        <section id="share">
          <h2>5. When we share information</h2>
          <p>We share narrowly and only when needed:</p>
          <ul>
            <li><strong>Service providers (sub-processors)</strong> - vendors that host, send email, process payments, or analyze errors for us, under contracts that limit their use to running GrainHub. See Section 6 for the current list.</li>
            <li><strong>Other members</strong> - content you choose to post is visible to other signed-in members or, on public surfaces, the public. Your profile shows whatever you put on it.</li>
            <li><strong>Law enforcement and legal compliance</strong> - when we are legally required to share information, or when sharing is necessary to protect rights, safety, or property. We push back on overbroad requests.</li>
            <li><strong>Business transfer</strong> - if GrainHub is acquired or merged, your information may transfer. We'll tell you before that happens and give you a chance to delete your account.</li>
          </ul>
          <p>
            Sponsors and advertisers <em>do not</em> get your personal information.
            If you click a sponsor placement and go to their site, what happens
            there is governed by their privacy policy.
          </p>
        </section>

        <section id="processors">
          <h2>6. Sub-processors we use</h2>
          <p>
            These are the third parties that process limited personal data on our
            behalf so we can run the service. Each is bound by a data-processing
            agreement.
          </p>
          <ul>
            <li><strong>Supabase</strong> - database, authentication, file storage. Hosts your account, content, and messages.</li>
            <li><strong>Vercel</strong> - frontend hosting, edge functions, basic request logs.</li>
            <li><strong>Cloudflare</strong> (when applicable) - DDoS protection, CDN.</li>
            <li><strong>Email delivery service</strong> - transactional and notification emails.</li>
            <li><strong>Payment processor</strong> - membership and sponsor payments. We do not store card numbers.</li>
          </ul>
          <p>
            We update this list when sub-processors change. The current version
            always lives at this URL.
          </p>
        </section>

        <section id="never">
          <h2>7. Things we never do</h2>
          <ul>
            <li>Sell, rent, or trade your personal information to anyone, ever.</li>
            <li>Show third-party display ads or run ad-tracking pixels.</li>
            <li>Read your messages for marketing.</li>
            <li>Allow any AI vendor to retain your content for their own model training.</li>
            <li>Use facial recognition on your photos.</li>
            <li>Disclose membership of a private community to people who aren't members of that community.</li>
          </ul>
        </section>

        <section id="security">
          <h2>8. How we protect your data</h2>
          <ul>
            <li>All traffic is encrypted in transit (HTTPS / TLS).</li>
            <li>Data at rest is encrypted by our database host (AES-256).</li>
            <li>Passwords are hashed and salted; we never see your plain-text password.</li>
            <li>Database access is gated by row-level security so members can only read what they're allowed to read.</li>
            <li>Payments run through PCI-compliant providers; we don't store card numbers.</li>
            <li>Backups are encrypted and rotated on a schedule.</li>
          </ul>
          <p>
            No system is perfectly secure. We follow industry-standard practices and
            we'll notify you when required if a breach affects your account.
          </p>
        </section>

        <section id="retention">
          <h2>9. Retention schedule</h2>
          <p>
            We keep data only as long as we need it. Concrete schedule:
          </p>
          <ul>
            <li><strong>Account profile</strong> - while your account is active. After deletion, profile fields are erased within 30 days; some derived data (audit logs, abuse history) is retained up to 24 months for safety.</li>
            <li><strong>Posts and content</strong> - while published. Soft-deleted content is purged within 30 days.</li>
            <li><strong>Direct messages</strong> - kept for the conversation. Soft-deleted on request, hard-deleted within 30 days.</li>
            <li><strong>Backups</strong> - retained for a rolling 30-90 day window for outage recovery; deleted accounts age out of backups within 90 days.</li>
            <li><strong>IP and login logs</strong> - retained for up to 90 days for security debugging, longer if part of an open abuse investigation.</li>
            <li><strong>Audit / moderation logs</strong> - up to 24 months for repeat-offender enforcement.</li>
            <li><strong>Billing records</strong> - retained as required by tax / accounting law (up to 7 years).</li>
          </ul>
        </section>

        <section id="rights">
          <h2>10. Your rights and controls</h2>
          <p>
            You can do most of these from your account settings. For anything else,
            email <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            "Privacy request" in the subject and we'll handle it.
          </p>
          <ul>
            <li><strong>See what we have</strong> - request a copy of your data.</li>
            <li><strong>Correct it</strong> - fix inaccurate profile fields yourself or ask us.</li>
            <li><strong>Delete it</strong> - close your account; we erase content according to the schedule above.</li>
            <li><strong>Move it</strong> - request an export in a portable format.</li>
            <li><strong>Opt out</strong> - turn off non-essential emails.</li>
            <li><strong>Object</strong> - tell us if there's a specific use you don't want, and we'll see what we can do.</li>
            <li><strong>Authorized agent</strong> - you can let an authorized agent submit requests on your behalf. We'll verify both identities before acting.</li>
            <li><strong>Non-discrimination</strong> - we won't deny service, charge a different price, or provide a lower quality of service for exercising any of these rights.</li>
          </ul>
        </section>

        <section id="ccpa">
          <h2>11. California residents (CCPA / CPRA)</h2>
          <p>
            In the last 12 months we have <strong>collected</strong> the following
            categories of personal information from California residents:
          </p>
          <ul>
            <li><strong>Identifiers</strong> - name, username, email, IP address, account ID.</li>
            <li><strong>Customer records</strong> - billing email and transaction history (no card numbers).</li>
            <li><strong>Internet activity</strong> - basic usage metrics on our own service.</li>
            <li><strong>Geolocation</strong> - city/state if you choose to share it. We do not collect precise GPS data.</li>
            <li><strong>Commercial information</strong> - membership plan and sponsor purchases.</li>
            <li><strong>Inferences</strong> - feature recommendations based on activity.</li>
            <li><strong>Professional information</strong> - trade, company, role - if you choose to share.</li>
          </ul>
          <p>
            We have <strong>not sold</strong> personal information in the last 12
            months and do not "share" it for cross-context behavioral advertising as
            defined by CPRA. We have no plans to. We also do not knowingly sell or
            share the personal information of consumers under 16.
          </p>
          <p>
            <strong>Your CCPA / CPRA rights</strong> include the right to know,
            access, correct, and delete your personal information; to opt out of any
            sale or share (we don't do this); to limit use of sensitive personal
            information (we don't collect any in CCPA-defined categories); and to be
            free from retaliation for exercising your rights.
          </p>
          <p>
            <strong>How to submit a request.</strong> Email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            "California Privacy Request" in the subject. We will verify your
            identity using information we already have on file.
          </p>
        </section>

        <section id="gdpr">
          <h2>12. EU / EEA / UK residents (GDPR / UK GDPR)</h2>
          <p>
            <strong>Controller.</strong> GrainHub LLC is the controller of personal
            data processed for the GrainHub service.
          </p>
          <p>
            <strong>Legal bases</strong> for our processing are:
          </p>
          <ul>
            <li><em>Contract performance</em> - to run your account.</li>
            <li><em>Legitimate interests</em> - moderation, security, fraud prevention, service improvement, balanced against your rights.</li>
            <li><em>Consent</em> - where we ask for it, e.g. optional newsletters or non-essential cookies.</li>
            <li><em>Legal obligations</em> - tax, anti-fraud, court orders.</li>
          </ul>
          <p>
            <strong>Your rights</strong> include access, correction, erasure,
            restriction, portability, objection, withdrawal of consent, and the
            right to lodge a complaint with your data-protection authority. You can
            exercise these rights by emailing us. We'd appreciate the chance to fix
            things first.
          </p>
          <p>
            <strong>International transfers.</strong> GrainHub is operated from the
            United States. Where we transfer EU/EEA/UK personal data to the U.S. we
            rely on appropriate safeguards such as the Standard Contractual Clauses.
          </p>
        </section>

        <section id="children">
          <h2>13. Children's privacy (COPPA)</h2>
          <p>
            <strong>GrainHub is not directed to children under 16, and we have no
            intention of collecting personal information from children under 16</strong>
            (or under 13 in the United States, the threshold under the Children's
            Online Privacy Protection Act). Account registration requires
            confirmation that the user is at least 16.
          </p>
          <p>
            If we learn that we have inadvertently collected personal information
            from a child under 13 in the U.S. without verifiable parental consent,
            we will delete that information promptly. If you believe a child under
            13 has created an account, email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            "COPPA notice" in the subject and we will act in good faith.
          </p>
          <p>
            Parents or guardians who believe a child under 13 has provided personal
            information to GrainHub may request to review, delete, or stop further
            collection of that information by emailing us. We will verify the
            requester before acting.
          </p>
        </section>

        <section id="dnt">
          <h2>14. Do Not Track</h2>
          <p>
            We don't run third-party advertising networks or cross-site tracking
            pixels, so there's nothing for a Do Not Track signal to opt out of. We
            therefore do not respond to DNT browser signals; the protections it
            normally provides are already part of how we operate.
          </p>
        </section>

        <section id="sensitive">
          <h2>15. Sensitive personal information</h2>
          <p>
            We do not knowingly collect "sensitive personal information" as that
            term is defined under California or other state privacy laws -
            specifically, we do not collect government IDs, social security
            numbers, financial-account credentials, precise geolocation, racial or
            ethnic origin, religious beliefs, union membership, genetic or
            biometric data, health information, or sexual orientation. If you ever
            paste any of those into a profile or post, email us and we'll remove
            it.
          </p>
        </section>

        <section id="cookies">
          <h2>16. Cookies and similar tech</h2>
          <p>
            We use a small number of cookies and similar storage to keep you signed
            in, remember your preferences, and measure aggregate usage. We don't
            run third-party advertising cookies or cross-site tracking pixels.
            Browser settings can clear them at any time, but doing so will sign you
            out.
          </p>
        </section>

        <section id="security-incidents">
          <h2>17. Security incidents</h2>
          <p>
            If we discover a security incident that affects your personal
            information, we will:
          </p>
          <ul>
            <li>Investigate and contain the incident.</li>
            <li>Notify you by email, in-app message, or both, when required by law.</li>
            <li>Notify regulators where required (e.g. within 72 hours under GDPR).</li>
            <li>Provide steps you can take to protect yourself.</li>
          </ul>
          <p>
            You can help us by reporting suspected vulnerabilities to{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            "Security report" in the subject. We respond to good-faith disclosures
            in good faith.
          </p>
        </section>

        <section id="intl">
          <h2>18. International users</h2>
          <p>
            GrainHub is operated from the United States. If you use the service
            from another country, you consent to your information being
            transferred to and processed in the U.S., subject to the protections in
            this Policy and any applicable data-transfer safeguards.
          </p>
        </section>

        <section id="changes">
          <h2>19. Changes to this policy</h2>
          <p>
            We update this policy when we add features or respond to legal
            changes. When we make a substantive change we will update the version
            number above and notify signed-in users. The latest version always
            lives at this URL.
          </p>
        </section>

        <section id="contact">
          <h2>20. Contact</h2>
          <p>
            <strong>GrainHub LLC</strong><br />
            Privacy contact:{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a>
          </p>
        </section>

        <p className="legal-friendly">
          We're a small operation. We can't always promise instant turnaround, but
          we do promise to take privacy questions seriously and to act in good faith.
        </p>
      </main>
    </div>
  );
}

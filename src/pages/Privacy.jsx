import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /privacy — AWI Florida Chapter Privacy Policy.
 *
 * Plain-language privacy policy for a chapter membership site.
 * Florida-based. The chapter should have its counsel review the
 * specifics before public launch.
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
            We collect what we need to run the Chapter, never sell your data, and give
            you the controls to take it back.
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
          <h2>The short version</h2>
          <ul>
            <li>We collect the information you give us when you create an account, register for events, pay dues, or post in the forum.</li>
            <li>We use it to run the Chapter — directory listings, event registrations, dues tracking, forum activity.</li>
            <li>We never sell your data to third parties.</li>
            <li>You can request deletion of your account and personal information at any time.</li>
          </ul>
        </section>

        <section>
          <h2>1. Who we are</h2>
          <p>
            The AWI Florida Chapter (the “Chapter”) is the Florida regional chapter of
            the Architectural Woodwork Institute. This policy covers information
            collected through the Chapter’s website. AWI national operates its own
            privacy policy at <a href="https://www.awinet.org" target="_blank" rel="noopener noreferrer">awinet.org</a>.
          </p>
        </section>

        <section>
          <h2>2. What we collect</h2>
          <p><strong>Account information.</strong> Name, email, username, password (hashed), trade/role, region, and any optional profile details you choose to enter (company name, bio, photo, website, phone).</p>
          <p><strong>Membership information.</strong> Tier (Manufacturer, Supplier, or Guest), member-since date, dues paid-through date, and company name where applicable.</p>
          <p><strong>Activity.</strong> Forum posts, comments, event RSVPs, sponsorship inquiries, login history, and basic usage analytics (page views, route templates) provided through Vercel Analytics.</p>
          <p><strong>Payment information.</strong> The Chapter does not store credit card numbers. Dues and sponsorship payments are arranged directly with the Treasurer through email or external payment platforms; those platforms have their own privacy policies.</p>
        </section>

        <section>
          <h2>3. How we use it</h2>
          <ul>
            <li>To create and maintain your account.</li>
            <li>To track Chapter membership status and dues.</li>
            <li>To list active Chapter Members in the member directory (only with tiers that include directory listing).</li>
            <li>To deliver event registrations, member communications, and chapter announcements.</li>
            <li>To moderate the forum and enforce the Forum Rules.</li>
            <li>To improve the site (aggregate analytics only — no individual tracking sold to anyone).</li>
          </ul>
        </section>

        <section>
          <h2>4. Who we share with</h2>
          <p>We share information only with service providers that help us run the site, and only to the extent needed for that service:</p>
          <ul>
            <li><strong>Supabase</strong> — database and authentication.</li>
            <li><strong>Vercel</strong> — site hosting and analytics.</li>
            <li><strong>Email providers</strong> — for transactional and chapter-announcement email.</li>
            <li><strong>AWI national</strong> — only as needed to maintain Chapter affiliation status; never with individual member content.</li>
          </ul>
          <p>We do not sell your data to advertisers, marketers, or any other third party. We do not display third-party ads on the Chapter site.</p>
        </section>

        <section>
          <h2>5. Cookies and analytics</h2>
          <p>
            The site uses essential cookies to keep you signed in. We use Vercel Analytics
            and Speed Insights to understand how the site performs in aggregate. These
            tools do not store personal identifiers and are GDPR-friendly.
          </p>
        </section>

        <section>
          <h2>6. Your rights</h2>
          <p>You can:</p>
          <ul>
            <li>View and edit your profile information at any time through the site.</li>
            <li>Request deletion of your account by emailing the Chapter Secretary at <a href="mailto:alba@awiflorida.org">alba@awiflorida.org</a>.</li>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Withdraw from public directory listing by changing your membership tier or contacting the Membership Chair.</li>
          </ul>
          <p>
            We will respond to such requests within a reasonable time (typically within
            30 days). Some records (dues paid, sponsor receipts) may be retained as
            required for the Chapter’s financial records.
          </p>
        </section>

        <section>
          <h2>7. How we protect data</h2>
          <p>
            We use industry-standard practices: encrypted connections (HTTPS), hashed
            passwords, role-based access controls, and a managed database with row-level
            security. No system is perfectly secure, but we take reasonable steps to
            protect your information.
          </p>
        </section>

        <section>
          <h2>8. Children</h2>
          <p>
            The site is intended for adults (18+). We do not knowingly collect personal
            information from children. If we learn we have collected such information,
            we will delete it promptly.
          </p>
        </section>

        <section>
          <h2>9. Changes</h2>
          <p>
            We will post any material changes to this policy on this page and update the
            “Effective” date above. Continued use of the site after a change indicates
            your acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Privacy questions can be sent to the Chapter Secretary at{' '}
            <a href="mailto:alba@awiflorida.org">alba@awiflorida.org</a>. Membership and
            account questions go to the Membership Chair at{' '}
            <a href="mailto:nik@awiflorida.org">nik@awiflorida.org</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

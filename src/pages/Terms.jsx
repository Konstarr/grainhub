import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /terms — AWI Florida Chapter Terms of Use.
 *
 * Plain-language terms for a chapter membership and communications
 * site. Florida governing law. The chapter should have its counsel
 * review and bless this text before public launch.
 */
export default function Terms() {
  useDocumentTitle('Terms of Use');
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-eyebrow">Legal</div>
          <h1>Terms of Use</h1>
          <p className="legal-sub">
            These Terms of Use govern your access to and use of the AWI Florida Chapter
            website. By using the site, you agree to these terms.
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
          <h2>1. About this site</h2>
          <p>
            This website is operated by the AWI Florida Chapter (the “Chapter”), the
            Florida regional chapter of the Architectural Woodwork Institute (“AWI”).
            The site provides information about the Chapter, its board, its events, its
            education programs, and a member directory and forum for Chapter members and
            invited guests.
          </p>
          <p>
            The Chapter is a regional volunteer organization. AWI national is a separate
            organization. References to AWI standards (AWS, QCP, etc.) on this site link
            out to AWI national resources at <a href="https://www.awinet.org" target="_blank" rel="noopener noreferrer">awinet.org</a>.
          </p>
        </section>

        <section>
          <h2>2. Who can use the site</h2>
          <p>
            The site is intended for adults (18 or older) working in or interested in
            architectural woodwork and related trades. By creating an account, you
            confirm you are at least 18 and that the information you provide is accurate.
          </p>
          <p>
            Some pages are public. Member-only content (the chapter directory, members-only
            event pricing, member forums) requires a free account or an active Chapter
            membership tier as described on the <Link to="/membership">Membership page</Link>.
          </p>
        </section>

        <section>
          <h2>3. Your account</h2>
          <p>
            You are responsible for the activity on your account, including keeping your
            password secret. Notify the Chapter promptly if you suspect unauthorized use.
            The Chapter may suspend or remove accounts that violate these Terms or that
            appear inactive or abandoned.
          </p>
        </section>

        <section>
          <h2>4. Acceptable use</h2>
          <p>When using the site, you agree not to:</p>
          <ul>
            <li>Post content that is unlawful, threatening, harassing, or defamatory.</li>
            <li>Spam other members, scrape the directory, or send unsolicited commercial messages.</li>
            <li>Post other people’s confidential or copyrighted material without permission.</li>
            <li>Misrepresent your identity, employer, or membership status.</li>
            <li>Attempt to break the site, abuse rate limits, or interfere with how it runs.</li>
          </ul>
          <p>
            Forum and posting conduct is also governed by the{' '}
            <Link to="/community-rules">Forum & Community Rules</Link>.
          </p>
        </section>

        <section>
          <h2>5. Content you post</h2>
          <p>
            You keep ownership of anything you write or post. By posting, you grant the
            Chapter a non-exclusive, royalty-free license to host, display, and share
            that content within the Chapter site and in Chapter communications. The
            Chapter may remove or edit posted content at its discretion (for example,
            to enforce these Terms or the Forum Rules).
          </p>
        </section>

        <section>
          <h2>6. Membership and dues</h2>
          <p>
            Chapter membership tiers, annual dues, and member benefits are published on
            the <Link to="/membership">Membership page</Link>. Dues are paid directly to
            the Chapter and are non-refundable except where required by law or at the
            board’s sole discretion. The Chapter may adjust dues, perks, and tier names
            from time to time; changes apply to subsequent renewal terms.
          </p>
        </section>

        <section>
          <h2>7. Events and sponsorships</h2>
          <p>
            Event registrations and sponsorship purchases are governed by the published
            terms of each event or sponsorship package at the time of purchase. Refund,
            cancellation, and transfer policies vary by event and are noted on each
            event page. Sponsorship slot availability is on a first-paid basis.
          </p>
        </section>

        <section>
          <h2>8. Availability and changes</h2>
          <p>
            The Chapter makes a reasonable effort to keep the site available but does
            not guarantee uninterrupted service. The Chapter may add, remove, or change
            features at any time. We will post a notice on this page when these Terms
            change in a way that materially affects member rights.
          </p>
        </section>

        <section>
          <h2>9. Disclaimer of warranties</h2>
          <p>
            The site is provided “as is.” The Chapter does not warrant that information
            on the site is complete, current, or fit for any particular purpose. Technical
            references (e.g., AWS quotes, AWI program descriptions) are provided as a
            convenience and may be superseded by AWI national publications.
          </p>
        </section>

        <section>
          <h2>10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the Chapter, its board members, and
            its volunteers are not liable for indirect, incidental, or consequential
            damages arising from your use of the site or from any content posted by
            others. The Chapter’s total liability for any claim related to the site is
            limited to the amount of dues you paid to the Chapter in the twelve months
            preceding the claim.
          </p>
        </section>

        <section>
          <h2>11. Florida governing law</h2>
          <p>
            These Terms are governed by the laws of the State of Florida, without regard
            to its conflict of laws rules. Any dispute arising from these Terms or your
            use of the site will be resolved in the state or federal courts located in
            Florida.
          </p>
        </section>

        <section>
          <h2>12. Privacy</h2>
          <p>
            Use of the site is also governed by our <Link to="/privacy">Privacy Policy</Link>,
            which describes what information we collect and how we use it.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            Questions about these Terms can be sent to the Chapter Secretary at{' '}
            <a href="mailto:alba@awiflorida.org">alba@awiflorida.org</a>. Questions about
            membership or dues go to the Treasurer at{' '}
            <a href="mailto:joe@awiflorida.org">joe@awiflorida.org</a>. The full chapter
            board roster is at <Link to="/board">/board</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}

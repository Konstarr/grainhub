import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /terms — GrainHub LLC Terms of Service.
 *
 * Plain-language version covering every surface of the platform
 * (forums, wiki, news, marketplace, jobs, suppliers, events,
 * communities). The Privacy Policy at /privacy and Community
 * Rules at /community-rules are referenced from here and form
 * the rest of the agreement.
 *
 * Florida governing law. Bump TERMS_VERSION at the top of
 * src/lib/termsVersion.js whenever the substance of these
 * documents changes so we can re-prompt existing users.
 */
export default function Terms() {
  useDocumentTitle('Terms of Service');
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-eyebrow">Legal</div>
          <h1>Terms of Service</h1>
          <p className="legal-sub">
            The rules that govern your use of GrainHub. Plain English where we can,
            specific where the law needs us to be.
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
            <li><a href="#about">1. About GrainHub</a></li>
            <li><a href="#accounts">2. Accounts and eligibility</a></li>
            <li><a href="#content">3. Your content and our license to display it</a></li>
            <li><a href="#moderation">4. Moderation and our right to remove content</a></li>
            <li><a href="#prohibited">5. Things you may not do</a></li>
            <li><a href="#surfaces">6. The specific surfaces of GrainHub</a></li>
            <li><a href="#claim">7. Claiming a business profile</a></li>
            <li><a href="#sponsors">8. Sponsors, memberships, and how we make money</a></li>
            <li><a href="#dmca">9. Copyright and DMCA notices</a></li>
            <li><a href="#term">10. Termination</a></li>
            <li><a href="#disclaimer">11. Disclaimers and limits on liability</a></li>
            <li><a href="#disputes">12. Disputes, governing law, and arbitration</a></li>
            <li><a href="#changes">13. Changes to these Terms</a></li>
            <li><a href="#contact">14. Contact us</a></li>
          </ol>
        </nav>

        <section id="about">
          <h2>1. About GrainHub</h2>
          <p>
            GrainHub is a social community for the woodworking, millwork, cabinet, and
            allied trades, operated by <strong>GrainHub LLC</strong> ("GrainHub", "we",
            "us", "our"). We are not a marketplace operator, a payment processor, an
            employer, or a publisher of professional advice — we are a place where
            craftspeople, suppliers, and businesses meet, share knowledge, and trade
            information.
          </p>
          <p>
            By creating an account or otherwise using GrainHub you agree to these Terms,
            our <Link to="/privacy">Privacy Policy</Link>, and our{' '}
            <Link to="/community-rules">Community Rules</Link>. If you don't agree, don't
            use the service.
          </p>
        </section>

        <section id="accounts">
          <h2>2. Accounts and eligibility</h2>
          <p>
            To use most parts of GrainHub you'll need an account. You must be at least
            16 years old and old enough to enter a binding contract in your state or
            country. If you're using GrainHub on behalf of a company, you confirm you
            have authority to bind that company to these Terms.
          </p>
          <p>
            Keep your login credentials private. You are responsible for activity that
            happens on your account. If you think your account has been compromised,
            email us right away at{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a>.
          </p>
          <p>
            You agree to give us accurate information about yourself or your business
            and to keep that information current.
          </p>
        </section>

        <section id="content">
          <h2>3. Your content and our license to display it</h2>
          <p>
            Anything you post on GrainHub — forum threads, replies, wiki edits,
            marketplace listings, job postings, news article drafts, event submissions,
            community posts, comments, photos, attachments, and direct messages — is
            "Your Content."
          </p>
          <p>
            <strong>You keep ownership of Your Content.</strong> You grant GrainHub a
            worldwide, non-exclusive, royalty-free license to host, store, reproduce,
            adapt for display (e.g. resize images, generate previews), and distribute
            Your Content within the GrainHub service so we can run the platform. This
            license ends when you delete the content, except for backups, audit logs,
            or content other users have re-shared inside the platform.
          </p>
          <p>
            You promise that Your Content is yours to post — you either created it,
            licensed it, or have permission to share it — and that it doesn't infringe
            anyone else's rights.
          </p>
          <p>
            <strong>Removal in good faith.</strong> If you ever want something you
            posted taken down, email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> and we will
            act on it in good faith. We act in good faith generally — we are a small
            team, mistakes happen, and we'd rather over-correct than leave something up
            that shouldn't be there.
          </p>
        </section>

        <section id="moderation">
          <h2>4. Moderation and our right to remove content</h2>
          <p>
            GrainHub is a curated community, not a neutral utility. We can review, edit,
            or remove any content for any reason that fits our Community Rules or our
            judgment, including without limitation:
          </p>
          <ul>
            <li>Content that violates our Community Rules.</li>
            <li>Content that is illegal, harassing, hateful, or threatening.</li>
            <li>Spam, scams, deceptive marketplace listings, or fake job postings.</li>
            <li>Content that infringes someone else's copyright, trademark, or other rights.</li>
            <li>Content posted in the wrong place (e.g. a private classified put in a wiki article).</li>
            <li>Content we no longer want to host for any other lawful reason.</li>
          </ul>
          <p>
            We may also suspend or terminate accounts for the same reasons. We try to
            give a reason and to act consistently, but moderation decisions are
            ultimately at our discretion. If you think a decision was wrong, email us
            and we'll take another look.
          </p>
          <p>
            <strong>Why we read content.</strong> To run GrainHub responsibly we may
            access content you post, including direct messages, when we have a
            legitimate reason — investigating a report, debugging a problem, complying
            with the law, or protecting our users. We don't do it for fun. The Privacy
            Policy explains this in more detail.
          </p>
        </section>

        <section id="prohibited">
          <h2>5. Things you may not do</h2>
          <p>You agree not to use GrainHub to:</p>
          <ul>
            <li>Break the law or help others break it.</li>
            <li>Harass, threaten, dox, or impersonate anyone.</li>
            <li>Post sexually explicit content, content that exploits minors, or content that promotes violence or hate.</li>
            <li>Spam, run pump-and-dump schemes, or post deceptive marketplace listings or job postings.</li>
            <li>Sell items you don't actually have or can't legally sell.</li>
            <li>Post content that infringes intellectual property you don't own or license.</li>
            <li>Try to scrape, reverse-engineer, or copy GrainHub's content or code beyond what fair use allows.</li>
            <li>Probe or break our security, or upload malware.</li>
            <li>Use bots, automation, or burner accounts to inflate activity, manipulate votes, or evade bans.</li>
            <li>Collect other users' personal information beyond what they have publicly shared.</li>
            <li>Resell GrainHub access, sponsor placements, or scraped GrainHub data to third parties.</li>
          </ul>
          <p>
            Detailed conduct expectations live in the{' '}
            <Link to="/community-rules">Community Rules</Link>.
          </p>
        </section>

        <section id="surfaces">
          <h2>6. The specific surfaces of GrainHub</h2>
          <p>Some sections of the site have additional rules that fold into these Terms.</p>

          <h3>Forums</h3>
          <p>
            Forum threads and replies are public to signed-in members. Don't post
            personal information about other people without permission. Mods may lock,
            move, edit, or delete threads.
          </p>

          <h3>Wiki</h3>
          <p>
            The wiki is a collaborative resource. By contributing you grant other
            members the right to revise your edits. We aim for accuracy but the wiki is
            user-generated and is provided "as is" — don't rely on it as a substitute
            for professional advice.
          </p>

          <h3>News</h3>
          <p>
            News articles are written by GrainHub staff and approved contributors. If
            we get something wrong, email us and we will correct or retract.
          </p>

          <h3>Marketplace</h3>
          <p>
            GrainHub does not sell anything in the marketplace and is not a party to
            any transaction. Listings are posted by users and represent that user's
            offer. We do not handle payments or shipping. Buyers and sellers are
            responsible for verifying each other and for their own contracts. We may
            remove listings that are deceptive, illegal, or violate our Community
            Rules.
          </p>

          <h3>Jobs</h3>
          <p>
            Job posts are submitted by employers. GrainHub is not the employer and is
            not responsible for the hiring process or any employment relationship that
            results. Employers must post lawful, non-discriminatory job listings.
          </p>

          <h3>Suppliers</h3>
          <p>
            The supplier directory is informational. Listing in the directory does not
            mean GrainHub endorses any supplier. Members can claim their company entry
            (see Section 7) and update it.
          </p>

          <h3>Events</h3>
          <p>
            Event listings are submitted by users or staff. GrainHub does not host or
            run third-party events and is not responsible for what happens at them.
          </p>

          <h3>Communities</h3>
          <p>
            Community owners and moderators run their communities under our Community
            Rules. We can step in when a community violates the Rules or applicable
            law. Owners must transfer ownership before leaving a community.
          </p>

          <h3>Direct messages</h3>
          <p>
            Direct messages between members are private to the participants but are
            not end-to-end encrypted. We may review them for the reasons listed in
            Section 4.
          </p>
        </section>

        <section id="claim">
          <h2>7. Claiming a business profile</h2>
          <p>
            If your business already has a profile in our supplier directory or shows
            up in another GrainHub surface, you can claim it. To claim a profile, email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> from a
            verifiable business email or domain and tell us which profile to assign to
            you. Once we verify, you'll be able to edit the profile, add media, and
            respond on behalf of the business.
          </p>
          <p>
            If something incorrect or inappropriate is associated with your business or
            you, contact us. We will review and remove or correct in good faith. We'd
            rather take it down and discuss than leave a mistake up.
          </p>
        </section>

        <section id="sponsors">
          <h2>8. Sponsors, memberships, and how we make money</h2>
          <p>
            <strong>GrainHub is sponsor-supported, not ad-supported.</strong> We do not
            run third-party advertising networks. We do not sell, rent, or trade our
            members' personal information. We never will.
          </p>
          <p>
            We sustain the platform through:
          </p>
          <ul>
            <li>Memberships that unlock additional features for individuals and businesses.</li>
            <li>Sponsors — businesses that pay to be featured on GrainHub.</li>
          </ul>
          <p>
            Sponsorships are clearly labeled as sponsor placements and don't change
            our editorial judgment about news, wiki content, or moderation. Sponsors
            don't get access to your personal information.
          </p>
          <p>
            Membership fees and sponsorship rates are listed at{' '}
            <Link to="/account/subscription">our subscription hub</Link>. Cancellation
            is handled by you in your account settings; we don't lock memberships.
          </p>
        </section>

        <section id="dmca">
          <h2>9. Copyright and DMCA notices</h2>
          <p>
            If you believe content on GrainHub infringes your copyright, send a notice
            to <a href="mailto:support@grainhub.com">support@grainhub.com</a> with the
            subject line "DMCA Notice" containing the information required by 17 U.S.C.
            § 512(c)(3): identification of the work, identification of the infringing
            material with enough detail for us to find it, your contact information,
            a good-faith statement that the use isn't authorized, a statement under
            penalty of perjury that the notice is accurate and that you're authorized
            to act for the rights holder, and your physical or electronic signature.
          </p>
          <p>
            We will remove or disable access to material we determine is infringing
            and will terminate repeat infringers. If you think your content was wrongly
            removed, you can send a counter-notice with the same elements.
          </p>
        </section>

        <section id="term">
          <h2>10. Termination</h2>
          <p>
            You can close your account any time by emailing us. We can suspend or
            terminate your access if you violate these Terms, the Community Rules, or
            applicable law, or if continuing to host you would expose GrainHub or other
            members to harm.
          </p>
          <p>
            On termination, the licenses you granted us in Your Content survive only
            to the extent necessary to maintain backups, audit logs, and copies that
            other members have already shared into their own threads or posts.
            Provisions that by their nature should survive — disclaimers, liability
            limits, dispute resolution, indemnity — survive termination.
          </p>
        </section>

        <section id="disclaimer">
          <h2>11. Disclaimers and limits on liability</h2>
          <p>
            GrainHub is provided <strong>"as is" and "as available"</strong>. To the
            maximum extent allowed by law, we disclaim all warranties — express or
            implied — including merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
          <p>
            Content posted by other users does not represent GrainHub. Don't rely on
            wiki articles, marketplace listings, or forum advice as a substitute for
            professional, legal, financial, or safety guidance.
          </p>
          <p>
            <strong>Cap on damages.</strong> To the maximum extent allowed by law,
            GrainHub's total liability to you for any claim arising out of or relating
            to GrainHub will not exceed the greater of (a) the amount you paid us in
            the twelve months before the claim arose, or (b) US $100. We are not
            liable for indirect, incidental, special, consequential, or punitive
            damages, or for lost profits, lost revenue, lost data, or business
            interruption, even if we were warned about the possibility.
          </p>
          <p>
            <strong>Indemnity.</strong> You agree to indemnify, defend, and hold
            harmless GrainHub LLC and its members, employees, and contractors from any
            claim arising out of (i) Your Content, (ii) your use of the service, or
            (iii) your violation of these Terms.
          </p>
        </section>

        <section id="disputes">
          <h2>12. Disputes, governing law, and arbitration</h2>
          <p>
            These Terms are governed by the laws of the State of Florida, without
            regard to conflict-of-laws rules. The exclusive venue for any dispute that
            isn't subject to arbitration is the state or federal courts located in
            Florida, and you consent to that jurisdiction.
          </p>
          <p>
            <strong>Informal resolution first.</strong> Before filing anything, please
            email <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            a description of the issue and what you'd like to see done. Most things
            get resolved this way.
          </p>
          <p>
            <strong>Class waiver.</strong> Disputes are resolved on an individual
            basis. To the extent allowed by law, you waive the right to bring or
            participate in a class action against GrainHub.
          </p>
          <p>
            Nothing in this section prevents either side from seeking injunctive
            relief in court for misuse of intellectual property or breach of
            confidentiality.
          </p>
        </section>

        <section id="changes">
          <h2>13. Changes to these Terms</h2>
          <p>
            We may update these Terms when we add features, fix mistakes, or respond
            to legal changes. When we make a substantive change we will update the
            version number above and notify signed-in users so you can review the new
            version. Continued use of GrainHub after a change means you accept the
            updated Terms; if you don't accept them, stop using the service and
            email us.
          </p>
        </section>

        <section id="contact">
          <h2>14. Contact us</h2>
          <p>
            <strong>GrainHub LLC</strong><br />
            Email: <a href="mailto:support@grainhub.com">support@grainhub.com</a>
          </p>
          <p>
            For abuse, harassment, copyright, or removal requests, use the same email
            with a clear subject line ("Abuse report", "DMCA Notice", "Removal
            request"). We try to respond within a few business days.
          </p>
        </section>

        <p className="legal-friendly">
          GrainHub is a small community platform run by woodworkers, for woodworkers.
          We try to act in good faith. If something here looks off, tell us.
        </p>
      </main>
    </div>
  );
}

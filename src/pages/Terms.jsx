import { Link } from 'react-router-dom';
import useDocumentTitle from '../lib/useDocumentTitle.js';
import '../styles/legal.css';

/**
 * /terms - GrainHub LLC Terms of Service.
 * Florida governing law. Bump TERMS_VERSION when substance changes.
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
            <span>Version 1.1</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <nav className="legal-toc" aria-label="Section list">
          <strong>On this page</strong>
          <ol>
            <li><a href="#about">1. About GrainHub</a></li>
            <li><a href="#accounts">2. Accounts and eligibility</a></li>
            <li><a href="#content">3. Your content + license</a></li>
            <li><a href="#moderation">4. Moderation rights</a></li>
            <li><a href="#prohibited">5. Things you may not do</a></li>
            <li><a href="#surfaces">6. The specific surfaces</a></li>
            <li><a href="#claim">7. Claiming a business profile</a></li>
            <li><a href="#sponsors">8. Sponsors + memberships</a></li>
            <li><a href="#dmca">9. Copyright + DMCA</a></li>
            <li><a href="#term">10. Termination</a></li>
            <li><a href="#disclaimer">11. Disclaimers + liability cap</a></li>
            <li><a href="#disputes">12. Disputes + Florida law</a></li>
            <li><a href="#tcpa">13. Email and SMS consent</a></li>
            <li><a href="#beta">14. Beta features</a></li>
            <li><a href="#advice">15. No professional advice</a></li>
            <li><a href="#thirdparty">16. Third-party links</a></li>
            <li><a href="#accountsharing">17. Account sharing</a></li>
            <li><a href="#aitraining">18. AI training and scraping</a></li>
            <li><a href="#tax">19. Taxes</a></li>
            <li><a href="#export">20. Export + sanctions</a></li>
            <li><a href="#general">21. General provisions</a></li>
            <li><a href="#changes">22. Changes to these Terms</a></li>
            <li><a href="#contact">23. Contact</a></li>
          </ol>
        </nav>

        <section id="about">
          <h2>1. About GrainHub</h2>
          <p>
            GrainHub is a social community for the woodworking, millwork, cabinet, and
            allied trades, operated by <strong>GrainHub LLC</strong> ("GrainHub", "we",
            "us", "our"), a Florida limited liability company. We are not a marketplace
            operator, a payment processor, an employer, an escrow agent, or a publisher
            of professional advice - we are a place where craftspeople, suppliers, and
            businesses meet, share knowledge, and trade information.
          </p>
          <p>
            By creating an account or otherwise using GrainHub you agree to these Terms,
            our <Link to="/privacy">Privacy Policy</Link>, and our{' '}
            <Link to="/community-rules">Community Rules</Link>. Together those three
            documents are the entire agreement between you and GrainHub. If you don't
            agree, don't use the service.
          </p>
        </section>

        <section id="accounts">
          <h2>2. Accounts and eligibility</h2>
          <p>
            To use most parts of GrainHub you'll need an account. By creating one you
            represent and warrant that:
          </p>
          <ul>
            <li>You are at least 16 years old (or the age of majority in your jurisdiction, whichever is higher) and old enough to enter a binding contract.</li>
            <li>You are not a person who is barred from receiving services under U.S. law or any other applicable jurisdiction.</li>
            <li>You are not on any U.S. government list of restricted, denied, or sanctioned parties.</li>
            <li>If you're using GrainHub on behalf of an organization, you have authority to bind that organization to these Terms.</li>
            <li>The information you give us about yourself or your business is accurate, and you'll keep it current.</li>
          </ul>
          <p>
            Keep your login credentials private. You are responsible for activity that
            happens on your account. If you think your account has been compromised,
            email us right away at{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a>.
          </p>
        </section>

        <section id="content">
          <h2>3. Your content and our license to display it</h2>
          <p>
            "Your Content" means anything you post on GrainHub: forum threads, replies,
            wiki edits, marketplace listings, job postings, news article drafts, event
            submissions, supplier-profile content, community posts, comments, photos,
            attachments, and direct messages.
          </p>
          <p>
            <strong>You keep ownership of Your Content.</strong> You grant GrainHub a
            worldwide, non-exclusive, royalty-free, sublicensable license to host,
            store, reproduce, adapt for display (e.g. resize images, generate
            previews), distribute, and publicly display Your Content within the
            GrainHub service so we can run the platform. The license ends when you
            delete the content, except for backups, audit logs, and copies that other
            members have already re-shared into their own threads or posts.
          </p>
          <p>
            <strong>Your warranties about Your Content.</strong> You warrant that Your
            Content is yours to post - you either created it, licensed it, or have
            permission to share it - and that it doesn't infringe anyone else's
            rights, doesn't violate any law, and doesn't include personal information
            about other people they haven't agreed to share.
          </p>
          <p>
            <strong>Removal in good faith.</strong> If you ever want something taken
            down, email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> and we will
            act on it in good faith. If a third party complains about Your Content -
            for example because they think it infringes a copyright or invades their
            privacy - we will review the complaint, contact you when feasible, and
            may remove the content while we investigate. We'd rather over-correct in
            good faith than leave a problem up.
          </p>
          <p>
            <strong>Feedback.</strong> If you send us suggestions or feature requests,
            you grant us a perpetual, irrevocable, royalty-free license to use them
            without compensation or attribution.
          </p>
        </section>

        <section id="moderation">
          <h2>4. Moderation and our right to remove content</h2>
          <p>
            GrainHub is a curated community, not a neutral utility. We can review,
            edit, or remove any content for any reason that fits our Community Rules
            or our judgment, including without limitation:
          </p>
          <ul>
            <li>Content that violates our Community Rules.</li>
            <li>Content that is illegal, harassing, hateful, or threatening.</li>
            <li>Spam, scams, deceptive marketplace listings, or fake job postings.</li>
            <li>Content that infringes someone else's copyright, trademark, or other rights.</li>
            <li>Content posted in the wrong place.</li>
            <li>Content we no longer want to host for any other lawful reason.</li>
          </ul>
          <p>
            We may also suspend or terminate accounts for the same reasons. We try to
            give a reason and act consistently, but moderation decisions are
            ultimately at our discretion. You can appeal by email and we will take
            another look in good faith.
          </p>
          <p>
            <strong>Right to investigate.</strong> To run GrainHub responsibly we may
            access, read, copy, and retain Your Content - including direct messages -
            when we have a legitimate reason: investigating a report, debugging,
            complying with law, defending claims, or protecting our users. We don't
            do it for fun. The Privacy Policy explains this in more detail. To the
            extent the Stored Communications Act (18 U.S.C. § 2701 et seq.) is
            relevant, you consent under § 2702(b)(3) to GrainHub's access to your
            communications on the platform for these purposes.
          </p>
          <p>
            <strong>Section 230.</strong> GrainHub is an interactive computer service
            under Section 230 of the Communications Decency Act (47 U.S.C. § 230).
            We are not the publisher or speaker of content posted by other users, and
            our decisions to remove or restrict content are made in good faith.
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
            <li>Post personal information about other people that you don't have permission to share.</li>
            <li>Try to scrape, reverse-engineer, copy, or reproduce GrainHub's content, structure, or code beyond what fair use allows.</li>
            <li>Use bots, automation, or burner accounts to inflate activity, manipulate votes, or evade bans.</li>
            <li>Probe or break our security, or upload malware or harmful code.</li>
            <li>Collect other users' personal information beyond what they have publicly shared.</li>
            <li>Resell GrainHub access, sponsor placements, or scraped GrainHub data to third parties.</li>
            <li>Use the service in any way that violates U.S. export controls or sanctions law.</li>
            <li>Pretend to be a moderator, admin, or staff member of GrainHub.</li>
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
            personal information about other people without permission. Mods may
            lock, move, edit, or delete threads.
          </p>

          <h3>Wiki</h3>
          <p>
            The wiki is a collaborative resource. By contributing you grant other
            members the right to revise your edits. We aim for accuracy but the wiki
            is user-generated and provided "as is" - don't rely on it as a
            substitute for professional, safety, legal, or financial advice.
          </p>

          <h3>News</h3>
          <p>
            News articles are written by GrainHub staff and approved contributors. If
            we get something wrong, email us and we will correct or retract.
          </p>

          <h3>Marketplace</h3>
          <p>
            <strong>GrainHub is not a party to any transaction.</strong> Listings are
            posted by users and represent that user's offer. We do not handle
            payments, escrow, shipping, returns, refunds, taxes, or warranties.
            Buyers and sellers are responsible for verifying each other and for
            their own contracts. Inspect goods, check title, follow local sales-tax
            and resale-license rules. We do not guarantee that a listed item is as
            described, fit for its intended use, free of defects, or actually
            available. We may remove listings that are deceptive, illegal, or
            violate our Community Rules, but we have no obligation to police the
            marketplace and assume no liability for any loss arising from a
            transaction between members.
          </p>

          <h3>Jobs</h3>
          <p>
            Job posts are submitted by employers. <strong>GrainHub is not the
            employer</strong> and is not responsible for hiring, screening, I-9
            verification, background checks, payroll, taxes, or any employment
            relationship that results from a job post. Employers must post lawful,
            non-discriminatory job listings. Applicants are responsible for verifying
            employers and roles before sharing personal information.
          </p>

          <h3>Suppliers</h3>
          <p>
            The supplier directory is informational. Listing in the directory does
            not mean GrainHub endorses any supplier. Members can claim their
            company entry (Section 7) and update it.
          </p>

          <h3>Events</h3>
          <p>
            Event listings are submitted by users or staff. <strong>GrainHub does
            not host or run third-party events</strong> and is not responsible for
            anything that happens at them - including injuries, property damage,
            cancellations, or refund disputes. Attending an event is at your own
            risk.
          </p>

          <h3>Communities</h3>
          <p>
            Community owners and moderators run their communities under our
            Community Rules. We can step in when a community violates the Rules or
            applicable law. Owners must transfer ownership before leaving a
            community.
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
            up elsewhere on GrainHub, you can claim it. Email{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> from a
            verifiable business email or domain and tell us which profile to assign
            to you. Once we verify, you'll be able to edit the profile, add media,
            and respond on behalf of the business.
          </p>
          <p>
            If something incorrect or inappropriate is associated with your business,
            email us. We will review and remove or correct in good faith. We'd
            rather take a posting down and discuss than leave a mistake up.
          </p>
        </section>

        <section id="sponsors">
          <h2>8. Sponsors, memberships, and how we make money</h2>
          <p>
            <strong>GrainHub is sponsor-supported, not ad-supported.</strong> We do
            not run third-party advertising networks. We do not sell, rent, or trade
            our members' personal information. We never will.
          </p>
          <p>We sustain the platform through:</p>
          <ul>
            <li>Memberships that unlock additional features for individuals and businesses.</li>
            <li>Sponsors - businesses that pay to be featured on GrainHub.</li>
          </ul>
          <p>
            Sponsorships are clearly labeled and don't change our editorial judgment
            about news, wiki content, or moderation. Sponsors don't get access to
            your personal information.
          </p>
          <p>
            <strong>Billing.</strong> Membership fees and sponsorship rates are
            listed at <Link to="/account/subscription">our subscription hub</Link>.
            Recurring charges renew automatically until you cancel from your account
            settings. Charges are non-refundable except where required by law. If
            your payment fails, we may pause your benefits until the issue is fixed.
          </p>
        </section>

        <section id="dmca">
          <h2>9. Copyright and DMCA notices</h2>
          <p>
            If you believe content on GrainHub infringes your copyright, send a
            notice to{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with the
            subject line "DMCA Notice" containing the information required by 17
            U.S.C. § 512(c)(3): identification of the work, identification of the
            infringing material with enough detail for us to find it, your contact
            information, a good-faith statement that the use isn't authorized, a
            statement under penalty of perjury that the notice is accurate and that
            you're authorized to act for the rights holder, and your physical or
            electronic signature.
          </p>
          <p>
            We will remove or disable access to material we determine is infringing
            and will terminate repeat infringers. If you think your content was
            wrongly removed, you can send a counter-notice with the same elements.
          </p>
        </section>

        <section id="term">
          <h2>10. Termination</h2>
          <p>
            You can close your account any time by emailing us. We can suspend or
            terminate your access if you violate these Terms, the Community Rules,
            or applicable law, or if continuing to host you would expose GrainHub or
            other members to harm. We may terminate accounts that have been inactive
            for more than 24 months.
          </p>
          <p>
            On termination, the licenses you granted us in Your Content survive only
            to the extent necessary to maintain backups, audit logs, and copies that
            other members have already re-shared into their own threads or posts.
            Provisions that by their nature should survive - disclaimers, liability
            limits, indemnity, dispute resolution, restrictions on use - survive
            termination.
          </p>
        </section>

        <section id="disclaimer">
          <h2>11. Disclaimers and limits on liability</h2>
          <p>
            <strong>"AS IS" basis.</strong> GrainHub is provided "as is" and "as
            available." To the maximum extent allowed by law, we disclaim all
            warranties - express or implied - including merchantability, fitness
            for a particular purpose, title, accuracy, and non-infringement. We do
            not warrant that the service will be uninterrupted, error-free, secure,
            or free of viruses or other harmful components.
          </p>
          <p>
            <strong>User-generated content disclaimer.</strong> Content posted by
            other users does not represent GrainHub. Don't rely on wiki articles,
            marketplace listings, forum advice, or any other user content as a
            substitute for professional, legal, financial, medical, or safety
            guidance.
          </p>
          <p>
            <strong>Cap on damages.</strong> To the maximum extent allowed by law,
            GrainHub's total liability to you for any claim arising out of or
            relating to GrainHub will not exceed the greater of (a) the amount you
            paid us in the twelve months before the claim arose, or (b) US $100. We
            are not liable for indirect, incidental, special, consequential,
            exemplary, or punitive damages, or for lost profits, lost revenue, lost
            data, lost goodwill, or business interruption, even if we were warned
            about the possibility. Some jurisdictions do not allow these
            limitations, in which case they apply to the maximum extent permitted.
          </p>
          <p>
            <strong>Indemnity.</strong> You agree to defend, indemnify, and hold
            harmless GrainHub LLC and its members, employees, contractors,
            successors, and assigns from any third-party claim, damage, liability,
            cost, or expense (including reasonable attorneys' fees) arising out of
            (i) Your Content, (ii) your use of the service, (iii) your violation of
            these Terms, the Privacy Policy, or the Community Rules, (iv) your
            violation of any law or third-party right, or (v) any dispute between
            you and another member or third party.
          </p>
        </section>

        <section id="disputes">
          <h2>12. Disputes, governing law, and arbitration</h2>
          <p>
            <strong>Florida law.</strong> These Terms are governed by the laws of
            the State of Florida, without regard to conflict-of-laws rules. The U.N.
            Convention on Contracts for the International Sale of Goods does not
            apply.
          </p>
          <p>
            <strong>Informal resolution first.</strong> Before filing anything, please
            email <a href="mailto:support@grainhub.com">support@grainhub.com</a> with
            a clear description of the issue and what you'd like to see done. Most
            things get resolved this way. You agree to give us at least 60 days to
            respond before initiating formal proceedings.
          </p>
          <p>
            <strong>Venue.</strong> The exclusive venue for any dispute is the state
            or federal courts located in the county of GrainHub's principal place of
            business in Florida, and you consent to that personal jurisdiction.
          </p>
          <p>
            <strong>Class action waiver.</strong> Disputes are resolved on an
            individual basis. To the maximum extent permitted by law, you waive the
            right to bring or participate in a class action, collective action, or
            consolidated proceeding against GrainHub.
          </p>
          <p>
            <strong>Limitation period.</strong> Any cause of action arising out of
            or relating to GrainHub must be commenced within ONE (1) YEAR after the
            cause of action accrues. After that, the cause of action is permanently
            barred.
          </p>
          <p>
            Nothing in this section prevents either side from seeking injunctive
            relief in court for misuse of intellectual property or breach of
            confidentiality, or from reporting violations to a government agency.
          </p>
        </section>

        <section id="tcpa">
          <h2>13. Email and SMS consent (TCPA)</h2>
          <p>
            By creating an account you consent to receive transactional emails from
            us about your account, security, and the service - these are not
            optional and don't have an unsubscribe link. Optional digests and
            newsletters are sent only if you opt in, and every optional email
            includes an unsubscribe link.
          </p>
          <p>
            If you give us a phone number for two-factor authentication or
            transactional alerts, you consent to receive related text messages.
            Standard message-and-data rates may apply. You can opt out of
            transactional SMS at any time by replying STOP, but doing so may limit
            account-recovery options.
          </p>
        </section>

        <section id="beta">
          <h2>14. Beta features</h2>
          <p>
            From time to time we may offer experimental features labeled "beta,"
            "preview," "alpha," or similar. Beta features are provided strictly "as
            is" without any warranties, may be changed or removed without notice,
            and may not be subject to the same security or reliability standards as
            generally available features. Don't rely on them for critical workflows.
          </p>
        </section>

        <section id="advice">
          <h2>15. No professional advice</h2>
          <p>
            Content on GrainHub - including wiki articles, news, forum posts, and
            user replies - is for general informational and trade-community
            purposes only. It is <strong>not</strong> legal, financial, medical,
            engineering, or safety advice. Don't rely on it as a substitute for
            consulting a qualified professional or following manufacturer
            instructions, building codes, OSHA standards, or applicable safety
            regulations.
          </p>
        </section>

        <section id="thirdparty">
          <h2>16. Third-party links and services</h2>
          <p>
            GrainHub may contain links to or integrations with third-party websites
            and services (manufacturer pages, supplier sites, payment processors,
            etc.). We do not control them, do not endorse them, and are not
            responsible for their content, availability, or practices. Your use of
            those services is governed by their own terms and privacy policies.
          </p>
        </section>

        <section id="accountsharing">
          <h2>17. Account sharing</h2>
          <p>
            Each account is for one person or one business. Don't share login
            credentials. If a business needs multiple seats, those should be
            separate accounts under the same business profile. We may suspend
            accounts that show patterns of credential sharing.
          </p>
        </section>

        <section id="aitraining">
          <h2>18. AI training, scraping, and bulk export</h2>
          <p>
            You may not use GrainHub content to train, fine-tune, or evaluate
            machine-learning models, or to generate datasets for sale or
            distribution, without our prior written permission. Automated scraping
            of GrainHub - including via headless browsers or undisclosed bots - is
            prohibited except as expressly permitted by an API key issued by us.
            Researchers can email us for limited access for non-commercial work.
          </p>
        </section>

        <section id="tax">
          <h2>19. Taxes</h2>
          <p>
            You are responsible for any taxes (including sales, use, value-added,
            and income tax) that arise from your activity on GrainHub - including
            marketplace sales, freelance jobs found through the service, sponsor
            payments, or membership benefits. We may, where required by law,
            collect and remit applicable sales tax on membership and sponsor fees.
          </p>
        </section>

        <section id="export">
          <h2>20. Export controls and sanctions compliance</h2>
          <p>
            You agree to use GrainHub only in compliance with all applicable U.S.
            export-control laws, including the Export Administration Regulations,
            and U.S. economic-sanctions programs administered by OFAC. You
            represent that you are not located in, organized under the laws of, or
            an ordinary resident of any country or region subject to comprehensive
            U.S. sanctions, and that you are not on any list of restricted or
            sanctioned parties.
          </p>
        </section>

        <section id="general">
          <h2>21. General provisions</h2>
          <p>
            <strong>Entire agreement.</strong> These Terms, together with the
            Privacy Policy and Community Rules, are the entire agreement between
            you and GrainHub regarding the service and supersede any prior or
            contemporaneous agreements between us about the service.
          </p>
          <p>
            <strong>Severability.</strong> If a court finds any part of these
            Terms unenforceable, the rest of the Terms continues in effect.
          </p>
          <p>
            <strong>No waiver.</strong> If we don't enforce a right or provision,
            that's not a waiver of that right or provision.
          </p>
          <p>
            <strong>Assignment.</strong> You can't assign or transfer your account
            or your rights under these Terms without our written consent. We can
            assign these Terms in connection with a merger, acquisition, or sale of
            assets, or to an affiliate, on notice to you.
          </p>
          <p>
            <strong>Force majeure.</strong> We're not liable for delays or failures
            caused by events beyond our reasonable control, including natural
            disasters, hosting outages, attacks, government actions, internet
            failures, or labor disputes.
          </p>
          <p>
            <strong>No third-party beneficiaries.</strong> These Terms don't create
            rights for anyone other than you and GrainHub.
          </p>
          <p>
            <strong>Notices to GrainHub.</strong> Send legal notices to{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with the
            subject "Legal Notice." Notices we send you may go to the email address
            on your account or be posted on the service; either is sufficient.
          </p>
          <p>
            <strong>Headings.</strong> Section headings are for convenience and do
            not affect interpretation of these Terms.
          </p>
          <p>
            <strong>Government use.</strong> If you are a U.S. federal-government
            entity, the service is provided as a "commercial item" under FAR 12 and
            DFARS 227.7202. No additional rights beyond those in these Terms apply.
          </p>
          <p>
            <strong>Consumer Review Fairness Act.</strong> Nothing in these Terms
            restricts your right to post truthful reviews about GrainHub or its
            members. Form contracts that try to penalize honest reviews are
            unenforceable under 15 U.S.C. § 45b, and we don't try.
          </p>
        </section>

        <section id="changes">
          <h2>22. Changes to these Terms</h2>
          <p>
            We may update these Terms when we add features, fix mistakes, or
            respond to legal changes. When we make a substantive change we will
            update the version number above and notify signed-in users so you can
            review the new version. Continued use of GrainHub after a change means
            you accept the updated Terms; if you don't accept them, stop using the
            service and email us.
          </p>
        </section>

        <section id="contact">
          <h2>23. Contact us</h2>
          <p>
            <strong>GrainHub LLC</strong><br />
            Email: <a href="mailto:support@grainhub.com">support@grainhub.com</a>
          </p>
          <p>
            For abuse, harassment, copyright, removal, or privacy requests, use the
            same email with a clear subject line ("Abuse report", "DMCA Notice",
            "Removal request", "Privacy request"). We try to respond within a few
            business days.
          </p>
        </section>

        <p className="legal-friendly">
          GrainHub is a small community platform run for woodworkers. We try to act
          in good faith. If something here looks off, tell us.
        </p>
      </main>
    </div>
  );
}

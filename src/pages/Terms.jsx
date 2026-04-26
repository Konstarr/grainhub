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
            These Terms of Service constitute a binding agreement between you and GrainHub LLC.
            Please read them in their entirety before using the Service.
          </p>
          <div className="legal-meta">
            <span>Effective Date: April 26, 2026</span>
            <span>·</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </header>

      <main className="legal-body">
        <nav className="legal-toc" aria-label="Section list">
          <strong>Contents</strong>
          <ol>
            <li><a href="#s1">1. Definitions</a></li>
            <li><a href="#s2">2. Acceptance; Modification</a></li>
            <li><a href="#s3">3. Eligibility; Accounts</a></li>
            <li><a href="#s4">4. Limited License to User</a></li>
            <li><a href="#s5">5. License from User to Company</a></li>
            <li><a href="#s6">6. User Representations</a></li>
            <li><a href="#s7">7. Acceptable Use</a></li>
            <li><a href="#s8">8. Moderation; Content Removal</a></li>
            <li><a href="#s9">9. Specific Services</a></li>
            <li><a href="#s10">10. Business Profile Claims</a></li>
            <li><a href="#s11">11. Memberships; Sponsorships</a></li>
            <li><a href="#s12">12. Fees; Billing; Refunds</a></li>
            <li><a href="#s13">13. Intellectual Property</a></li>
            <li><a href="#s14">14. DMCA</a></li>
            <li><a href="#s15">15. Privacy</a></li>
            <li><a href="#s16">16. Suspension; Termination</a></li>
            <li><a href="#s17">17. Disclaimer of Warranties</a></li>
            <li><a href="#s18">18. Limitation of Liability</a></li>
            <li><a href="#s19">19. Indemnification</a></li>
            <li><a href="#s20">20. Governing Law; Venue</a></li>
            <li><a href="#s21">21. Informal Resolution</a></li>
            <li><a href="#s22">22. Class Action Waiver</a></li>
            <li><a href="#s23">23. Limitation of Actions</a></li>
            <li><a href="#s24">24. Electronic Communications</a></li>
            <li><a href="#s25">25. Beta Features</a></li>
            <li><a href="#s26">26. No Professional Advice</a></li>
            <li><a href="#s27">27. Third-Party Services</a></li>
            <li><a href="#s28">28. Account Security</a></li>
            <li><a href="#s29">29. Restrictions on Data Use</a></li>
            <li><a href="#s30">30. Taxes</a></li>
            <li><a href="#s31">31. Export Controls; Sanctions</a></li>
            <li><a href="#s32">32. Force Majeure</a></li>
            <li><a href="#s33">33. Assignment</a></li>
            <li><a href="#s34">34. Severability</a></li>
            <li><a href="#s35">35. No Waiver</a></li>
            <li><a href="#s36">36. Entire Agreement</a></li>
            <li><a href="#s37">37. Notices</a></li>
            <li><a href="#s38">38. Government Users</a></li>
            <li><a href="#s39">39. Headings; Interpretation</a></li>
            <li><a href="#s40">40. Survival</a></li>
            <li><a href="#s41">41. Contact</a></li>
          </ol>
        </nav>

        <section id="s1">
          <h2>1. Definitions</h2>
          <p>
            For purposes of these Terms of Service (the "Agreement"), the following capitalized
            terms shall have the meanings set forth below:
          </p>
          <ul>
            <li><strong>"Company,"</strong> "GrainHub," "we," "us," or "our" means GrainHub LLC, a Florida limited liability company, and its officers, members, employees, contractors, agents, successors, and permitted assigns.</li>
            <li><strong>"Service"</strong> means the GrainHub website, mobile interfaces, application programming interfaces, related applications, and all features, content, and functionality made available by the Company under the GrainHub brand.</li>
            <li><strong>"User,"</strong> "you," or "your" means any individual or legal entity that accesses or uses the Service.</li>
            <li><strong>"Account"</strong> means a registered user record on the Service.</li>
            <li><strong>"User Content"</strong> means any text, images, audio, video, code, files, links, profile information, communications, listings, postings, comments, ratings, reviews, or other materials submitted, uploaded, transmitted, or otherwise made available by a User through the Service, including direct messages.</li>
            <li><strong>"Company Content"</strong> means content created or curated by the Company, including news articles, editorial materials, taxonomies, and the Service's design, code, and proprietary databases.</li>
            <li><strong>"Marketplace"</strong> means the Service's online listings forum for goods and services offered by Users.</li>
            <li><strong>"Sponsorship"</strong> means a paid promotional placement purchased from the Company in accordance with Section 11.</li>
            <li><strong>"Business User"</strong> means a User accessing the Service on behalf of a legal entity engaged in a trade or business.</li>
            <li><strong>"Applicable Law"</strong> means all federal, state, and local statutes, regulations, ordinances, and judicial or administrative orders that govern the Company, the User, or the conduct in question.</li>
          </ul>
        </section>

        <section id="s2">
          <h2>2. Acceptance and Modification of Agreement</h2>
          <p>
            <strong>2.1 Binding Effect.</strong> By creating an Account, accessing the Service,
            or otherwise indicating assent (including by clicking an "I agree" or substantially
            similar control), you acknowledge that you have read, understood, and agree to be bound
            by this Agreement, the Privacy Policy, and the Community Rules, each of which is
            incorporated herein by reference.
          </p>
          <p>
            <strong>2.2 Modifications.</strong> The Company reserves the right to modify this
            Agreement at any time. The Company shall notify Users of any material modification
            by posting the revised Agreement on the Service and updating the version number set
            forth above. Continued use of the Service following the effective date of any
            modification constitutes acceptance of the modified Agreement.
          </p>
          <p>
            <strong>2.3 Effective Version.</strong> The version of the Agreement in effect at the
            time of any User action shall govern that action.
          </p>
        </section>

        <section id="s3">
          <h2>3. Eligibility and User Accounts</h2>
          <p>
            <strong>3.1 Minimum Age.</strong> Users must be at least sixteen (16) years of age, or
            the age of majority in the User's jurisdiction (whichever is greater), and legally
            competent to enter into binding contracts.
          </p>
          <p>
            <strong>3.2 No Restricted Persons.</strong> You represent and warrant that you are
            not (a) located in, ordinarily resident in, or a national of any jurisdiction subject
            to comprehensive United States economic sanctions; or (b) included on any restricted
            party list maintained by the U.S. government, the United Nations, or other relevant
            authorities.
          </p>
          <p>
            <strong>3.3 Authority for Entities.</strong> If the User is a legal entity, the
            individual creating or administering the Account represents and warrants that he or
            she has full power and authority to bind the entity to this Agreement.
          </p>
          <p>
            <strong>3.4 Accurate Information.</strong> You shall provide accurate, current, and
            complete information when registering an Account and shall promptly update such
            information as necessary.
          </p>
          <p>
            <strong>3.5 Account Responsibility.</strong> You are solely responsible for all
            activity occurring under your Account and for safeguarding your Account credentials.
            You shall promptly notify the Company of any unauthorized use or suspected breach.
          </p>
        </section>

        <section id="s4">
          <h2>4. Limited License to User</h2>
          <p>
            Subject to your continuing compliance with this Agreement, the Company hereby grants
            you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license
            to access and use the Service for your personal or internal business purposes. This
            license does not include the right to (a) resell or commercially exploit the Service
            or its contents, (b) collect or harvest any data from the Service, (c) use the Service
            in connection with any commercial endeavor not authorized by the Company, or (d)
            modify, adapt, translate, reverse engineer, decompile, or disassemble any portion of
            the Service.
          </p>
        </section>

        <section id="s5">
          <h2>5. License from User to Company in User Content</h2>
          <p>
            <strong>5.1 Grant.</strong> You hereby grant the Company a worldwide, non-exclusive,
            royalty-free, fully paid-up, sublicensable, and transferable license to host, store,
            cache, reproduce, publish, publicly display, publicly perform, transmit, modify (for
            the technical purposes of formatting, scaling, and indexing), create derivative works
            of, distribute, and otherwise use User Content within and in connection with the
            Service, including for the operation, promotion, and improvement of the Service.
          </p>
          <p>
            <strong>5.2 Duration.</strong> The license granted in Section 5.1 continues for so
            long as the User Content is hosted on the Service. The license shall survive
            termination of this Agreement to the extent necessary to (a) maintain backup, audit,
            or compliance copies, (b) defend the Company against legal claims, and (c) preserve
            User Content that has been re-shared, quoted, or otherwise incorporated into other
            Users' content.
          </p>
          <p>
            <strong>5.3 Feedback.</strong> If you submit suggestions, ideas, or feedback regarding
            the Service ("Feedback"), you grant the Company a perpetual, irrevocable, royalty-free,
            worldwide license to use, reproduce, distribute, and exploit such Feedback for any
            purpose without compensation or attribution.
          </p>
          <p>
            <strong>5.4 No Confidentiality.</strong> User Content and Feedback are not deemed
            confidential, and the Company shall have no obligation to treat them as such.
          </p>
        </section>

        <section id="s6">
          <h2>6. User Representations and Warranties</h2>
          <p>You represent and warrant that, with respect to all User Content you submit:</p>
          <ul>
            <li>(a) You are the sole and exclusive owner of all rights in such User Content, or you have all necessary licenses, rights, consents, and permissions from third parties to grant the licenses set forth in Section 5;</li>
            <li>(b) Such User Content does not and will not infringe, misappropriate, or violate any intellectual property right, right of publicity or privacy, or other proprietary right of any third party;</li>
            <li>(c) Such User Content complies with this Agreement and all Applicable Law;</li>
            <li>(d) Such User Content is accurate, not misleading, and not defamatory; and</li>
            <li>(e) Submission and use of such User Content as contemplated by this Agreement does not require payment of any royalty, fee, or other consideration to any third party.</li>
          </ul>
        </section>

        <section id="s7">
          <h2>7. Acceptable Use</h2>
          <p>
            You shall not, and shall not permit any third party to, in connection with the
            Service:
          </p>
          <ul>
            <li>(a) Violate any Applicable Law or any right of any person or entity;</li>
            <li>(b) Submit, post, or transmit User Content that is unlawful, threatening, harassing, defamatory, libelous, fraudulent, obscene, hateful, invasive of privacy, or otherwise objectionable;</li>
            <li>(c) Submit, post, or transmit User Content that depicts, promotes, or facilitates child sexual abuse material; the sexual exploitation of minors; or violence against any individual or group;</li>
            <li>(d) Impersonate any person or entity, falsely claim affiliation with the Company or any other person or entity, or misrepresent any material fact;</li>
            <li>(e) Engage in spamming, fraudulent advertising, deceptive Marketplace listings, fake job postings, or any other deceptive commercial practice;</li>
            <li>(f) Attempt to gain unauthorized access to the Service, other Accounts, computer systems, or networks connected to the Service;</li>
            <li>(g) Use any robot, spider, scraper, or other automated means to access the Service for any purpose without the Company's express prior written consent;</li>
            <li>(h) Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Service;</li>
            <li>(i) Interfere with or disrupt the Service, including by introducing malware, viruses, worms, denial-of-service attacks, or other harmful code;</li>
            <li>(j) Circumvent, disable, or interfere with security-related features of the Service or features that prevent or restrict use or copying of any content;</li>
            <li>(k) Resell, sublicense, or otherwise commercially exploit access to the Service or any User Content without authorization;</li>
            <li>(l) Use the Service to develop, train, or evaluate any machine-learning model, artificial-intelligence system, or competing service;</li>
            <li>(m) Engage in any activity that places an unreasonable load on the Service's infrastructure, including excessive requests or bulk data extraction;</li>
            <li>(n) Operate multiple Accounts to evade enforcement, manipulate engagement metrics, or distort moderation outcomes; or</li>
            <li>(o) Use the Service in any manner inconsistent with this Agreement, the Privacy Policy, or the Community Rules.</li>
          </ul>
        </section>

        <section id="s8">
          <h2>8. Moderation; Content Removal</h2>
          <p>
            <strong>8.1 Editorial Discretion.</strong> The Company is an interactive computer
            service within the meaning of Section 230 of the Communications Decency Act (47
            U.S.C. § 230). The Company is not the publisher or speaker of User Content. The
            Company nevertheless reserves the right, but not the obligation, to monitor,
            review, edit, restrict, refuse, remove, or disable access to any User Content, in
            whole or in part, at its sole discretion and without notice.
          </p>
          <p>
            <strong>8.2 Provider Access.</strong> The Company may access, copy, and retain User
            Content, including private communications, where the Company reasonably determines
            that such access is necessary to (a) operate, maintain, or improve the Service, (b)
            investigate suspected violations of this Agreement or Applicable Law, (c) respond to
            legal process or governmental requests, (d) protect the rights, property, or safety
            of the Company, its Users, or others, or (e) defend against legal claims. By using
            the Service, you consent under 18 U.S.C. § 2702(b)(3) and applicable state law to
            such access by the Company in its capacity as the provider of an electronic
            communications service.
          </p>
          <p>
            <strong>8.3 Good-Faith Immunity.</strong> Any moderation, removal, or restriction
            action taken by the Company shall be deemed taken voluntarily and in good faith
            within the meaning of 47 U.S.C. § 230(c)(2)(A).
          </p>
        </section>

        <section id="s9">
          <h2>9. Specific Services</h2>
          <p>
            <strong>9.1 Forums.</strong> The Service includes discussion forums populated with
            User Content. Forum content is visible to authenticated Users. The Company makes no
            representations as to the accuracy of forum content.
          </p>
          <p>
            <strong>9.2 Wiki.</strong> The Service includes a collaboratively edited reference
            ("Wiki"). By contributing, you authorize other Users to edit, modify, or remove your
            contributions. Wiki content is provided strictly for general informational purposes
            and may contain inaccuracies. The Company disclaims all liability arising from
            reliance on Wiki content.
          </p>
          <p>
            <strong>9.3 News.</strong> The Service includes editorial materials prepared by the
            Company or its approved contributors. The Company shall correct material factual
            errors brought to its attention.
          </p>
          <p>
            <strong>9.4 Marketplace.</strong> The Marketplace is an online listings facility
            only. The Company is not a party to, nor a guarantor of, any transaction conducted
            between Users. The Company does not (a) take title to any goods or services listed,
            (b) handle payments, escrow, shipping, returns, refunds, or warranties, (c) verify
            the identity of any User, the accuracy of any listing, the legal right of any User
            to sell any item, or the suitability of any item for any purpose, or (d) collect or
            remit sales, use, or other transaction taxes on Users' behalf. Users transact at
            their own risk and are solely responsible for compliance with Applicable Law.
          </p>
          <p>
            <strong>9.5 Job Board.</strong> The Service permits Users to post and respond to
            employment opportunities. The Company is not the employer of any individual whose
            employment results from a Service posting and assumes no responsibility for
            recruitment, screening, hiring, employment-eligibility verification, payroll, taxes,
            workplace safety, or any other obligation arising from any employment relationship.
            Posters of employment opportunities shall comply with all Applicable Law, including
            non-discrimination requirements.
          </p>
          <p>
            <strong>9.6 Suppliers Directory.</strong> The Service includes an informational
            directory of trade suppliers. Inclusion in the directory does not constitute
            endorsement by the Company.
          </p>
          <p>
            <strong>9.7 Events.</strong> The Service permits the listing of in-person and
            virtual events. The Company does not host or organize third-party events and
            disclaims all liability arising from any event, including injury, property damage,
            cancellation, refund disputes, and the conduct of attendees or organizers.
            Attendance at any event is at the User's own risk.
          </p>
          <p>
            <strong>9.8 Communities.</strong> The Service permits Users to create and
            administer subgroups ("Communities"). Community owners and moderators operate
            their Communities subject to this Agreement and the Community Rules. The Company
            may intervene in a Community to enforce this Agreement or Applicable Law. An owner
            of a Community shall transfer ownership prior to leaving the Community.
          </p>
          <p>
            <strong>9.9 Direct Messages.</strong> The Service supports private messaging
            between Users. Direct messages are not end-to-end encrypted. The Company may
            access direct messages as set forth in Section 8.2.
          </p>
        </section>

        <section id="s10">
          <h2>10. Business Profile Claims</h2>
          <p>
            A Business User may claim and assume control of a previously unmanaged business
            profile by submitting verification from a domain or contact channel reasonably
            associated with the business. The Company reserves the right to require additional
            documentation, to deny any claim, or to revoke any claim that was procured by
            misrepresentation. The Company shall, on written request from a Business User,
            review and remove or correct material associated with that business that is alleged
            to be inaccurate or unauthorized, in the Company's reasonable discretion.
          </p>
        </section>

        <section id="s11">
          <h2>11. Memberships and Sponsorships</h2>
          <p>
            <strong>11.1 Memberships.</strong> The Company offers paid memberships that unlock
            additional features for individual and Business Users.
          </p>
          <p>
            <strong>11.2 Sponsorships.</strong> The Company offers Sponsorships to Business
            Users. Sponsorship placements are clearly identified as such and do not influence
            the Company's editorial or moderation decisions. Sponsors do not receive Users'
            personal information.
          </p>
          <p>
            <strong>11.3 No Third-Party Advertising.</strong> The Company does not run
            third-party advertising networks on the Service and does not sell, rent, lease, or
            trade Users' personal information.
          </p>
        </section>

        <section id="s12">
          <h2>12. Fees; Billing; Refunds</h2>
          <p>
            <strong>12.1 Fees.</strong> Membership and Sponsorship fees are listed on the
            Service and may be modified prospectively by the Company.
          </p>
          <p>
            <strong>12.2 Auto-Renewal.</strong> Recurring charges renew automatically at the
            then-current rate at the start of each billing period until cancelled by the User
            in accordance with the cancellation procedure in the User's account settings.
          </p>
          <p>
            <strong>12.3 Refunds.</strong> Except where required by Applicable Law, all fees
            are non-refundable.
          </p>
          <p>
            <strong>12.4 Failed Payment.</strong> If a payment fails, the Company may suspend
            or terminate the affected Account or feature without liability.
          </p>
          <p>
            <strong>12.5 Taxes.</strong> Stated fees are exclusive of applicable sales, use,
            value-added, or similar taxes. The User is responsible for all such taxes other
            than those based on the Company's net income.
          </p>
        </section>

        <section id="s13">
          <h2>13. Intellectual Property of the Company</h2>
          <p>
            The Service, Company Content, and all intellectual property rights therein are and
            shall remain the exclusive property of the Company and its licensors. Except for the
            limited license expressly granted in Section 4, no rights are granted to you, by
            implication, estoppel, or otherwise, in or to the Service or Company Content. The
            "GrainHub" name, logo, and all related marks are trademarks of the Company. You shall
            not use the Company's trademarks except as expressly authorized in writing.
          </p>
        </section>

        <section id="s14">
          <h2>14. Digital Millennium Copyright Act</h2>
          <p>
            <strong>14.1 Notice.</strong> The Company complies with the Digital Millennium
            Copyright Act, 17 U.S.C. § 512 ("DMCA"). A copyright owner who believes that User
            Content infringes its copyright may submit a notice to{' '}
            <a href="mailto:support@grainhub.com">support@grainhub.com</a> with the subject line
            "DMCA Notice" containing all elements required by 17 U.S.C. § 512(c)(3).
          </p>
          <p>
            <strong>14.2 Counter-Notice.</strong> A User whose content has been removed pursuant
            to a DMCA notice may submit a counter-notice containing all elements required by 17
            U.S.C. § 512(g)(3).
          </p>
          <p>
            <strong>14.3 Repeat Infringers.</strong> The Company shall terminate, in
            appropriate circumstances, the Accounts of Users who are repeat infringers.
          </p>
        </section>

        <section id="s15">
          <h2>15. Privacy</h2>
          <p>
            The Company's collection, use, and disclosure of personal information are governed
            by the <Link to="/privacy">Privacy Policy</Link>, which is incorporated into this
            Agreement by reference.
          </p>
        </section>

        <section id="s16">
          <h2>16. Suspension and Termination</h2>
          <p>
            <strong>16.1 Termination by User.</strong> A User may close his or her Account at
            any time by following the procedure in account settings or by submitting a written
            request to the Company.
          </p>
          <p>
            <strong>16.2 Termination by Company.</strong> The Company may suspend or terminate
            access to the Service, in whole or in part, with or without notice, for any reason,
            including (a) breach of this Agreement, (b) violation of Applicable Law, (c)
            inactivity exceeding twenty-four (24) months, (d) risk to the Service or its Users,
            or (e) the Company's discretionary discontinuation of any feature.
          </p>
          <p>
            <strong>16.3 Effect of Termination.</strong> Upon termination, the User's right to
            access the Service ceases, and the Company may delete the User's Account and User
            Content, subject to retention permitted in Section 5.2 and the Privacy Policy.
            Sections that by their nature should survive termination (including Sections 5
            through 8, 13, 17 through 23, and 33 through 41) shall survive.
          </p>
        </section>

        <section id="s17">
          <h2>17. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE, INCLUDING ALL COMPANY CONTENT AND USER CONTENT, IS PROVIDED ON AN "AS
            IS" AND "AS AVAILABLE" BASIS, WITH ALL FAULTS, AND WITHOUT WARRANTY OF ANY KIND. TO
            THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY EXPRESSLY DISCLAIMS ALL
            WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING, WITHOUT
            LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            TITLE, NON-INFRINGEMENT, ACCURACY, AND QUIET ENJOYMENT, AND ANY WARRANTIES ARISING
            FROM COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE, OR TRADE PRACTICE. WITHOUT
            LIMITING THE FOREGOING, THE COMPANY DOES NOT WARRANT THAT THE SERVICE WILL MEET YOUR
            REQUIREMENTS, OPERATE WITHOUT INTERRUPTION OR ERROR, BE SECURE, OR BE FREE OF
            VIRUSES OR OTHER HARMFUL COMPONENTS. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON
            IMPLIED WARRANTIES, IN WHICH CASE THE FOREGOING DISCLAIMERS SHALL APPLY TO THE
            FULLEST EXTENT PERMITTED.
          </p>
        </section>

        <section id="s18">
          <h2>18. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY OR
            ITS OFFICERS, MEMBERS, EMPLOYEES, CONTRACTORS, OR AGENTS BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS
            OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF
            OR RELATING TO THIS AGREEMENT, THE SERVICE, OR ANY USER CONTENT, WHETHER BASED ON
            CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHER LEGAL THEORY, AND
            WHETHER OR NOT THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            IN ANY EVENT, THE COMPANY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS
            AGREEMENT OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY
            YOU TO THE COMPANY DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO
            LIABILITY, OR (B) ONE HUNDRED U.S. DOLLARS (US $100). THE PARTIES AGREE THAT THIS
            LIMITATION REFLECTS A REASONABLE ALLOCATION OF RISK BETWEEN THE PARTIES AND IS A
            BARGAINED-FOR ELEMENT OF THIS AGREEMENT. SOME JURISDICTIONS DO NOT ALLOW THE
            EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, IN WHICH CASE THE FOREGOING LIMITATIONS
            SHALL APPLY TO THE FULLEST EXTENT PERMITTED.
          </p>
        </section>

        <section id="s19">
          <h2>19. Indemnification</h2>
          <p>
            You shall defend, indemnify, and hold harmless the Company, its affiliates, and
            their respective officers, members, employees, contractors, and agents (the
            "Indemnitees") from and against any and all claims, demands, suits, actions,
            damages, liabilities, losses, settlements, judgments, costs, and expenses (including
            reasonable attorneys' fees and litigation costs) arising out of or relating to (a)
            your User Content; (b) your access to or use of the Service; (c) your breach or
            alleged breach of this Agreement, the Privacy Policy, or the Community Rules; (d)
            your violation of Applicable Law or any right of any third party; or (e) any dispute
            between you and any other User or third party. The Company reserves the right to
            assume the exclusive defense and control of any matter otherwise subject to your
            indemnification, in which event you shall cooperate with the Company's defense.
          </p>
        </section>

        <section id="s20">
          <h2>20. Governing Law; Venue</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the
            State of Florida, without giving effect to any conflict-of-laws principles that
            would require the application of the laws of another jurisdiction. The United
            Nations Convention on Contracts for the International Sale of Goods shall not apply.
            The exclusive jurisdiction and venue for any action arising out of or relating to
            this Agreement that is not subject to arbitration shall lie in the state and federal
            courts located in the county of the Company's principal place of business in
            Florida, and the parties consent to personal jurisdiction in such courts.
          </p>
        </section>

        <section id="s21">
          <h2>21. Mandatory Informal Resolution</h2>
          <p>
            Prior to initiating any formal proceeding, the parties shall attempt in good faith
            to resolve any dispute by sending a written notice describing the dispute and
            proposed resolution to the opposing party at the address set forth in Section 41.
            The parties shall have sixty (60) days from receipt of such notice to resolve the
            dispute informally. The applicable limitation period shall be tolled during such
            period.
          </p>
        </section>

        <section id="s22">
          <h2>22. Class Action Waiver</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, EACH PARTY MAY BRING CLAIMS
            AGAINST THE OTHER ONLY IN SUCH PARTY'S INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF
            OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, REPRESENTATIVE, OR CONSOLIDATED
            ACTION. UNLESS BOTH PARTIES AGREE OTHERWISE IN WRITING, NO COURT MAY CONSOLIDATE
            MORE THAN ONE PERSON'S CLAIMS.
          </p>
        </section>

        <section id="s23">
          <h2>23. Limitation of Actions</h2>
          <p>
            ANY CAUSE OF ACTION ARISING OUT OF OR RELATING TO THIS AGREEMENT OR THE SERVICE
            MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES.
            THEREAFTER, SUCH CAUSE OF ACTION IS PERMANENTLY BARRED.
          </p>
        </section>

        <section id="s24">
          <h2>24. Electronic Communications; SMS Consent</h2>
          <p>
            <strong>24.1 Electronic Records.</strong> You consent to receive communications from
            the Company in electronic form and agree that all agreements, notices, disclosures,
            and other communications provided electronically satisfy any requirement that such
            communications be in writing.
          </p>
          <p>
            <strong>24.2 Transactional Communications.</strong> You consent to receive
            transactional emails relating to your Account and the Service. Such emails are not
            optional.
          </p>
          <p>
            <strong>24.3 SMS.</strong> If you provide a mobile telephone number, you consent
            under the Telephone Consumer Protection Act and analogous state laws to receive
            account-related text messages, including those sent using automated technology.
            Standard message and data rates may apply. You may opt out of non-essential SMS by
            replying STOP; doing so may limit account-recovery functionality.
          </p>
        </section>

        <section id="s25">
          <h2>25. Beta and Experimental Features</h2>
          <p>
            From time to time the Company may make experimental features available to Users
            (each a "Beta Feature"). Beta Features are provided "AS IS" and may be modified,
            suspended, or discontinued at the Company's discretion. The Company makes no
            representations or warranties regarding any Beta Feature, and the Company shall have
            no liability arising from your use of any Beta Feature.
          </p>
        </section>

        <section id="s26">
          <h2>26. No Professional Advice</h2>
          <p>
            User Content and Wiki content do not constitute professional advice, including
            legal, financial, medical, engineering, occupational-safety, or building-code
            advice. You shall not rely on User Content as a substitute for the advice of a
            qualified professional or for compliance with manufacturer instructions, building
            codes, OSHA standards, or other Applicable Law.
          </p>
        </section>

        <section id="s27">
          <h2>27. Third-Party Services and Links</h2>
          <p>
            The Service may include links to or integrations with third-party websites, products,
            or services. The Company does not control, endorse, or assume responsibility for
            third-party services. Your interactions with third-party services are governed by
            the terms and policies of those third parties.
          </p>
        </section>

        <section id="s28">
          <h2>28. Account Security; No Account Sharing</h2>
          <p>
            Each Account is intended for use by a single individual or, in the case of a
            Business User, a single legal entity acting through its authorized representative.
            You shall not share Account credentials with any other person. Suspected credential
            sharing may result in suspension or termination.
          </p>
        </section>

        <section id="s29">
          <h2>29. Restrictions on Data Use; AI Training</h2>
          <p>
            Without the Company's express prior written consent, you shall not use the Service
            or its contents to train, fine-tune, evaluate, benchmark, or otherwise develop any
            machine-learning model, artificial-intelligence system, or competing service, nor
            shall you assemble any dataset derived from the Service for sale, license, or
            distribution. Bulk export, scraping, and undisclosed automated access are
            prohibited.
          </p>
        </section>

        <section id="s30">
          <h2>30. Taxes</h2>
          <p>
            You are solely responsible for all taxes, duties, levies, and similar charges
            (including sales, use, value-added, employment, and income taxes) arising from your
            activity on or in connection with the Service. Where required by Applicable Law,
            the Company may collect and remit applicable transaction taxes on Memberships and
            Sponsorships.
          </p>
        </section>

        <section id="s31">
          <h2>31. Export Controls; Sanctions</h2>
          <p>
            You shall comply with all Applicable Law relating to export controls and economic
            sanctions, including the U.S. Export Administration Regulations and regulations
            administered by the Office of Foreign Assets Control. You represent and warrant
            that you are not located in, ordinarily resident in, or organized under the laws
            of any jurisdiction subject to comprehensive U.S. sanctions, and that you are not
            on any restricted-party list.
          </p>
        </section>

        <section id="s32">
          <h2>32. Force Majeure</h2>
          <p>
            The Company shall not be liable for any delay or failure to perform resulting from
            causes beyond its reasonable control, including acts of God, natural disasters,
            pandemics, war, terrorism, civil unrest, governmental action, labor disputes,
            internet or hosting outages, denial-of-service attacks, or failures of suppliers
            (each a "Force Majeure Event").
          </p>
        </section>

        <section id="s33">
          <h2>33. Assignment</h2>
          <p>
            You shall not assign, delegate, or transfer this Agreement, your Account, or any
            rights or obligations hereunder, by operation of law or otherwise, without the
            Company's prior written consent. Any attempted assignment in violation of this
            Section is void. The Company may assign this Agreement, in whole or in part,
            without consent, including in connection with a merger, acquisition, sale of all or
            substantially all of its assets, or to an affiliate. This Agreement binds and
            inures to the benefit of the parties and their permitted successors and assigns.
          </p>
        </section>

        <section id="s34">
          <h2>34. Severability</h2>
          <p>
            If any provision of this Agreement is held to be invalid, illegal, or unenforceable
            by a court of competent jurisdiction, such provision shall be modified to the
            minimum extent necessary to render it enforceable, or, if no such modification is
            possible, severed from this Agreement, and the remaining provisions shall continue
            in full force and effect.
          </p>
        </section>

        <section id="s35">
          <h2>35. No Waiver</h2>
          <p>
            No failure or delay by the Company in exercising any right under this Agreement
            shall operate as a waiver of that right, nor shall any single or partial exercise
            preclude any further exercise. Any waiver must be in writing and signed by an
            authorized representative of the Company.
          </p>
        </section>

        <section id="s36">
          <h2>36. Entire Agreement</h2>
          <p>
            This Agreement, together with the Privacy Policy and the Community Rules,
            constitutes the entire agreement between the parties relating to the Service and
            supersedes all prior or contemporaneous understandings, communications, and
            agreements, whether oral or written, regarding the same subject matter.
          </p>
        </section>

        <section id="s37">
          <h2>37. Notices</h2>
          <p>
            <strong>37.1 Notices to the Company.</strong> Legal notices to the Company shall be
            sent to <a href="mailto:support@grainhub.com">support@grainhub.com</a> with the
            subject line "Legal Notice." Notice shall be deemed given upon delivery.
          </p>
          <p>
            <strong>37.2 Notices to the User.</strong> The Company may provide notices to the
            User by email to the address associated with the User's Account, by posting on the
            Service, or by such other means as the Company reasonably elects. Such notice shall
            be deemed given upon transmission or posting, as applicable.
          </p>
        </section>

        <section id="s38">
          <h2>38. Government Users</h2>
          <p>
            If the Service is provided to or used by a U.S. federal-government entity, the
            Service is a "commercial item" as defined in 48 C.F.R. § 2.101 and is licensed in
            accordance with the rights set forth in this Agreement, consistent with FAR 12.212
            and DFARS 227.7202.
          </p>
        </section>

        <section id="s39">
          <h2>39. Headings; Interpretation</h2>
          <p>
            Section headings are inserted for convenience of reference only and do not affect
            the interpretation of this Agreement. The terms "include," "includes," and
            "including" shall be construed as if followed by "without limitation." References
            to a statute or regulation shall include any successor enactment.
          </p>
        </section>

        <section id="s40">
          <h2>40. Survival</h2>
          <p>
            All provisions of this Agreement that by their nature should survive termination,
            including provisions relating to ownership, warranty disclaimers, indemnification,
            limitation of liability, dispute resolution, and miscellaneous, shall survive the
            termination or expiration of this Agreement.
          </p>
        </section>

        <section id="s41">
          <h2>41. Contact Information</h2>
          <p>
            <strong>GrainHub LLC</strong><br />
            Florida, United States<br />
            Email: <a href="mailto:support@grainhub.com">support@grainhub.com</a>
          </p>
        </section>
      </main>
    </div>
  );
}

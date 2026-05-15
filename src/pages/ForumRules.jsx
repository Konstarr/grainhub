import { Link } from 'react-router-dom';
import PageBack from '../components/shared/PageBack.jsx';
import '../styles/forumRules.css';

const EFFECTIVE_DATE = 'April 25, 2026';

export default function ForumRules() {
  return (
    <>
      <PageBack
        backTo="/forums"
        backLabel="Back to Forums"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Forums', to: '/forums' },
          { label: 'Forum Rules' },
        ]}
      />
      <div className="rules-wrap">
        <header className="rules-header">
          <div className="rules-eyebrow">Community standards</div>
          <h1 className="rules-title">AWI Florida Chapter Forum Rules &amp; Code of Conduct</h1>
          <p className="rules-effective">Effective {EFFECTIVE_DATE}</p>
        </header>

        <div className="rules-card">
          <p className="rules-lead">
            By posting, replying, or otherwise participating in any AWI Florida Chapter
            community space (including forums, communities, comments, profile
            content, and direct messages — collectively, the &ldquo;Forum&rdquo;),
            you agree to these Rules and to the AWI Florida Chapter Terms of Service.
            These Rules supplement, and do not replace, the Terms of Service.
            If anything below conflicts with the Terms of Service, the Terms
            of Service control.
          </p>

          <Section n="1." title="Acceptance of these Rules">
            <p>
              Your use of the Forum constitutes acceptance of these Rules.
              AWI Florida Chapter may revise these Rules at any time without prior notice.
              Continued use after changes are posted means you accept the
              revised Rules. If you do not agree to any part of the Rules,
              do not use the Forum.
            </p>
          </Section>

          <Section n="2." title="Account responsibility">
            <p>
              You are responsible for all activity on your account. Keep your
              login credentials secure and notify AWI Florida Chapter immediately if you
              suspect unauthorized access. You may not share, sell, or transfer
              your account, and you may not create multiple accounts to evade
              moderation, manipulate votes or reputation, or appear as different
              users.
            </p>
          </Section>

          <Section n="3." title="Prohibited content and conduct">
            <p>The following are not permitted on the Forum:</p>
            <ul>
              <li>
                <strong>Illegal content or activity.</strong> Anything that
                violates U.S. federal, state, or local law, or applicable laws
                of your jurisdiction.
              </li>
              <li>
                <strong>Harassment, threats, or hate speech.</strong> Targeted
                attacks, slurs, or content that demeans a person or group based
                on race, ethnicity, religion, gender, gender identity, sexual
                orientation, disability, age, or veteran status.
              </li>
              <li>
                <strong>Doxxing and privacy violations.</strong> Posting another
                person&rsquo;s private information (address, phone, employer,
                etc.) without their consent. Do not impersonate other users,
                staff, or third parties.
              </li>
              <li>
                <strong>Sexual content involving minors</strong> or any content
                that sexualizes anyone under 18. This is grounds for immediate,
                permanent removal and a report to the appropriate authorities.
              </li>
              <li>
                <strong>Violence, self-harm, and incitement.</strong> Content
                that promotes violence against people or groups, encourages
                self-harm, or incites others to commit unlawful acts.
              </li>
              <li>
                <strong>Spam, scams, and phishing.</strong> Unsolicited
                advertising, chain posts, link schemes, fraudulent solicitations,
                multi-level marketing, or attempts to harvest credentials or
                payment information.
              </li>
              <li>
                <strong>Off-topic promotion.</strong> Self-promotion outside
                permitted channels. AWI Florida Chapter offers a paid sponsorship program
                for advertising; promotional posts in regular forum threads
                may be removed.
              </li>
              <li>
                <strong>Intellectual property infringement.</strong> Posting
                copyrighted material, trademarks, trade secrets, or proprietary
                technical information without authorization.
              </li>
              <li>
                <strong>Malware, exploits, and platform abuse.</strong> Any
                attempt to disrupt the Forum, bypass security or rate limits,
                scrape user data at scale, or distribute malicious code.
              </li>
              <li>
                <strong>Vote and reputation manipulation.</strong> Coordinated
                upvoting, sockpuppeting, brigading, or any artificial means of
                influencing reputation, badges, or thread visibility.
              </li>
              <li>
                <strong>Circumvention of moderation.</strong> Evading bans,
                using altered words to defeat the language filter, or
                ban-evasion alt accounts.
              </li>
            </ul>
          </Section>

          <Section n="4." title="User-generated content; license to AWI Florida Chapter">
            <p>
              You retain ownership of the content you post. By posting on the
              Forum, you grant AWI Florida Chapter a worldwide, non-exclusive, royalty-free,
              transferable, sub-licensable license to host, store, reproduce,
              modify (for example, for moderation, formatting, or display),
              create derivative works of, distribute, and publicly display
              your content for the purposes of operating, promoting, and
              improving the Forum.
            </p>
            <p>
              You represent and warrant that you have all rights necessary to
              grant this license, and that your content does not violate the
              rights of any third party.
            </p>
          </Section>

          <Section n="5." title="Enforcement and disciplinary action">
            <p>
              AWI Florida Chapter moderators, administrators, and the platform owner may,
              at their sole discretion and without prior notice, take any of
              the following actions against accounts or content that violate
              these Rules, the Terms of Service, or applicable law:
            </p>
            <ul>
              <li>
                <strong>Warning.</strong> A formal notice that conduct violated
                the Rules. Warnings are recorded on your account.
              </li>
              <li>
                <strong>Content removal or editing.</strong> Threads, posts,
                images, or other content may be edited, hidden, or deleted.
                Edits may be made for clarity, formatting, or to remove
                policy-violating material.
              </li>
              <li>
                <strong>Lock or close.</strong> Threads may be locked to
                prevent further replies or closed entirely.
              </li>
              <li>
                <strong>Feature restrictions.</strong> Posting, reply, upload,
                direct-message, or community-creation privileges may be
                temporarily or permanently restricted.
              </li>
              <li>
                <strong>Temporary suspension.</strong> Your account may be
                suspended from accessing the Forum for a defined period.
              </li>
              <li>
                <strong>Permanent ban.</strong> Your account may be permanently
                disabled and you may be prohibited from creating new accounts
                or accessing the Forum in any form.
              </li>
              <li>
                <strong>Referral to authorities.</strong> Conduct that may be
                criminal, including but not limited to threats, fraud, child
                exploitation, or stalking, may be reported to law enforcement,
                with cooperation including production of account information,
                IP addresses, and content.
              </li>
            </ul>
            <p>
              Severity of action depends on the nature of the violation, the
              user&rsquo;s history, harm to other users or the community, and
              AWI Florida Chapter&rsquo;s legal obligations. A single severe violation
              (for example, threats of violence, doxxing, or content involving
              minors) may result in immediate permanent ban without prior
              warning. <strong>No refund</strong> of any subscription, sponsorship,
              or other paid feature will be issued for accounts terminated
              under this Section.
            </p>
          </Section>

          <Section n="6." title="Reporting">
            <p>
              If you encounter content or behavior that violates these Rules,
              use the <strong>Report</strong> button on the offending thread,
              post, or profile. Reports are reviewed by moderators and
              administrators. Reporting in bad faith — for example, mass-reporting
              to harass another user — is itself a violation of these Rules.
            </p>
          </Section>

          <Section n="7." title="Appeals">
            <p>
              If your account has been actioned and you believe it was in
              error, you may appeal once per action by contacting{' '}
              <a href="mailto:appeals@millwork.io.io">appeals@millwork.io.io</a>{' '}
              within fourteen (14) days of the action. Include your username,
              the action taken, and the basis for appeal. Decisions on appeal
              are final.
            </p>
          </Section>

          <Section n="8." title="No warranty; limitation of liability">
            <p>
              The Forum is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, express or
              implied. AWI Florida Chapter does not endorse, verify, or guarantee the
              accuracy, completeness, or usefulness of user-generated content.
              Reliance on any information posted is solely at your own risk.
            </p>
            <p>
              To the maximum extent permitted by law, AWI Florida Chapter, its officers,
              directors, employees, and contractors shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, including loss of profits, data, business opportunities,
              or goodwill, arising out of or in connection with your use of
              the Forum or any moderation action taken under these Rules.
            </p>
          </Section>

          <Section n="9." title="Indemnification">
            <p>
              You agree to indemnify and hold harmless AWI Florida Chapter and its
              affiliates from any claims, damages, losses, liabilities, costs,
              or expenses (including reasonable attorneys&rsquo; fees) arising
              from your content, your violation of these Rules, your violation
              of any third-party right (including intellectual property or
              privacy rights), or your violation of any applicable law.
            </p>
          </Section>

          <Section n="10." title="Changes to these Rules">
            <p>
              AWI Florida Chapter reserves the right to modify these Rules at any time.
              The current version is always available at this URL. Material
              changes will be noted via a banner on the Forums page or via
              email to registered users. Your continued participation after
              changes are posted constitutes acceptance.
            </p>
          </Section>

          <Section n="11." title="Contact">
            <p>
              Moderation questions, abuse reports outside the in-app reporting
              flow, DMCA notices, and law-enforcement requests may be sent to{' '}
              <a href="mailto:legal@millwork.io.io">legal@millwork.io.io</a>.
            </p>
          </Section>

          <p className="rules-footer">
            By using the Forum you acknowledge that you have read, understood,
            and agree to be bound by these Rules. If you have not read them,
            please do so now before posting.
            {' '}
            <Link to="/forums" className="rules-back-link">Back to Forums →</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="rules-section">
      <h2 className="rules-section-title">
        <span className="rules-section-num">{n}</span> {title}
      </h2>
      <div className="rules-section-body">{children}</div>
    </section>
  );
}

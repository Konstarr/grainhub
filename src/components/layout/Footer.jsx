import Logo from './Logo.jsx';

const FOOTER_COLS = [
  {
    heading: 'Community',
    links: ['Forums', 'Industry Wiki', 'News & Analysis', 'Events Calendar', 'Member Directory'],
  },
  {
    heading: 'Marketplace',
    links: ['Machinery Listings', 'Job Board', 'Supplier Directory', 'Post a Listing', 'List Your Shop'],
  },
  {
    heading: 'Resources',
    links: ['Estimating Templates', 'Standards Library', 'Species Database', 'Training Guides', 'Newsletter'],
  },
  {
    heading: 'Company',
    links: ['About GrainHub', 'Advertise / Sponsor', 'Media Kit', 'Contact', 'Privacy Policy'],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo as="div" size={32} style={{ margin: 0 }} />
          <p>
            The modern community platform for millwork and cabinet industry professionals.
            Built by makers, for makers.
          </p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.heading} className="footer-col">
            <h4>{col.heading}</h4>
            {col.links.map((link) => (
              <a key={link} href="#">
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© 2025 GrainHub LLC. All rights reserved.</span>
        <span>
          <a href="#">Terms of Service</a> &nbsp;·&nbsp; <a href="#">Privacy</a> &nbsp;·&nbsp;{' '}
          <a href="#">Cookie Policy</a>
        </span>
      </div>
    </footer>
  );
}

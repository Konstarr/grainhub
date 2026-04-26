import Logo from './Logo.jsx';
import { Link } from 'react-router-dom';

const FOOTER_COLS = [
  {
    heading: 'Community',
    links: [
      { label: 'Forums', to: '/forums' },
      { label: 'Industry Wiki', to: '/wiki' },
      { label: 'News & Analysis', to: '/news' },
      { label: 'Events Calendar', to: '/events' },
      { label: 'Member Directory', to: '/suppliers' },
    ],
  },
  {
    heading: 'Marketplace',
    links: [
      { label: 'Machinery Listings', to: '/marketplace' },
      { label: 'Job Board', to: '/jobs' },
      { label: 'Supplier Directory', to: '/suppliers' },
      { label: 'Post a Listing', to: '/sponsor' },
      { label: 'List Your Shop', to: '/sponsor' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Estimating Templates', to: '/wiki' },
      { label: 'Standards Library', to: '/wiki' },
      { label: 'Species Database', to: '/wiki' },
      { label: 'Training Guides', to: '/wiki' },
      { label: 'Newsletter', to: '/signup' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About GrainHub', to: '/' },
      { label: 'Advertise / Sponsor', to: '/sponsor' },
      { label: 'Media Kit', to: '/sponsor' },
      { label: 'Contact', to: '/sponsor' },
      { label: 'Community Rules', to: '/community-rules' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
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
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} GrainHub LLC. All rights reserved.</span>
        <span>
          <Link to="/terms">Terms of Service</Link> &nbsp;·&nbsp;{' '}
          <Link to="/privacy">Privacy</Link> &nbsp;·&nbsp;{' '}
          <Link to="/community-rules">Community Rules</Link>
        </span>
      </div>
    </footer>
  );
}

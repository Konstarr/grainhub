import Logo from './Logo.jsx';
import { Link } from 'react-router-dom';

const FOOTER_COLS = [
  {
    heading: 'Chapter',
    links: [
      { label: 'Membership',        to: '/membership' },
      { label: 'Member Directory',  to: '/suppliers' },
      { label: 'Events Calendar',   to: '/events' },
      { label: 'News',              to: '/news' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Forums',            to: '/forums' },
      { label: 'Resources',         to: '/wiki' },
      { label: 'Forum Rules',       to: '/community-rules' },
    ],
  },
  {
    heading: 'About AWI',
    links: [
      { label: 'AWI National',      href: 'https://www.awinet.org' },
      { label: 'QCP Program',       href: 'https://qcp.org' },
      { label: 'Architectural Woodwork Standards', href: 'https://www.awinet.org/aws' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service',  to: '/terms' },
      { label: 'Privacy Policy',    to: '/privacy' },
      { label: 'Community Rules',   to: '/community-rules' },
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
            The official online home of the AWI Florida Chapter — the Florida region of the
            Architectural Woodwork Institute. Built for our members, by our members.
          </p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.heading} className="footer-col">
            <h4>{col.heading}</h4>
            {col.links.map((link) => (
              link.href ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              )
            ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AWI Florida Chapter. All rights reserved.</span>
        <span>
          AWI Florida Chapter is the Florida regional chapter of the{' '}
          <a href="https://www.awinet.org" target="_blank" rel="noopener noreferrer">Architectural Woodwork Institute</a>.
        </span>
      </div>
    </footer>
  );
}

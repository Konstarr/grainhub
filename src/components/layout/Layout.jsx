import { Outlet } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import SponsorStrip from './SponsorStrip.jsx';
import ScrollToTop from '../shared/ScrollToTop.jsx';

/**
 * SecondaryNav has been retired site-wide. Each page now provides its
 * own context-appropriate navigation (search hero, filter sidebar,
 * cluster grid, etc.) rather than relying on a single one-size-fits-all
 * white strip below the main nav.
 */
export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <Outlet />
      <SponsorStrip />
      <Footer />
    </>
  );
}

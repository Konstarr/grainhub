import { Outlet } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';

/**
 * Shared page chrome: primary nav on top, footer on bottom.
 * Individual pages render in <Outlet /> and decide whether they
 * want the SecondaryNav / SponsorStrip / Hero themselves.
 */
export default function Layout() {
  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  );
}

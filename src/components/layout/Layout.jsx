import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import SecondaryNav from './SecondaryNav.jsx';

// Paths that should NOT show the site-wide trade bar. These are focused
// CTA / onboarding pages where extra chrome gets in the way.
const HIDE_SECONDARY_NAV_ON = ['/signup', '/sponsor'];

export default function Layout() {
  const { pathname } = useLocation();
  const showSecondary = !HIDE_SECONDARY_NAV_ON.includes(pathname);

  return (
    <>
      <Nav />
      {showSecondary && <SecondaryNav />}
      <Outlet />
      <Footer />
    </>
  );
}

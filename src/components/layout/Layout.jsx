import { Outlet } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import SecondaryNav from './SecondaryNav.jsx';
import ScrollToTop from '../shared/ScrollToTop.jsx';

export default function Layout() {
  // SecondaryNav decides its own visibility + contents based on the
  // current route — it returns null on pages that shouldn't show it.
  return (
    <>
      <ScrollToTop />
      <Nav />
      <SecondaryNav />
      <Outlet />
      <Footer />
    </>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router doesn't reset scroll position on route changes by default.
 * Mount this inside the router so every pathname change scrolls back to the
 * top of the viewport. Keeps the previous scroll position only on back/forward
 * navigation when the browser restores it naturally.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` jumps without animation which feels right for navigation.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

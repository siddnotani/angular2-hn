import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

declare global {
  interface Window {
    ga: (...args: unknown[]) => void;
  }
}

// Replaces AppComponent's `ga()` on NavigationEnd. Wrap only the real routes: Angular sends no
// pageview for the '' redirect itself (only for /news/1) or for URLs no route matches.
export function PageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.ga('set', 'page', pathname + search);
    window.ga('send', 'pageview');
  }, [pathname, search]);

  return <Outlet />;
}

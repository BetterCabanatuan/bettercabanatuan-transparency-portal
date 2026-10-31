import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** A new page starts at the top; in-page links (#districts) are left to the page. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

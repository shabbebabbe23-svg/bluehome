import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if we're navigating forward (not using back button)
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition && window.history.state?.usr?.fromBack) {
      // Restore scroll position when using back button
      window.scrollTo({ top: parseInt(scrollPosition), left: 0, behavior: "auto" });
      sessionStorage.removeItem('scrollPosition');
    } else {
      // Scroll to top on forward navigation
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;

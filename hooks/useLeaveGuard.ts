import { useEffect } from 'react';

/**
 * Warns before closing or reloading the tab, and absorbs the browser Back button,
 * since leaving a timed step loses the judge's progress.
 */
export function useLeaveGuard() {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    // An extra history entry for the current page means Back lands here again instead of leaving.
    const handlePopState = () => window.history.pushState(null, '', window.location.href);

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}

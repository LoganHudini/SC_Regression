import { useEffect } from 'react';

export const useBackwardNavigation = (isDrawerOpen: any, closeDrawer: any) => {
  useEffect(() => {
    const handleBackButton = () => {
      if (isDrawerOpen) {
        closeDrawer();
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isDrawerOpen, closeDrawer]);
};

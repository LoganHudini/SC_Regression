import { useEffect } from 'react';
import { toggleHamburgerMenuDrawer } from 'storage/home.storage';

const useOutsideAlerter = (ref: any) => {
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      // console.log(e.target);
      // toggleHamburgerMenuDrawer(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
};

export default useOutsideAlerter;

import { useEffect, useState } from 'react';

const useDetectKeyboardOpen = (minKeyboardHeight = 300) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<any>();

  useEffect(() => {
    const listener = () => {
      const newState =
        window.screen.height - minKeyboardHeight > (window as any).visualViewport.height;
      if (isKeyboardOpen !== newState) {
        setIsKeyboardOpen(newState);
      }
    };
    if (typeof visualViewport !== 'undefined') {
      (window as any).visualViewport.addEventListener('resize', listener);
    }
    return () => {
      if (typeof visualViewport !== 'undefined') {
        (window as any).visualViewport.removeEventListener('resize', listener);
      }
    };
  }, []);

  return isKeyboardOpen;
};

export default useDetectKeyboardOpen;

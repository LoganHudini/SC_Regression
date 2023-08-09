import { useRouter } from 'next/router';
import { useEffect } from 'react';
import languageDetector from './languageDetector';

export const useRedirect = () => {
  const router = useRouter();
  const to = router.asPath;

  // language detection
  useEffect(() => {
    const detectedLng = languageDetector.detect();
    if (to?.startsWith('/' + detectedLng) && router.route === '/404') {
      // prevent endless loop
      router.replace('/' + detectedLng + router.route);
      return;
    }

    if (languageDetector.cache && detectedLng) {
      languageDetector.cache(detectedLng);
    }
    router.replace('/' + detectedLng + to);
  });

  return <></>;
};

export const Redirect = () => {
  useRedirect();
  return <></>;
};

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import languageDetector from './languageDetector';
import { useConfig } from './hooks/useConfiguration';

export const useRedirect = () => {
  const router = useRouter();
  const to = router.asPath;
  const hotel = useConfig()?.code;

  // language detection
  useEffect(() => {
    const detectedLng = languageDetector.detect();
    if (to?.startsWith('/' + detectedLng) && router.route === '/404') {
      // prevent endless loop
      router.replace('/' + detectedLng + '/' + hotel + router?.route);
      return;
    }

    if (languageDetector.cache && detectedLng) {
      languageDetector.cache(detectedLng);
    }
    router.replace('/' + detectedLng + '/' + hotel + to);
  });

  return <></>;
};

export const Redirect = () => {
  useRedirect();
  return <></>;
};

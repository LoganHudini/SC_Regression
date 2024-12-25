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
    if (languageDetector.cache && detectedLng) {
      languageDetector.cache(detectedLng);
    }
    hotel
      ? router.replace('/' + detectedLng + '/' + hotel + '/404')
      : router.replace('/' + detectedLng + '/404');
  }, [hotel, router, to]);

  return <></>;
};

export const Redirect = () => {
  useRedirect();
  return <></>;
};

import { LANGUAGE_LIST_BARCELONA } from 'utils/constants';
import { useRouter } from 'next/router';

export const useLocalizedRouter = () => {
  const router = useRouter();

  return (path: string) => {
    router.push(`${router.query.locale ? `/${router.query.locale}` : ''}${path}`);
  };
};

export const useLanguage = () => {
  const router = useRouter();
  const locale = router.query.locale;
  const languageList = LANGUAGE_LIST_BARCELONA;
  return languageList?.find((item: any) => item?.value === locale);
};

export const useLocale = () => {
  const router = useRouter();
  return router.query.locale;
};

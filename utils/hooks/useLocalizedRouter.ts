import { BRANCH_CODE } from 'core/graphql/endpoints';
import { DUBAI_WATERFRONT, LANGUAGE_LIST_BARCELONA, LANGUAGE_LIST_DUBAI } from 'utils/constants';
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
  const languageList =
    BRANCH_CODE === DUBAI_WATERFRONT ? LANGUAGE_LIST_DUBAI : LANGUAGE_LIST_BARCELONA;
  return languageList?.find((item: any) => item?.value === locale);
};

export const useLocale = () => {
  const router = useRouter();
  return router.query.locale;
};

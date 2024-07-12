import { useRouter } from 'next/router';

export const useLocalizedRouter = () => {
  const router = useRouter();

  return (path: string) => {
    router.push(`${router.query.locale ? `/${router.query.locale}` : ''}${path}`);
  };
};

export const useLocale = () => {
  const router = useRouter();
  return router?.query?.locale;
};

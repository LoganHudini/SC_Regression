import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const DynamicCheckOut = dynamic(() => import('./checkout'), {
  loading: () => <div className={'loaderWrapper'}></div>,
});

const CheckOut: NextPage = (props: any) => {
  return <DynamicCheckOut {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['bill', 'common'], i18nConfig)),
    },
  };
};

export default CheckOut;

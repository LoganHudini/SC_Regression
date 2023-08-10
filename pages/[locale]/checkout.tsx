import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { getStaticPaths } from 'utils/getStatic';
import { RotatingLines } from 'react-loader-spinner';

export { getStaticPaths };

const DynamicCheckOut = dynamic(() => import('./checkout'), {
  loading: () => (
    <div className={'loaderWrapper'}>
      <RotatingLines strokeColor='grey' strokeWidth='5' width='100' visible={true} />
    </div>
  ),
});

const CheckOut: NextPage = (props: any) => {
  return <DynamicCheckOut {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['bill', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default CheckOut;

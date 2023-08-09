import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { DINING_FLOW_VERSION } from 'utils/constants';
import { getStaticPaths } from 'utils/getStatic';
import { getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { RotatingLines } from 'react-loader-spinner';

export { getStaticPaths };

const DynamicDining = dynamic(() => import(`./dining.${DINING_FLOW_VERSION}`), {
  loading: () => (
    <div className={'loaderWrapper'}>
      <RotatingLines strokeColor='grey' strokeWidth='5' width='100' visible={true} />
    </div>
  ),
});

const Dining: NextPage = (props) => {
  return <DynamicDining {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['dining', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default Dining;

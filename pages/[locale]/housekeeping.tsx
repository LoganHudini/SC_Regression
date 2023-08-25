import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { HOUSEKEEPING_FLOW_VERSION } from 'utils/constants';
import { getStaticPaths } from 'utils/getStatic';
import { RotatingLines } from 'react-loader-spinner';

export { getStaticPaths };

const DynamicHousekeeping = dynamic(() => import(`./housekeeping.${HOUSEKEEPING_FLOW_VERSION}`), {
  loading: () => (
    <div className={'loaderWrapper'}>
      <RotatingLines strokeColor='grey' strokeWidth='5' width='100' visible={true} />
    </div>
  ),
});

const Housekeeping: NextPage = (props) => {
  return <DynamicHousekeeping {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['housekeeping', 'common'], i18nConfig)),
    },
  };
};

export default Housekeeping;

import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { CHECK_IN_FLOW_VERSION } from 'utils/constants';
import { getStaticPaths } from 'utils/getStatic';
import { RotatingLines } from 'react-loader-spinner';

export { getStaticPaths };

const DynamicCheckIn = dynamic(() => import(`./check-in.${CHECK_IN_FLOW_VERSION}`), {
  loading: () => (
    <div className={'loaderWrapper'}>
      <RotatingLines strokeColor='grey' strokeWidth='5' width='100' visible={true} />
    </div>
  ),
});

const CheckIn = () => {
  return <DynamicCheckIn />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['get-reservation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default CheckIn;

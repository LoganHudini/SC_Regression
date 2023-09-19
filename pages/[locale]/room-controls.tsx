import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const DynamicRoomControls = dynamic(() => import('./room-controls'), {
  loading: () => <div className={'loaderWrapper'}></div>,
});

const RoomControls: NextPage = (props) => {
  return <DynamicRoomControls {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['room-controls', 'common'], i18nConfig)),
    },
  };
};

export default RoomControls;

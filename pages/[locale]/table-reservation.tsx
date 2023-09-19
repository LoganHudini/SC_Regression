import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const DynamicTableReservation = dynamic(() => import('./table-reservation'), {
  loading: () => <div className={'loaderWrapper'}></div>,
});

const TableReservation: NextPage = (props: any) => {
  return <DynamicTableReservation {...props} />;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['table-reservation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default TableReservation;

// pages/[locale]/map/index.tsx

import React from 'react';
import MapLayrMap from 'components/shared/MapLayr/MapLayr';
import { getStaticPaths } from 'utils/getStatic';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { useConfig } from 'utils/hooks/useConfiguration';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { useTranslation } from 'react-i18next';
import styles from '@styles/housekeeping/housekeeping.module.scss';

export { getStaticPaths };

const Maps = () => {
  const config = useConfig();
  const { t } = useTranslation(['housekeeping', 'common']);
  const hotelName = config?.name;

  return (
    <>
      {' '}
      <Head>
        <title>
          {hotelName} | {t('Maps')}
        </title>
      </Head>
      <Header displayHome screenTitle={t('Maps') as string} />
      <PageWrapper displayBottomMenu className={styles.pageWrapper}>
        <MapLayrMap />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'common'], i18nConfig)),
    },
  };
};

export default Maps;

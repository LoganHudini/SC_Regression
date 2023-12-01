import Head from 'next/head';
import React from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import AppIncode from 'components/pages/app-incode/app-incode';

export { getStaticPaths };

const Incode: React.FC = () => {
  const { t } = useTranslation('incode');
  return (
    <>
      <Head>
        <title>{t('Document Scanning')}</title>
      </Head>

      <PageWrapper>
        <AppIncode />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['incode'], i18nConfig)),
    },
  };
};

export default Incode;

import { useQuery } from '@apollo/client';
import { DiningCarousel } from 'components/pages/home/DiningCarousel/DiningCarousel';
import { HomeCarousel } from 'components/pages/home/HomeCarousel/HomeCarousel';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { configuration } from 'core/graphql/queries/GET_CONFIGURATION';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const Home: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('Home')}</title>
      </Head>
      <PageWrapper displayBottomMenu>
        <HomeCarousel />
        <DiningCarousel />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default Home;

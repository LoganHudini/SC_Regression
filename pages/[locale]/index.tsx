import { HomeCarousel } from 'components/pages/home/HomeCarousel/HomeCarousel';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const Home: NextPage = () => {
  const { t } = useTranslation('common');
  const homePageCarousel = {
    slides: [
      {
        titleH1: 'Sofitel manila',
        titleH3: 'manila',
        imgURL: '',
      },
      {
        titleH1: 'Sofitel manila',
        titleH3: 'manila',
        imgURL: '',
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{t('Home')}</title>
      </Head>
      <PageWrapper displayBottomMenu>
        <HomeCarousel carouselDetails={homePageCarousel} />
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

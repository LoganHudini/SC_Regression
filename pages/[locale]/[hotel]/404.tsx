/* eslint-disable @next/next/no-img-element */
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from '@styles/404/404.module.scss';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import { useConfig } from 'utils/hooks/useConfiguration';
import { FailureAnimation, PageNotFoundAnimation } from 'components/shared/Loaders/Loaders';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';

export { getStaticPaths };

const NotFound = () => {
  const { t } = useTranslation('common');
  const config = useConfig();
  const navigate = useLocalizedRouter();

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Page Not Found')}
        </title>
      </Head>
      <Header displayHome />
      <PageWrapper displayBottomMenu className={styles.pageWrapper}>
        <PageNotFoundAnimation />
        <h2 className={styles.title}>Something Went Wrong</h2>
        <span className={styles.description}>The page you are looking for could not be found.</span>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['404', 'common'], i18nConfig)),
    },
  };
};

export default NotFound;

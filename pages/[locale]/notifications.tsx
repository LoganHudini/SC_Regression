import Head from 'next/head';
import React from 'react';
import { Header } from 'components/shared/Header/Header';

import styles from '../../styles/notifications/notifications.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useTranslation } from 'react-i18next';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { Notification } from '../../components/pages/notifications/Notification/Notification';
export { getStaticPaths };

const TEMPLATE_NOTIFICATIONS = [
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
  {
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
    date: 'Today',
  },
];

const Language: React.FC<IHamburgerProps> = ({ hamburger, pages }) => {
  const { t } = useTranslation('notifications');

  return (
    <>
      <Head>
        <title>{t('Notifications')}</title>
      </Head>
      <Header displayCloseButton screenTitle={t('Notifications') as string} />
      <PageWrapper className={styles.wrapper} displayBottomMenu hamburger={hamburger} pages={pages}>
        <div className={styles.topRow}>
          <button className={styles.topBtn}>{t('MARK ALL AS READ')}</button>
          <button className={styles.topBtn}>{t('CLEAR ALL')}</button>
        </div>
        <div className={styles.notifications}>
          {TEMPLATE_NOTIFICATIONS.map((el, index) => (
            <Notification
              key={index}
              title={el.title}
              description={el.description}
              date={el.date}
              id={String(index)}
            />
          ))}
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['notifications', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default Language;

import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback } from 'react';
import { Header } from 'components/shared/Header/Header';
import styles from '../../../styles/dining-reservation-confirmation/dining-reservation-confirmation.module.scss';
import CheckMark from '@icons/thinCheckMark.svg';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { availablePaths } from 'utils/availablePaths';
import { YouMayAlsoLike } from 'components/pages/dining-reservation-confirmation/YouMayAlsoLike/YouMayAlsoLike';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { irdActiveMenuList } from 'utils/functions';

export { getStaticPaths };

const DiningReservationConfirmation: React.FC = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('dining-reservation-confirmation');

  const { data } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    fetchPolicy: 'no-cache',
  });

  const items = irdActiveMenuList(data)?.map((x: any) => x.categories[0]);
  const upsellItems = items?.filter((x: any) => x?.items !== null);

  const goToHomePage = useCallback(() => {
    navigate(availablePaths.INDEX);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('Order Confirmation')}</title>
      </Head>
      <Header screenTitle={t('Order Confirmation') as string} />
      <div className={styles.pageWrapper}>
        <CheckMark className={styles.checkIcon} />
        <h1 className={styles.successText}>{t('Your Order Is Confirmed')}</h1>
        <div className={styles.borderWrapper}>
          <div className={styles.dateTimeHeading}>{t('Date')}</div>
          <div className={styles.dateTimeText}>
            {dayjs().format(timeFormats.FULL_DAY_MONTH_YEAR)}
          </div>
          <div className={styles.dateTimeHeading}>{t('Time')}</div>
          <div className={styles.dateTimeText}>{dayjs().format(timeFormats.RAILWAY_TIME)}</div>
        </div>
        <div className={styles.carouselWrapper}>
          {upsellItems && <YouMayAlsoLike items={upsellItems} />}
        </div>

        <StyledButton className={styles.backButton} onClick={goToHomePage} variant='outlined'>
          {t('BACK TO HOME PAGE')}
        </StyledButton>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['dining-reservation-confirmation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default DiningReservationConfirmation;

import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback } from 'react';
import { YouMayAlsoLike } from 'components/pages/housekeeping-reservation-confirmation/YouMayAlsoLike/YouMayAlsoLike';
import { Header } from 'components/shared/Header/Header';
import styles from '../../../styles/housekeeping-reservation-confirmation/housekeeping-reservation-confirmation.module.scss';
import CheckMark from '@icons/thinCheckMark.svg';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';

export { getStaticPaths };

const HousekeepingReservationConfirmation: React.FC = () => {
  const { t } = useTranslation('housekeeping-reservation-confirmation');

  const navigate = useLocalizedRouter();

  const goToHomePage = useCallback(() => {
    navigate(availablePaths.INDEX);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('Request Confirmation')}</title>
      </Head>
      <Header screenTitle={t('Request Confirmation') as string} />
      <div className={styles.pageWrapper}>
        <CheckMark className={styles.checkIcon} />
        <h1 className={styles.successText}>{t('Thank You')}</h1>
        <p className={styles.centeredText}>{t('Your request has been confirmed.')}</p>
        <div className={styles.butonWrapper}>
          <StyledButton className={styles.backButton} onClick={goToHomePage} variant='contained'>
            {t('BACK TO HOME')}
          </StyledButton>
        </div>
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
        ['common', 'housekeeping-reservation-confirmation'],
        i18nConfig,
      )),
    },
  };
};

export default HousekeepingReservationConfirmation;

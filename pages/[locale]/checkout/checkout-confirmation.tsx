import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CheckMark from '@icons/checkMarkThin.svg';
import styles from '../../../styles/checkout-confirmation/checkout-confirmation.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';

export { getStaticPaths };

const CheckoutConfirmation = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('checkout-confirmation');

  const goToHomePage = useCallback(() => {
    navigate(availablePaths.HOME);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('Reservation Confirmation')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Reservation Confirmation') as string} />
      <div className={styles.wrapper}>
        <CheckMark className={styles.checkMark} />
        <h2 className={styles.title}>{t('You’ve Checked-Out')}</h2>
        <p className={styles.subTitle}>{t('Thank you')}</p>
        <p className={styles.text}>
          {t('Hope you had a pleasant stay with us. We look forward to your next visit.')}
        </p>
        <StyledButton onClick={goToHomePage} className={styles.button} variant='contained'>
          {t('OK')}
        </StyledButton>

        <StyledButton onClick={goToHomePage} className={styles.backButton} variant='outlined'>
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
      ...(await serverSideTranslations(locale as string, ['checkout-confirmation'], i18nConfig)),
    },
  };
};

export default CheckoutConfirmation;

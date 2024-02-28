/* eslint-disable quotes */
import React from 'react';
import { availablePaths } from 'utils/availablePaths';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import PaymentFailure from '@icons/paymentFailureCheckin.svg';
import PaymentSuccess from '@icons/paymentSuccessCheckin.svg';
import { CustomPopup } from 'components/shared/CustomPopup/CustomPopup';
import { PaymentStatusAnimation } from 'components/shared/Loaders/Loaders';

import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import Link from 'next/link';

export { getStaticPaths };

export const PaymentStatusCard: React.FC<any> = ({
  paymentStatus,
  paymentConfig,
  src,
  setLoader,
  paymentWindow,
}) => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation('about-your-stay');
  const width = 600;
  const height = 600;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  return (
    <>
      {paymentStatus ? (
        <StyledButton
          variant='contained'
          className={styles.scanPaymentButton}
          onClick={() => {
            if (paymentConfig && src) {
              setLoader(true);
              paymentWindow.current = window.open(
                src,
                '_blank',
                'resizable=yes, width=' +
                  width +
                  ', height=' +
                  height +
                  ', top=' +
                  top +
                  ', left=' +
                  left,
              );
            } else {
              navigate(availablePaths?.PAYMENT);
            }
          }}
        >
          <span className={styles.scanDocText}> {t('Proceed to Payment')} </span>
        </StyledButton>
      ) : (
        <div className={styles.boxPayment}>
          <>
            <PaymentSuccess />
            <p> {t('Payment Successful')}</p>{' '}
          </>
        </div>
      )}
    </>
  );
};

export const PaymentLoaderPopUp: React.FC<any> = ({ paymentLoader }) => {
  const { t } = useTranslation('about-your-stay');

  const body = () => (
    <>
      <div className={styles.popupWrapper}>
        <>
          <PaymentStatusAnimation />
          <p className={styles.titlePaymentPopup}>Just a Moment!</p>
          <p className={styles.descriptionPaymentPopup}>
            {t(
              'We’re processing your payment. Hold on – it’ll be quick. Appreciate your patience.',
            )}
          </p>
        </>
      </div>
    </>
  );

  return (
    <>
      <CustomPopup open={paymentLoader} content={body()} />
    </>
  );
};

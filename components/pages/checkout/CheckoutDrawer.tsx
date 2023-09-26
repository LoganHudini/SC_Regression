import { useQuery, useReactiveVar } from '@apollo/client';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import React from 'react';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import styles from './CheckoutDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { CHECKOUT, ICheckoutApiRequest } from 'core/graphql/queries/CHECKOUT';
import { client } from 'core/graphql/client';
import {
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';

const CheckoutDrawer = (props: any) => {
  const { setOpenNotification } = props;
  const { t } = useTranslation(['common']);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const checkedInData = useCheckedIn();

  const { data: reservationData } = useQuery<IGetReservationApiResponse>(
    GET_RESERVATION_NO_LAST_NAME,
    {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: checkedInData?.reservationId,
      },
    },
  );

  const reservationInfo = reservationData?.getReservation?.data;
  const reservationType = (reservationInfo?.confirmationType as string) ?? '';
  const reservationId = (reservationInfo?.reservationId as string) ?? '';
  const bookingId = (reservationInfo?.uniqueBookingId as string) ?? '';

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const handleCheckout = async () => {
    try {
      const checkoutPayload: ICheckoutApiRequest = {
        reservationType,
        reservationId,
        bookingId,
        paymentType: 'OPIVA',
      };

      await client.query({
        query: CHECKOUT,
        context: { clientName: 'rest' },
        variables: {
          body: checkoutPayload,
        },
      });
      setOpenNotification(true);
      toggleNotification(true);
      toggleDetailsDrawer(false);
    } catch (error) {
      console.log(error);
    }
  };

  const checkoutDrawerDetails = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('Confirm Checkout')}</p>
      <p className={styles.content}>
        {t('This action cannot be reversed. Your room access will be disabled after Check-out.')}
      </p>
      <div className={styles.buttonWrapper}>
        <StyledButton className={styles.buttonNo} variant='outlined' onClick={() => closeDrawer()}>
          {t('NO')}
        </StyledButton>
        <StyledButton
          className={styles.buttonYes}
          variant='contained'
          onClick={() => handleCheckout()}
        >
          {t('YES')}
        </StyledButton>
      </div>
    </div>
  );

  return (
    <>
      <CustomDrawer
        open={detailsDrawerStatus}
        onClose={closeDrawer}
        content={checkoutDrawerDetails()}
      />
    </>
  );
};

export default CheckoutDrawer;

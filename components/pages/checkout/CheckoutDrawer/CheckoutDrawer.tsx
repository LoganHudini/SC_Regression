import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import React, { useState } from 'react';
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
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { ckeckoutTrip } from 'storage/trips.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { ERRORMSG } from 'utils/constants';

const CheckoutDrawer = (props: any) => {
  const { setErrorToggle } = props;
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const { t } = useTranslation(['common']);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
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

  const { data: feedBackList } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const feedbackData = feedBackList?.listFeedback?.filter(
    (item: any) => item?.destination === CHECKOUT,
  );

  const reservationInfo = reservationData?.getReservation?.data;
  const reservationType = (reservationInfo?.confirmationType as string) ?? '';
  const reservationId = (reservationInfo?.reservationId as string) ?? '';
  const bookingId = (reservationInfo?.uniqueBookingId as string) ?? '';

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const handleCheckout = async () => {
    setCheckoutLoader(true);
    const checkoutPayload: ICheckoutApiRequest = {
      reservationType,
      reservationId,
      bookingId,
      paymentType: 'OPIVA',
    };
    try {
      await client.query({
        query: CHECKOUT,
        context: { clientName: 'rest' },
        variables: {
          body: checkoutPayload,
        },
      });
      toggleDetailsDrawer(false);
      ckeckoutTrip(checkoutPayload);
      toggleNotification(true);
      setErrorToggle({
        state: false,
        message: 'Checkedout Successfully',
        type: feedbackData?.length === 0 ? 'home' : 'feedback',
        description:
          'Hope you had a pleasant stay with us. We look forward to your next visit.\n Thank You.',
      });
    } catch (error) {
      const errorMsg = error as ApolloError;
      const networkError = errorMsg?.networkError as { result?: { errors?: string } };
      if (
        networkError?.result?.errors ===
        'Please proceed to the front desk to complete your checkout'
      ) {
        toggleNotification(true);
        setTimeout(() => {
          ckeckoutTrip(checkoutPayload);
        }, 5000);
        setErrorToggle({
          state: false,
          message: 'Thank You!',
          type: feedbackData?.length === 0 ? 'home' : 'feedback',
          description: 'Please proceed to the front desk to complete your checkout',
        });
      } else {
        toggleNotification(true);
        setErrorToggle({
          state: true,
          message: ERRORMSG,
          type: 'checkout',
          description: 'Please Try Again.',
        });
      }
      toggleDetailsDrawer(false);
    }
    setCheckoutLoader(false);
  };

  const checkoutDrawerDetails = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('Confirm Checkout')}</p>
      <p className={styles.content}>
        {t('This action cannot be reversed. Your room access will be disabled after Checkout.')}
      </p>
      <div className={styles.buttonWrapper}>
        <StyledButton className={styles.buttonNo} variant='outlined' onClick={() => closeDrawer()}>
          {t('NO')}
        </StyledButton>
        <StyledButton
          loading={checkoutLoader}
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

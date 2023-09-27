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
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { processError } from 'utils/processError';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { ckeckoutTrip } from 'storage/trips.storage';

const CheckoutDrawer = (props: any) => {
  const { setOpenNotification } = props;
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const navigation = useLocalizedRouter();
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
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
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
      ckeckoutTrip(checkoutPayload);
      feedbackData?.length === 0
        ? navigate(availablePaths.HOME)
        : navigate(availablePaths.FEEDBACK);
    } catch (error) {
      processError(t, error as ApolloError);
      toggleDetailsDrawer(false);
      feedbackData?.length === 0
        ? navigate(availablePaths.HOME)
        : navigate(availablePaths.FEEDBACK);
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

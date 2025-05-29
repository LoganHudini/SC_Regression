import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import React, { useState } from 'react';
import { notificationStorage, toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import styles from './CheckoutDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import {
  CHECKOUT,
  ICheckoutApiRequest,
  MAKE_CHECKOUT_PAYMENT,
} from 'core/graphql/queries/CHECKOUT';
import { client } from 'core/graphql/client';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { checkoutTrip, saveTrip } from 'storage/trips.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { activeCheckOutFlow, checkinStorage, useCheckedIn } from 'storage/check-in.storage';
import { processStatusCode } from 'utils/processError';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import {
  CHECKOUT_PAYMENT,
  CHECK_OUT,
  ERRORMSG,
  FAILURE,
  SUCCESS,
  PAIR_TO_ROOM,
  CHECKOUT_TEXT,
} from 'utils/constants';
import { activeItems, activeModule } from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';

const CheckoutDrawer = (props: any) => {
  const { reservationData, amountDue } = props;
  const locale = useLocale();
  const config = useConfig();
  const hotelId = useConfig()?.hotelId;
  const { t } = useTranslation(['bill']);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const checkedInData = useCheckedIn();
  const checkoutPayment: boolean = activeModule(config?.modules, CHECKOUT_PAYMENT);
  const pairToRoomModule: boolean = activeModule(config?.modules, PAIR_TO_ROOM);
  const checkOutModule: boolean = activeModule(config?.modules, CHECKOUT_TEXT);

  const { data: feedBackList } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'property_e' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const feedbackData = activeItems(
    feedBackList?.listFeedback?.filter((item: any) => item?.destination === CHECK_OUT),
  );

  const reservationInfo = reservationData?.getReservation?.data;
  const reservationType = (reservationInfo?.confirmationType as string) ?? '';
  const reservationId = (reservationInfo?.reservationId as string) ?? '';
  const bookingId = (reservationInfo?.uniqueBookingId as string) ?? '';

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
  };

  const feedbackStorage = () => {
    saveTrip({
      ...checkedInData,
      reservationId: '',
      preCheckedIn: false,
      checkedIn: false,
      roomNumber: '',
      invoiceId: '',
      hotelId: hotelId,
    });
    checkinStorage({
      ...checkedInData,
      reservationId: '',
      preCheckedIn: false,
      checkedIn: false,
      roomNumber: '',
      invoiceId: '',
      hotelId: hotelId,
    });
  };

  const handleCheckout = async () => {
    setCheckoutLoader(true);
    let paymentDone = checkoutPayment ? false : true;
    if (checkoutPayment && amountDue > 0) {
      const paymentPayload = {
        amount: amountDue as string,
        bookingId: reservationId,
        cardNumber: reservationInfo?.reservePayments[0]?.lastFourDigits,
        cardHolderName: '',
        cardType: reservationInfo?.reservePayments[0]?.cardType,
        expiry: reservationInfo?.reservePayments[0]?.cardExpiryDate,
        reference: Math.floor(Math.random() * 9000000000) + 1000000000,
        token: reservationInfo?.reservePayments[0]?.vaultedCardID,
      };
      try {
        await client.mutate({
          mutation: MAKE_CHECKOUT_PAYMENT,
          context: { clientName: 'integration_g' },
          fetchPolicy: 'network-only',
          variables: paymentPayload,
        });
        paymentDone = true;
      } catch {
        toggleNotification(true);
        notificationStorage({
          type: FAILURE,
          title: t('Payment failed!'),
          redirect: availablePaths?.BILL,
          description: t('Payment failed. Please try again.'),
        });
        return;
      }
    }
    const checkoutPayload: ICheckoutApiRequest = {
      reservationType,
      reservationId,
      bookingId,
      roomNo: checkedInData?.roomNumber as string,
      paymentType: 'OPIVA',
    };
    try {
      await client.query({
        query: CHECKOUT,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + (await getCheckInToken()) },
        },
        variables: {
          body: checkoutPayload,
          confirmationId: checkedInData?.reservationId,
        },
      });
      toggleDetailsDrawer(false);
      setTimeout(() => {
        if (feedbackData?.length === 0) {
          checkoutTrip();
          reservationGuestInfoStorageData(null);
        } else {
          feedbackStorage();
        }
      }, 5000);
      toggleNotification(true);
      notificationStorage({
        type: SUCCESS,
        title: t('You’ve Checked-out'),
        redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
        description: t(
          'Hope you had a pleasant stay with us. We look forward to your next visit.\nThank You.',
        ),
      });
    } catch (error) {
      const statusCode = processStatusCode(error as ApolloError);

      if (statusCode === 403) {
        handleCheckInAuthenticationFailure(handleCheckout);
      } else {
        const errorMsg = error as ApolloError;
        const networkError = errorMsg?.networkError as { result?: { errors?: string } };
        if (
          networkError?.result?.errors ===
          'Please proceed to the front desk to complete your checkout'
        ) {
          toggleNotification(true);
          notificationStorage({
            type: FAILURE,
            title: t('Unable to checkout'),
            redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
            description: `${amountDue > 0 ? t('There are outstanding payments to settle. ') : ''
              }${t('Kindly proceed to the front desk to complete the checkout process.')}`,
          });
        } else {
          toggleNotification(true);
          notificationStorage({
            type: FAILURE,
            title: t(ERRORMSG),
            redirect: paymentDone && checkoutPayment ? availablePaths?.HOME : availablePaths?.BILL,
            description: t('Please Try Again.'),
          });
        }
        toggleDetailsDrawer(false);
      }
    }
    setCheckoutLoader(false);
  };

  const handleDeviceDeactivate = () => {
    setTimeout(() => {
      if (feedbackData?.length === 0) {
        checkoutTrip();
        reservationGuestInfoStorageData(null);
      } else {
        feedbackStorage();
      }
    }, 5000);
    notificationStorage({
      type: SUCCESS,
      title: t('Device Disconnected!'),
      redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
      description: t(
        'Hope you had a pleasant stay with us. We look forward to your next visit.\nThank You.',
      ),
    });
    toggleNotification(true);
    toggleDetailsDrawer(false);
    activeCheckOutFlow(false);
  };

  const checkoutDrawerDetails = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>
        {!checkOutModule && pairToRoomModule ? t('Disconnect Room') : t('Confirm Checkout')}
      </p>
      <p className={styles.content}>
        {!checkOutModule && pairToRoomModule
          ? t(
            'This action is irreversible. Your device will no longer have access to in-room features, including In-Room Dining, Services, and others',
          )
          : t('This action is irreversible. Your room access will be disabled after Checkout.')}
      </p>
      <div className={styles.buttonWrapper}>
        <StyledButton className={styles.buttonNo} variant='outlined' onClick={() => closeDrawer()}>
          {t('NO')}
        </StyledButton>
        <StyledButton
          loading={checkoutLoader}
          className={styles.buttonYes}
          variant='contained'
          onClick={() => {
            if (!checkOutModule && pairToRoomModule) {
              handleDeviceDeactivate();
            } else if (checkOutModule) {
              handleCheckout();
            }
          }}
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

import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import React, { useState } from 'react';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
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
import { checkinStorage, useCheckedIn } from 'storage/check-in.storage';
import { processStatusCode } from 'utils/processError';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { CHECKOUT_PAYMENT, CHECK_IN, CHECK_OUT, ERRORMSG } from 'utils/constants';
import { activeItems, activeModule } from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';

const CheckoutDrawer = (props: any) => {
  const { setErrorToggle, reservationData, amountDue } = props;
  const locale = useLocale();
  const config = useConfig();
  const hotelId = useConfig()?.hotelId;
  const { t } = useTranslation(['bill']);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const checkedInData = useCheckedIn();

  const checkoutPayment: boolean = activeModule(config?.modules, CHECKOUT_PAYMENT);
  const checkInModule: boolean = activeModule(config?.modules, CHECK_IN);

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
        setErrorToggle({
          state: false,
          message: t('Payment failed!'),
          redirect: null,
          description: t('Payment failed. Please try again.'),
        });
        return;
      }
    }
    const checkoutPayload: ICheckoutApiRequest = {
      reservationType,
      reservationId,
      bookingId,
      paymentType: 'OPIVA',
    };
    try {
      await client.query({
        query: CHECKOUT,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + getCheckInToken() },
        },
        variables: {
          body: checkoutPayload,
          roomNumber: checkedInData?.roomNumber,
        },
      });
      toggleDetailsDrawer(false);
      setTimeout(() => {
        if (feedbackData?.length === 0) {
          checkoutTrip();
        } else {
          feedbackStorage();
        }
      }, 5000);
      toggleNotification(true);
      setErrorToggle({
        state: false,
        message: t('You’ve Checked-out'),
        redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
        description: t(
          t(
            'Hope you had a pleasant stay with us. We look forward to your next visit.\nThank You.',
          ),
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
          t('Please proceed to the front desk to complete your checkout')
        ) {
          toggleNotification(true);
          setErrorToggle({
            state: true,
            message: t('Unable to checkout'),
            redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
            description: `${
              amountDue > 0 ? t('There are outstanding payments to settle. ') : ''
            }${t('Kindly proceed to the front desk to complete the checkout process.')}`,
          });
        } else {
          toggleNotification(true);
          setErrorToggle({
            state: true,
            message: t(ERRORMSG),
            redirect: paymentDone && checkoutPayment ? availablePaths?.HOME : null,
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
      } else {
        feedbackStorage();
      }
    }, 5000);
    setErrorToggle({
      state: false,
      message: t('Device Disconnected!'),
      redirect: feedbackData?.length === 0 ? availablePaths?.HOME : availablePaths?.FEEDBACK,
      description: t(
        'Hope you had a pleasant stay with us. We look forward to your next visit.\nThank You.',
      ),
    });
    toggleNotification(true);
    toggleDetailsDrawer(false);
  };

  const checkoutDrawerDetails = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>{checkInModule ? t('Confirm Checkout') : t('Disconnect Room')}</p>
      <p className={styles.content}>
        {checkInModule
          ? t('This action cannot be reversed. Your room access will be disabled after Checkout.')
          : t(
              'This action is irreversible.Your device will no longer have access to in-room features, including In-Room Dining, Services, and others',
            )}
      </p>
      <div className={styles.buttonWrapper}>
        <StyledButton className={styles.buttonNo} variant='outlined' onClick={() => closeDrawer()}>
          {t('NO')}
        </StyledButton>
        <StyledButton
          loading={checkoutLoader}
          className={styles.buttonYes}
          variant='contained'
          onClick={() => (checkInModule ? handleCheckout() : handleDeviceDeactivate())}
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

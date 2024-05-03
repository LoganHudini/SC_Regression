import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import React, { useState } from 'react';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import styles from './CheckoutDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { CHECKOUT, ICheckoutApiRequest } from 'core/graphql/queries/CHECKOUT';
import { client } from 'core/graphql/client';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { checkoutTrip } from 'storage/trips.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { getCheckOutToken } from 'core/api/functions/getCheckOutAuthentication';
import { useCheckedIn } from 'storage/check-in.storage';
import { processStatusCode } from 'utils/processError';
import { handleCheckInAuthenticationFailure } from 'core/api/functions/getCheckInAuthentication';
import { CHECK_IN, CHECK_OUT, ERRORMSG } from 'utils/constants';
import { activeItems, activeModule } from 'utils/functions';

const CheckoutDrawer = (props: any) => {
  const { setErrorToggle, reservationData, amountDue } = props;
  const locale = useLocale();
  const config = useConfig();
  const hotelId = useConfig()?.hotelId;
  const { t } = useTranslation(['bill']);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const checkedInData = useCheckedIn();

  const checkInModule: boolean = activeModule(config?.modules, CHECK_IN);

  const { data: feedBackList } = useQuery(GET_FEEDBACK, {
    skip: !hotelId,
    context: { clientName: 'host_v4' },
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
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + getCheckOutToken() },
        },
        variables: {
          body: checkoutPayload,
          roomNumber: checkedInData?.roomNumber,
        },
      });
      toggleDetailsDrawer(false);
      checkoutTrip();
      toggleNotification(true);
      setErrorToggle({
        state: false,
        message: t('You’ve Checked-out'),
        type: feedbackData?.length === 0 ? 'home' : 'feedback',
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
          setTimeout(() => {
            checkoutTrip();
          }, 5000);
          setErrorToggle({
            state: false,
            message: t('Unable to checkout'),
            type: feedbackData?.length === 0 ? 'home' : 'feedback',
            description: `${
              amountDue > 0 ? t('There are outstanding payments to settle. ') : ''
            }${t('Kindly proceed to the front desk to complete the checkout process.')}`,
          });
        } else {
          toggleNotification(true);
          setErrorToggle({
            state: true,
            message: t(ERRORMSG),
            type: 'checkout',
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
      checkoutTrip();
    }, 5000);
    setErrorToggle({
      state: false,
      message: t('Device Disconnected!'),
      type: feedbackData?.length === 0 ? 'home' : 'feedback',
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

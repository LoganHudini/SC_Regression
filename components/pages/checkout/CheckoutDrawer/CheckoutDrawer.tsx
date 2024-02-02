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
import { CHECK_IN, CHECK_OUT, ERRORMSG } from 'utils/constants';
import { activeItems, activeModule } from 'utils/functions';

const CheckoutDrawer = (props: any) => {
  const { setErrorToggle, reservationData, amountDue } = props;
  const locale = useLocale();
  const config = useConfig();
  const hotelId = useConfig()?.hotelId;
  const { t } = useTranslation(['common']);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const detailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const checkinModule: boolean = activeModule(config?.modules, CHECK_IN);

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
        context: { clientName: 'rest' },
        variables: {
          body: checkoutPayload,
        },
      });
      toggleDetailsDrawer(false);
      checkoutTrip();
      toggleNotification(true);
      setErrorToggle({
        state: false,
        message: 'You’ve Checked-out',
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
          checkoutTrip();
        }, 5000);
        setErrorToggle({
          state: false,
          message: 'Unable to checkout',
          type: feedbackData?.length === 0 ? 'home' : 'feedback',
          description: `${
            amountDue > 0 ? 'There are outstanding payments to settle. ' : ''
          }Kindly proceed to the front desk to complete the checkout process.`,
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

  const handleDeviceDeactivate = () => {
    toggleDetailsDrawer(false);
    checkoutTrip();
    toggleNotification(true);
    setErrorToggle({
      state: false,
      message: 'Phone Disconnected!',
      type: feedbackData?.length === 0 ? 'home' : 'feedback',
      description:
        'Hope you had a pleasant stay with us. We look forward to your next visit.\n Thank You.',
    });
  };

  const checkoutDrawerDetails = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>
        {checkinModule ? t('Confirm Checkout') : t('Disconnect Phone')}
      </p>
      <p className={styles.content}>
        {checkinModule
          ? t('This action cannot be reversed. Your room access will be disabled after Checkout.')
          : t(
              'This action is irreversible. Your phone will no longer have access to in-room features, including In-Room Dining, Services, and others',
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
          onClick={() => (checkinModule ? handleCheckout() : handleDeviceDeactivate())}
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

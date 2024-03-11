import { ApolloError, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_CCAVENUE,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IGetPaymentStatusApiResponse,
  GET_PAYMENT_STATUS,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { FAILURE, SUCCESS } from 'utils/constants';
import { toggleNotification } from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { PaymentLoaderPopUp } from 'components/pages/check-in/PreCheckinPaymentInfo/card-payment';
import PopUpBlocker from '@icons/popUpBlocker.svg';

const CCAvenue: React.FC = () => {
  const transactionId = useRef('');
  const navigate = useLocalizedRouter();
  const [errorNotification, setErrorNotification] = useState(false);
  const [popUpStatus, setPopUpStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(['check-in-payment', 'common']);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  // const interval: any = useRef<HTMLIFrameElement>(null);

  const newTab = useRef<Window | null>(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const onPaymentDone = useCallback(async () => {
    navigate(availablePaths?.CARD_AUTHORISATION);
    newTab.current && newTab.current.close();
    setPopUpStatus(false);
  }, [navigate]);

  const preparePayment = useCallback(async () => {
    const checkInToken = getCheckInToken();
    const orderId =
      Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.confirmationId;

    const data = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });

    if (data) {
      const initiatePaymentPayload: IInitiatePaymentApiRequest = {
        currency: reservationInfo?.details?.holdAmount?.currency as string,
        amount: 1,
        bookingId: reservationInfo?.confirmationId as string,
        orderId: orderId,
      };

      try {
        const { data } = await client.query<IInitiatePaymentApiResponse>({
          query: INITIATE_PAYMENT_CCAVENUE,
          variables: {
            body: initiatePaymentPayload,
          },
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
        });

        if (data?.initiatePayment?.data?.answer) {
          const width = 600;
          const height = 600;
          const left = (screen.width - width) / 2;
          const top = (screen.height - height) / 2;

          newTab.current = window.open(
            data?.initiatePayment?.data?.answer?.payment_zone_data,
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

          if (
            !newTab.current ||
            newTab.current.closed ||
            typeof newTab.current.closed === 'undefined'
          ) {
            // Popup was blocked or closed immediately
            setPopUpStatus(true);
            // Implement alternative logic or inform the user
          }
          transactionId.current = orderId;
        }
      } catch (initiatePaymentError) {
        const statusCode = processStatusCode(initiatePaymentError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(preparePayment)
          : (setErrorNotification(true), toggleNotification(true), onPaymentDone());
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentResponse = async () => {
    if (transactionId.current) {
      const checkInToken = getCheckInToken();
      const cardOptions = [
        { code: 'MC', value: 'Mastercard' },
        { code: 'VS', value: 'Visa' },
        { code: 'AX', value: 'Americanexpress' },
      ];

      try {
        const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
          query: GET_PAYMENT_STATUS,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
          variables: {
            paymentId: transactionId?.current,
            confirmationId: reservationInfo?.confirmationId,
          },
        });

        const status = paymentStatusData?.getPaymentStatus.data['status '];

        if (status === 'Success') {
          reservationGuestInfoStorageData({
            ...guestReservationInfo,
            token: paymentStatusData?.getPaymentStatus?.data['token'],
            cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber '],
            cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName '],
            cardType: cardOptions?.find(
              (option: any) =>
                option?.value === paymentStatusData?.getPaymentStatus?.data['cardType '],
            )?.code,
            cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
            paymentType: paymentStatusData?.getPaymentStatus?.data['paymentMethod '],
          });
          setErrorNotification(false);
          toggleNotification(true);
          onPaymentDone();
        }
        if (status === 'Failed') {
          setErrorNotification(true);
          toggleNotification(true);
          onPaymentDone();
        }
      } catch (paymentStatusError) {
        const statusCode = processStatusCode(paymentStatusError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(paymentResponse)
          : (setErrorNotification(true), toggleNotification(true), onPaymentDone());
      }
    }
  };

  useEffect(() => {
    if (!reservationInfo?.confirmationId) {
      navigate(availablePaths?.HOME);
    }
    preparePayment();

    const interval = setInterval(() => {
      paymentResponse();
    }, 6000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading ? (
        <PaymentLoader />
      ) : (
        <PaymentLoaderPopUp paymentLoader={!loading && !popUpStatus} />
      )}

      {/* {popUpStatus && (
        <div className={styles.popUpBlockerContainer}>
          <PopUpBlocker />
          <p className={styles.titleOops}>Oops!</p>
          <p className={styles.titlePaymentPopup}>Disable Pop-up Blocker</p>
          <p className={styles.descriptionPaymentPopup}>
            Make sure your web browser permits pop-ups so that you can proceed with the payment.
            <br />
            <br />
            Please disable the popup blocker in your browser settings. Follow the steps provided by
            your browser to allow pop-ups, ensuring a smooth transaction process.
            <br />
            <br />
            Thank you for your cooperation!
          </p>
        </div>
      )} */}

      <Notification
        title={errorNotification ? ('Payment Failed!' as string) : (t('Thank You!') as string)}
        description={
          errorNotification
            ? ('Card Authentication Failed!' as string)
            : (t('Card Authentication completed') as string)
        }
        redirect={availablePaths?.CARD_AUTHORISATION}
        type={errorNotification ? FAILURE : SUCCESS}
      />
    </>
  );
};

export default CCAvenue;

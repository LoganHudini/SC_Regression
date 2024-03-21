import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_FREEDOMPAY,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IGetPaymentStatusApiResponse,
  GET_FREEDOMPAY_STATUS,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { FAILURE, SUCCESS } from 'utils/constants';
import { toggleNotification } from 'storage/home.storage';

const FreedomPay: React.FC = () => {
  const transactionId = useRef('');
  const navigate = useLocalizedRouter();
  const [errorNotification, setErrorNotification] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState('');
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(['check-in-payment', 'common']);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const onPaymentDone = useCallback(async () => {
    navigate(availablePaths?.CARD_AUTHORISATION);
  }, [navigate]);

  const preparePayment = useCallback(async () => {
    const orderId =
      Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.confirmationId;
    const data = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });

    if (data) {
      const initiatePaymentPayload: IInitiatePaymentApiRequest = {
        currency: (reservationInfo?.details?.holdAmount?.currency as string) || 'USD',
        amount: 1,
        bookingId: reservationInfo?.confirmationId as string,
        orderId: orderId,
      };

      try {
        const { data } = await client.query<IInitiatePaymentApiResponse>({
          query: INITIATE_PAYMENT_FREEDOMPAY,
          variables: { body: initiatePaymentPayload },
          context: { clientName: 'rest' },
          fetchPolicy: 'network-only',
        });

        if (data) {
          setPaymentIntent(data?.initiatePayment?.data?.answer?.intent);
          transactionId.current = data?.initiatePayment?.data?.answer?.transaction_id as string;
        }
      } catch (initiatePaymentError) {
        setErrorNotification(true);
        toggleNotification(true);
        onPaymentDone();
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentResponse = useCallback(
    async (data: any) => {
      if (transactionId.current && data?.data?.paymentKeys?.length > 0) {
        const cardOptions = [
          { code: 'MC', value: 'Mastercard' },
          { code: 'VS', value: 'Visa' },
          { code: 'VS', value: 'VS' },
          { code: 'AX', value: 'Americanexpress' },
        ];

        try {
          const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
            query: GET_FREEDOMPAY_STATUS,
            context: { clientName: 'rest_v3' },
            fetchPolicy: 'network-only',
            variables: {
              body: {
                paymentIntent: data?.data?.paymentKeys[0],
                token: paymentIntent,
                amount: 0.0,
              },
            },
          });

          const status = paymentStatusData?.getPaymentStatus.data['status'];

          if (status === 'Success') {
            reservationGuestInfoStorageData({
              ...guestReservationInfo,
              token: paymentStatusData?.getPaymentStatus?.data['token']?.id_token,
              cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber'],
              cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName'],
              cardType: cardOptions?.find(
                (option: any) =>
                  option?.value === paymentStatusData?.getPaymentStatus?.data['cardType'],
              )?.code,
              cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
              paymentType: paymentStatusData?.getPaymentStatus?.data['payment_method'],
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
          // processError(t, paymentStatusError as ApolloError);
          setErrorNotification(true);
          toggleNotification(true);
          onPaymentDone();
        }
      }
    },
    [guestReservationInfo, onPaymentDone, paymentIntent],
  );

  useEffect(() => {
    if (!reservationInfo?.confirmationId) {
      navigate(availablePaths?.HOME);
    }
    preparePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof window !== 'undefined') {
    window.onmessage = function (event) {
      if (event?.data?.data) {
        handlePaymentResponse(event?.data);
      }
    };
  }

  return (
    <>
      {loading && <PaymentLoader />}

      {paymentIntent && (
        <iframe
          id={'#hpc--card-frame'}
          className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
          src={'https://hpc.freedompay.com/api/v1.5/controls?sessionKey=' + paymentIntent}
        ></iframe>
      )}

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

export default FreedomPay;

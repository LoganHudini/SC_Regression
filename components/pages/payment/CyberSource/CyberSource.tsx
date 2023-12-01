import { ApolloError, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { client } from 'core/graphql/client';
import {
  IGetReservationApiResponse,
  GET_RESERVATION,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_CYBERSOURCE,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IGetPaymentStatusApiResponse,
  GET_PAYMENT_STATUS,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { processError } from 'utils/processError';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { FAILURE, SUCCESS } from 'utils/constants';
import { toggleNotification } from 'storage/home.storage';

const CyberSource: React.FC = () => {
  const transactionId = useRef('');
  const navigate = useLocalizedRouter();
  const [errorNotification, setErrorNotification] = useState(false);

  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(['check-in-payment', 'common']);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const onPaymentDone = useCallback(async () => {
    navigate(availablePaths?.CARD_AUTHORISATION);
  }, [navigate]);

  const preparePayment = useCallback(async () => {
    let updatedReservationData: IGetReservationApiResponse | null = null;

    try {
      const { data } = await client.query<IGetReservationApiResponse>({
        query: GET_RESERVATION_NO_LAST_NAME,
        context: { clientName: 'rest' },
        fetchPolicy: 'network-only',
        variables: {
          confirmationNumber: reservationInfo?.confirmationId,
        },
      });
      updatedReservationData = data;
    } catch (getUpdatedReservationError) {
      // processError(t, getUpdatedReservationError as ApolloError);
      setErrorNotification(true);
      toggleNotification(true);
      onPaymentDone();
    }

    if (updatedReservationData) {
      const initiatePaymentPayload: IInitiatePaymentApiRequest = {
        currency: reservationInfo?.details?.holdAmount?.currency as string,
        amount: 1,
        bookingId: reservationInfo?.confirmationId as string,
        orderId: Math.floor(Math.random() * 9000000000) + 1000000000 + '',
      };

      let paymentData: IInitiatePaymentApiResponse | null = null;

      try {
        const { data } = await client.query<IInitiatePaymentApiResponse>({
          query: INITIATE_PAYMENT_CYBERSOURCE,
          variables: { body: initiatePaymentPayload },
          context: { clientName: 'rest' },
          fetchPolicy: 'network-only',
        });

        paymentData = data;
      } catch (initiatePaymentError) {
        // processError(t, initiatePaymentError as ApolloError);
        setErrorNotification(true);
        toggleNotification(true);
        onPaymentDone();
      }

      if (paymentData) {
        const html = paymentData.initiatePayment.data.answer.payment_zone_data;
        const doc = iframeRef.current?.contentWindow?.document;

        transactionId.current = paymentData?.initiatePayment?.data?.answer
          ?.transaction_id as string;
        // console.log(transactionId.current);
        if (doc) {
          doc.open();
          doc.write(html as string);
          (doc.getElementById('payForm') as HTMLFormElement).submit();
          doc.close();
          setLoading(false);
        }
      }
    }
  }, [
    onPaymentDone,
    reservationInfo?.confirmationId,
    reservationInfo?.details?.holdAmount?.currency,
  ]);

  const handleIframeChange = useCallback(() => {
    setTimeout(async () => {
      if (transactionId.current) {
        const cardOptions = [
          { code: 'MC', value: 'Mastercard' },
          { code: 'VS', value: 'Visa' },
          { code: 'AX', value: 'Americanexpress' },
        ];
        try {
          const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
            query: GET_PAYMENT_STATUS,
            context: { clientName: 'rest' },
            fetchPolicy: 'network-only',
            variables: { paymentId: transactionId?.current },
          });

          const status = paymentStatusData?.getPaymentStatus.data['status '];
          // console.log('paymentStatusData', paymentStatusData, status);

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
          // processError(t, paymentStatusError as ApolloError);
          setErrorNotification(true);
          toggleNotification(true);
          onPaymentDone();
        }
      }
    }, 1500);
  }, [guestReservationInfo, onPaymentDone]);

  useEffect(() => {
    if (!reservationInfo?.confirmationId) {
      navigate(availablePaths?.HOME);
    }
    preparePayment();
  }, [navigate, preparePayment, reservationInfo?.confirmationId]);

  return (
    <>
      {loading && <PaymentLoader />}

      <iframe
        ref={iframeRef}
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        onLoad={handleIframeChange}
      />
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

export default CyberSource;

import { ApolloError, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
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
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { FAILURE, SUCCESS } from 'utils/constants';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';

const CyberSource: React.FC = () => {
  const transactionId = useRef('');
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(['check-in-payment', 'common']);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const onPaymentDone = useCallback(async () => {
    navigate(availablePaths?.CARD_AUTHORISATION);
  }, [navigate]);

  const preparePayment = useCallback(async () => {
    const checkInToken = getCheckInToken();

    const data = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });

    if (data) {
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
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
        });
        paymentData = data;
      } catch (initiatePaymentError) {
        const statusCode = processStatusCode(initiatePaymentError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(preparePayment)
          : (notificationStorage({
              title: t('Payment Failed!') as string,
              description: t('Card Authentication Failed!') as string,
              type: FAILURE,
            }),
            toggleNotification(true),
            onPaymentDone());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIframeChange = useCallback(() => {
    setTimeout(async () => {
      if (transactionId.current) {
        const cardOptions = [
          { code: 'MC', value: 'Mastercard' },
          { code: 'VS', value: 'Visa' },
          { code: 'AX', value: 'Americanexpress' },
        ];
        const checkInToken = getCheckInToken();
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
            notificationStorage({
              title: t('Thank You!') as string as string,
              description: t('Card Authentication Completed') as string,
              type: SUCCESS,
            });
            toggleNotification(true);
            onPaymentDone();
          }
          if (status === 'Failed') {
            notificationStorage({
              title: t('Payment Failed!') as string,
              description: t('Card Authentication Failed!') as string,
              type: FAILURE,
            });
            toggleNotification(true);
            onPaymentDone();
          }
        } catch (paymentStatusError) {
          const statusCode = processStatusCode(paymentStatusError as ApolloError);
          statusCode === 403
            ? handleCheckInAuthenticationFailure(handleIframeChange)
            : (notificationStorage({
                title: t('Payment Failed!') as string,
                description: t('Card Authentication Failed!') as string,
                type: FAILURE,
              }),
              toggleNotification(true),
              onPaymentDone());
        }
      }
    }, 1500);
  }, [guestReservationInfo, onPaymentDone, reservationInfo?.confirmationId, t]);

  useEffect(() => {
    if (!reservationInfo?.confirmationId) {
      navigate(availablePaths?.HOME);
    }
    preparePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading && <PaymentLoader />}

      <iframe
        ref={iframeRef}
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        onLoad={handleIframeChange}
      />
    </>
  );
};

export default CyberSource;

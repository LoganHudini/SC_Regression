import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_DSP,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IGetPaymentStatusApiResponse } from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { FAILURE, SUCCESS } from 'utils/constants';
import { notificationStorage, toggleNotification } from 'storage/home.storage';

const DSPIntegration: React.FC = () => {
  const transactionId = useRef('');
  const navigate = useLocalizedRouter();
  const [iframeSrc, setIframeSrc] = useState('');
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

    if (reservationInfo) {
      // testing payload
      const initiatePaymentPayload = {
        ordenId: orderId,
        customerName: 'Hudini Test',
        emailCliente: '',
        customerphone: '67283941',
        subtotal: '01',
        impuestos: '000',
        concepto: 'mpay test passed',
        total: '01',
        // urlReturn: 'https://rcdhotels.hudini.app/en/hard-rock-cancun/check-in/card-authorisation/',
        items: [
          {
            cantidad: 1,
            producto: ' - PETS - SINGLE PAYMENT -SILICE',
            precio: 0.0,
            currency: 'USD',
          },
        ],
      };

      try {
        const { data } = await client.query<IInitiatePaymentApiResponse>({
          query: INITIATE_PAYMENT_DSP,
          variables: { body: initiatePaymentPayload },
          context: { clientName: 'rest_v4' },
          fetchPolicy: 'network-only',
        });

        if (data) {
          transactionId.current = data?.initiatePayment?.data?.answer?.transaction_id as string;
          setIframeSrc(data.initiatePayment.data.answer.payment_zone_data);
        }
      } catch (initiatePaymentError) {
        toggleNotification(true);
        onPaymentDone();
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIframeChange = useCallback(async () => {
    if (transactionId.current) {
      const cardOptions = [
        { code: 'MC', value: 'Mastercard' },
        { code: 'VS', value: 'Visa' },
        { code: 'AX', value: 'Americanexpress' },
      ];
      try {
        const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
          query: INITIATE_PAYMENT_DSP,
          context: { clientName: 'rest_v4' },
          fetchPolicy: 'network-only',
          variables: { transactionId: transactionId?.current },
        });

        const status = paymentStatusData?.getPaymentStatus.data['status'];

        if (status === 'Success') {
          reservationGuestInfoStorageData({
            ...guestReservationInfo,
            token: paymentStatusData?.getPaymentStatus?.data['token'],
            cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber'],
            cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName'],
            cardType: cardOptions?.find(
              (option: any) =>
                option?.value === paymentStatusData?.getPaymentStatus?.data['cardType'],
            )?.code,
            cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
            paymentType: paymentStatusData?.getPaymentStatus?.data['payment_method'],
          });
          notificationStorage({
            title: t('Thank You!') as string as string,
            description: t('Card Authentication Completed') as string,
            type: SUCCESS,
            redirect: availablePaths?.CARD_AUTHORISATION,
          });
          toggleNotification(true);
          onPaymentDone();
        }
        if (status === 'Failed') {
          notificationStorage({
            title: t('Payment Failed!') as string,
            description: t('Card Authentication Failed!') as string,
            type: FAILURE,
            redirect: availablePaths?.CARD_AUTHORISATION,
          });
          toggleNotification(true);
          onPaymentDone();
        }
      } catch (paymentStatusError) {
        notificationStorage({
          title: t('Payment Failed!') as string,
          description: t('Card Authentication Failed!') as string,
          type: FAILURE,
          redirect: availablePaths?.CARD_AUTHORISATION,
        });
        toggleNotification(true);
        onPaymentDone();
      }
    }
  }, [guestReservationInfo, onPaymentDone, t]);

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
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
          onLoad={handleIframeChange}
        />
      )}
    </>
  );
};

export default DSPIntegration;

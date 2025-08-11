import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { INITIATE_PAYMENT_GLOBAL_BLUE } from 'core/graphql/queries/INITIATE_PAYMENT';
import React, { useEffect, useRef, useState } from 'react';
import styles from './GlobalBlue.module.scss';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';
import { FAILURE, SUCCESS } from 'utils/constants';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID } from 'core/graphql/queries/GET_PAYMENT_STATUS';

export const GlobalBlue = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const navigate = useLocalizedRouter();
  const transactionId = useRef('');
  const purchaseId = useRef('');
  const [paymentURL, setPaymentURL] = useState('');
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  console.log('global');

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData && reservationData?.getReservation?.data;
  const orderId =
    Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.confirmationId;
  const cleanKeys = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.trim(), value]));

  useEffect(() => {
    (async () => {
      const checkInToken = await getCheckInToken();
      if (reservationInfo) {
        const initiatePaymentPayload = {
          merchantTransactionId: orderId,
          bookingId: reservationInfo.confirmationId,
        };

        const { data } = await client.query({
          query: INITIATE_PAYMENT_GLOBAL_BLUE,
          variables: {
            body: initiatePaymentPayload,
          },
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
        });
        if (data) {
          transactionId.current = orderId;
          purchaseId.current = data?.initiatePayment?.data?.purchaseId;
          setPaymentURL(data?.initiatePayment?.data?.tokenForm);
        }
      }
    })();
  }, [reservationInfo]);

  const handleChange = async () => {
    const cardOptions = [
      { code: 'MC', value: 'MASTERCARD' },
      { code: 'VS', value: 'VISA' },
      { code: 'AX', value: 'AMERICANEXPRESS' },
    ];
    const checkInToken = await getCheckInToken();
    try {
      const { data: status } = await client.query({
        query: GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID,
        context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
        fetchPolicy: 'network-only',
        variables: {
          paymentId: purchaseId?.current,
          confirmationId: reservationInfo?.confirmationId,
        },
      });

      const statusValue = status?.getPaymentStatus?.data?.['status ']?.trim();

      if (statusValue === 'Failed') {
        notificationStorage({
          title: t('Payment Failed!') as string,
          description: t('Card Authentication Failed!') as string,
          type: FAILURE,
          redirect: availablePaths?.CARD_AUTHORISATION,
        });
        toggleNotification(true);
      } else if (statusValue === 'Success') {
        const rawCardData = status?.getPaymentStatus?.data;
        const cardData = cleanKeys(rawCardData || {});

        reservationGuestInfoStorageData({
          ...guestReservationInfo,
          token: cardData?.token || '',
          cardNumber: cardData?.cardNumber,
          cardHolderName: cardData?.cardHolderName,
          cardType: cardData?.cardType,
          cardExpiryDate: cardData?.cardExpiry,
          paymentType: cardData?.cardType,
        });
        notificationStorage({
          title: t('Thank You!') as string,
          description: t('Card Authentication Completed') as string,
          type: SUCCESS,
          redirect: availablePaths?.CARD_AUTHORISATION,
        });
        toggleNotification(true);
        navigate(availablePaths?.CARD_AUTHORISATION);
      } else if (statusValue !== '') {
        notificationStorage({
          title: t('Payment Failed!') as string,
          description: t('Card Authentication Failed!') as string,
          type: FAILURE,
          redirect: availablePaths?.CARD_AUTHORISATION,
        });
        toggleNotification(true);
      }
    } catch {
      notificationStorage({
        title: t('Payment Failed!') as string,
        description: t('Card Authentication Failed!') as string,
        type: FAILURE,
        redirect: availablePaths?.CARD_AUTHORISATION,
      });
      toggleNotification(true);
    }
  };

  return (
    <div className={styles.paymentWrapper}>
      <form>
        <iframe
          title='Payment'
          className={styles.paymentArea}
          src={paymentURL}
          onLoad={handleChange}
        />
      </form>
    </div>
  );
};

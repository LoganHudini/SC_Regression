import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { INITIATE_PAYMENT_OGONE } from 'core/graphql/queries/INITIATE_PAYMENT';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Ogone.module.scss';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { Notification } from 'components/shared/Notification/Notification';
import { useTranslation } from 'react-i18next';
import { FAILURE, SUCCESS } from 'utils/constants';
import { toggleNotification } from 'storage/home.storage';
import { GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID } from 'core/graphql/queries/GET_PAYMENT_STATUS';

export const Ogone = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const navigate = useLocalizedRouter();
  const transactionId = useRef('');
  const [paymentURL, setPaymentURL] = useState('');
  const [errorNotification, setErrorNotification] = useState(false);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData && reservationData?.getReservation?.data;

  useEffect(() => {
    (async () => {
      const checkInToken = getCheckInToken();
      const orderId =
        Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.confirmationId;
      if (reservationInfo) {
        const initiatePaymentPayload = {
          orderId: orderId,
          confirmationId: reservationInfo.confirmationId,
          amount: 15,
          currencyCode: 'GBP',
        };

        const { data } = await client.query({
          query: INITIATE_PAYMENT_OGONE,
          variables: {
            body: initiatePaymentPayload,
          },
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
        });
        if (data) {
          transactionId.current = orderId;
          setPaymentURL(data?.initiatePayment?.data?.redirectUrl);
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
    const checkInToken = getCheckInToken();
    try {
      const { data: status } = await client.query({
        query: GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID,
        context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
        fetchPolicy: 'network-only',
        variables: {
          paymentId: transactionId?.current,
        },
      });

      if (status && status?.getPaymentStatus?.data?.['status '] == 'Failed') {
        setErrorNotification(true);
        toggleNotification(true);
      } else if (status && status?.getPaymentStatus?.data?.['status '] == 'Success') {
        const cardData = JSON.parse(status?.getPaymentStatus?.data?.encryptedPayment);
        reservationGuestInfoStorageData({
          ...guestReservationInfo,
          token: cardData?.SHASIGN,
          cardNumber: cardData?.CARDNO,
          cardHolderName: cardData?.CN,
          cardType: cardOptions?.find((option: any) => option?.value === cardData?.BRAND)?.code,
          cardExpiryDate: `20${cardData?.ED?.slice(2)}-${cardData?.ED?.slice(0, 2)}-01`,
          paymentType: cardData?.BRAND,
        });
        setErrorNotification(false);
        toggleNotification(true);
        navigate(availablePaths?.CARD_AUTHORISATION);
      } else if (status && status?.getPaymentStatus?.data?.['status '] != '') {
        setErrorNotification(true);
        toggleNotification(true);
      }
    } catch {
      setErrorNotification(true);
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
      <Notification
        title={errorNotification ? (t('Payment Failed!') as string) : (t('Thank You!') as string)}
        description={
          errorNotification
            ? (t('Card Authentication Failed!') as string)
            : (t('Card Authentication Completed') as string)
        }
        redirect={availablePaths?.CARD_AUTHORISATION}
        type={errorNotification ? FAILURE : SUCCESS}
      />
    </div>
  );
};

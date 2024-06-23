/* eslint-disable camelcase */
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { INITIATE_PAYMENT_FISERV } from 'core/graphql/queries/INITIATE_PAYMENT';
import React, { useEffect, useRef, useState } from 'react';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import { GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID } from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { Notification } from 'components/shared/Notification/Notification';
import { useTranslation } from 'react-i18next';
import { CHECK_IN, CREDIT_CARD_INFO, FAILURE, INFORMATION, SUCCESS } from 'utils/constants';
import cx from 'classnames';
import { toggleNotification } from 'storage/home.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { fetchCharges } from 'utils/functions';

interface IInitiatePaymentApiResponse {
  initiatePayment: {
    status: string;
    data: {
      original_message: string;
      answer: {
        operation_status: string;
        transaction_id: string;
        payment_zone_data: string;
        reference_id: string;
        intent: string;
      };
    };
  };
}

let transactionId: string;

export const Fiserv = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const iframeRef: any = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState(false);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const checkInModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);

  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const cardDetailsSections = guestSubmodule?.details
    ?.filter((section: any) => section?.isActive)
    ?.find((cardDetails: any) => cardDetails.name === CREDIT_CARD_INFO);

  const reservationInfo = reservationData && reservationData?.getReservation?.data;

  useEffect(() => {
    (async () => {
      const checkInToken = getCheckInToken();
      if (reservationInfo) {
        const initiatePaymentPayload = {
          currency: reservationInfo?.details?.holdAmount?.currency,
          amount: fetchCharges(reservationInfo),
          bookingId: reservationInfo?.confirmationId,
          txnType: cardDetailsSections?.txnType,
          timeZone: cardDetailsSections?.timeZone,
        };
        let paymentData: IInitiatePaymentApiResponse | null = null;
        try {
          const { data } = await client.query({
            query: INITIATE_PAYMENT_FISERV,
            variables: {
              body: initiatePaymentPayload,
            },
            context: {
              clientName: 'rest_v4',
              headers: { Authorization: 'Bearer ' + checkInToken },
            },
            fetchPolicy: 'network-only',
          });
          paymentData = data;
        } catch (err) {
          setErrorNotification(true);
          toggleNotification(true);
        }

        if (paymentData) {
          const html = paymentData?.initiatePayment?.data.answer.payment_zone_data;
          const doc = iframeRef?.current?.contentWindow?.document;
          transactionId = paymentData?.initiatePayment?.data?.answer?.transaction_id as string;

          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            setLoading(false);
          }
        }
      }
    })();
  }, [cardDetailsSections?.timeZone, cardDetailsSections?.txnType, reservationInfo]);

  const handleChange = () => {
    const checkInToken = getCheckInToken();
    setTimeout(async () => {
      if (transactionId) {
        try {
          const { data: paymentStatusData } = await client.query({
            query: GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID,
            context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
            fetchPolicy: 'network-only',
            variables: { paymentId: transactionId },
          });

          const status = paymentStatusData?.getPaymentStatus.data['status '];

          if (status === 'Success') {
            reservationGuestInfoStorageData({
              ...guestReservationInfo,
              token: paymentStatusData?.getPaymentStatus?.data['token'],
              cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber '],
              cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName '],
              cardType: paymentStatusData?.getPaymentStatus?.data['paymentMethod '],
              cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
              approvalCode: paymentStatusData?.getPaymentStatus?.data['approvalCode'],
              paymentType: paymentStatusData?.getPaymentStatus?.data['cardType '],
            });
            setErrorNotification(false);
            toggleNotification(true);
            navigate(availablePaths?.CARD_AUTHORISATION);
          }
          if (status === 'Failed') {
            setErrorNotification(true);
            toggleNotification(true);
            navigate(availablePaths?.CARD_AUTHORISATION);
          }
        } catch (paymentStatusError) {
          setErrorNotification(true);
          toggleNotification(true);
        }
      }
    }, 1500);
  };

  return (
    <div>
      <iframe
        title='Payment'
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        ref={iframeRef}
        onLoad={handleChange}
      />

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

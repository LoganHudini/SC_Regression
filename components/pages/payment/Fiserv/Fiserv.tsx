/* eslint-disable camelcase */
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { client } from 'core/graphql/client';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { INITIATE_PAYMENT_FISERV } from 'core/graphql/queries/INITIATE_PAYMENT';
import React, { useEffect, useRef, useState } from 'react';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import { GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID } from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { useTranslation } from 'react-i18next';
import { CHECK_IN, CREDIT_CARD_INFO, FAILURE, INFORMATION, SUCCESS } from 'utils/constants';
import cx from 'classnames';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { fetchCharges } from 'utils/functions';
import { processStatusCode } from 'utils/processError';

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
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);

  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const cardDetailsSections = guestSubmodule?.details
    ?.filter((section: any) => section?.isActive)
    ?.find((cardDetails: any) => cardDetails.name === CREDIT_CARD_INFO);

  const reservationInfo = reservationData && reservationData?.getReservation?.data;

  useEffect(() => {
    const preparePayment = async () => {
      const checkInToken = await getCheckInToken();
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
              clientName: 'rest_e',
              headers: { Authorization: 'Bearer ' + checkInToken },
            },
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
              toggleNotification(true));
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
    };
    preparePayment();
  }, [cardDetailsSections?.timeZone, cardDetailsSections?.txnType, reservationInfo, t]);

  const handleChange = () => {
    setTimeout(async () => {
      if (transactionId) {
        try {
          const { data: paymentStatusData } = await client.query({
            query: GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID,
            context: {
              clientName: 'rest',
              headers: { Authorization: 'Bearer ' + (await getCheckInToken()) },
            },
            fetchPolicy: 'network-only',
            variables: {
              paymentId: transactionId,
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
              cardType: paymentStatusData?.getPaymentStatus?.data['paymentMethod '],
              cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
              approvalCode: paymentStatusData?.getPaymentStatus?.data['approvalCode'],
              paymentType: paymentStatusData?.getPaymentStatus?.data['cardType '],
            });
            notificationStorage({
              title: t('Thank You!') as string as string,
              description: t('Card Authentication Completed') as string,
              type: SUCCESS,
            });
            toggleNotification(true);
            navigate(availablePaths?.CARD_AUTHORISATION);
          } else if (status === 'Failed') {
            notificationStorage({
              title: t('Payment Failed!') as string,
              description: t('Card Authentication Failed!') as string,
              type: FAILURE,
            });
            toggleNotification(true);
            navigate(availablePaths?.CARD_AUTHORISATION);
          }
        } catch (paymentStatusError) {
          const statusCode = processStatusCode(paymentStatusError as ApolloError);
          statusCode === 403
            ? handleCheckInAuthenticationFailure(handleChange)
            : (notificationStorage({
                title: t('Payment Failed!') as string,
                description: t('Card Authentication Failed!') as string,
                type: FAILURE,
              }),
              toggleNotification(true));
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
    </div>
  );
};

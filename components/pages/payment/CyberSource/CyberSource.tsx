import { ApolloError, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import { Header } from 'components/shared/Header/Header';
import { client } from 'core/graphql/client';
import {
  IGetReservationApiResponse,
  GET_RESERVATION,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_SHIFT4,
  INITIATE_PAYMENT_CYBERSOURCE,
  INITIATE_PAYMENT_FISERV,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import Head from 'next/head';
import styles from '@styles/check-in-payment/check-in-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { IPreCheckInApiRequest, PRECHECKIN } from 'core/graphql/queries/PRECHECKIN';
import { IGetRoomStatusApiResponse, GET_ROOM_STATUS } from 'core/graphql/queries/GET_ROOM_STATUS';
import {
  IGetPaymentStatusApiResponse,
  GET_PAYMENT_STATUS,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { toast } from 'react-toastify';
import { processError } from 'utils/processError';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { saveTrip } from 'storage/trips.storage';
import {
  personalizeYourRoomStorage,
  specialRequestsStorage,
} from 'storage/personalize-your-room.storage';
import { guestInformationStorage } from 'storage/guest-information.storage';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useConfig } from 'utils/hooks/useConfiguration';

const CyberSource: React.FC = () => {
  let transactionId: string;
  const navigate = useLocalizedRouter();
  const hotelName = useConfig()?.name;

  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(['check-in-payment', 'common']);

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation.data;

  const onPaymentDone = useCallback(async () => {
    navigate(availablePaths.GUEST_INFORMATION_INPUT);
  }, [navigate, t]);

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
      processError(t, getUpdatedReservationError as ApolloError);
      navigate(availablePaths.GUEST_INFORMATION_INPUT);
    }

    if (updatedReservationData) {
      const balance = Number(updatedReservationData?.getReservation.data?.roomTypes[0].balance);

      // if (balance <= 0) {
      //   onPaymentDone();
      // }

      // if (balance > 0) {
      const initiatePaymentPayload: IInitiatePaymentApiRequest = {
        currency: reservationInfo?.details.holdAmount.currency as string,
        amount: 2,
        bookingId: reservationInfo?.confirmationId as string,
        orderId: reservationInfo?.confirmationId as string,
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
        processError(t, initiatePaymentError as ApolloError);
        navigate(availablePaths.GUEST_INFORMATION_INPUT);
      }

      if (paymentData) {
        const html = paymentData.initiatePayment.data.answer.payment_zone_data;
        const doc = iframeRef.current?.contentWindow?.document;

        transactionId = paymentData.initiatePayment.data.answer.transaction_id as string;

        if (doc) {
          doc.open();
          doc.write(html as string);
          (doc.getElementById('payForm') as HTMLFormElement).submit();
          doc.close();
          setLoading(false);
        }
      }
      // }
    }
  }, [
    onPaymentDone,
    reservationInfo?.confirmationId,
    reservationInfo?.details.holdAmount.currency,
    navigate,
    t,
  ]);

  const handleIframeChange = useCallback(() => {
    setTimeout(async () => {
      if (transactionId) {
        try {
          const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
            query: GET_PAYMENT_STATUS,
            context: { clientName: 'rest' },
            fetchPolicy: 'network-only',
            variables: { paymentId: transactionId },
          });

          const status = paymentStatusData?.getPaymentStatus.data['status '];

          if (status === 'Success') {
            reservationGuestInfoStorageData({
              ...guestReservationInfo,
              cardNumber: paymentStatusData?.getPaymentStatus.data['cardNumber '],
              cardHolderName: paymentStatusData?.getPaymentStatus.data['cardHolderName '],
              cardType: paymentStatusData?.getPaymentStatus.data['paymentMethod '],
              cardExpiryDate: paymentStatusData?.getPaymentStatus.data['cardExpiry'],
            });
            navigate(availablePaths.GUEST_INFORMATION_INPUT);
          }
          if (status === 'Failed') {
            toast('Card Authentication Failed', { type: 'error' });
            navigate(availablePaths.GUEST_INFORMATION_INPUT);
          }
        } catch (paymentStatusError) {
          processError(t, paymentStatusError as ApolloError);
        }
      }
    }, 1500);
  }, [onPaymentDone, navigate, t]);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
    }
    preparePayment();
  }, [preparePayment, reservationData, navigate]);

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Payment')}
        </title>
      </Head>
      <Header
        backRoute={availablePaths?.GUEST_INFORMATION_INPUT}
        displayBackButton
        screenTitle={t('Payment') as string}
      />
      {loading && <PaymentLoader />}
      <PageWrapper>
        <iframe
          ref={iframeRef}
          className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
          onLoad={handleIframeChange}
        />
      </PageWrapper>
    </>
  );
};

export default CyberSource;

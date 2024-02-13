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

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          const html = data.initiatePayment.data.answer.payment_zone_data;
          const doc = iframeRef.current?.contentWindow?.document;

          setPaymentIntent(data?.initiatePayment?.data?.answer?.intent);
          transactionId.current = data?.initiatePayment?.data?.answer?.transaction_id as string;

          if (doc) {
            doc.open();
            doc.write(html as string);
            doc.getElementById('hpc--card-frame')?.setAttribute('height', '100%');
            doc.getElementById('hpc--card-frame')?.setAttribute('width', '100%');
            doc.close();
          }
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
      if (transactionId.current) {
        const cardOptions = [
          { code: 'MC', value: 'Mastercard' },
          { code: 'VS', value: 'Visa' },
          { code: 'AX', value: 'Americanexpress' },
        ];

        const getPaymentStatusPayload = {
          paymentIntent: data?.data?.paymentKeys && data?.data?.paymentKeys[0],
          token: [paymentIntent],
        };

        try {
          const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
            query: GET_FREEDOMPAY_STATUS,
            context: { clientName: 'rest_v3' },
            fetchPolicy: 'network-only',
            variables: { body: getPaymentStatusPayload },
          });

          const status = paymentStatusData?.getPaymentStatus.data['status '];

          // const response = {
          //   status: 'ok',
          //   data: {
          //     amount: 0,
          //     floatAmount: 0,
          //     currency: 'USD',
          //     status: 'Failed',
          //     checksum: '',
          //     id_order: '80c608e6-078d-486a-ab6e-b18444ea30bc',
          //     transaction_id: '',
          //     reference: null,
          //     type: '',
          //     additional_param: '',
          //     payment_method: 'Card',
          //     merchant_id_order: '80c608e6-078d-486a-ab6e-b18444ea30bc',
          //     payment_date: '0001-01-01T00:00:00Z',
          //     cardNumber: '',
          //     cardType: '',
          //     cardTypeCode: '',
          //     cardHolderName: '',
          //     cardExpiry: '20--01',
          //     referenceNumber: '',
          //     token: {},
          //     email: '',
          //     country: '',
          //     expiresAt: '0001-01-01T00:00:00Z',
          //     updatedAt: '0001-01-01T00:00:00Z',
          //     referenceId: '',
          //     linkId: '',
          //   },
          // };

          // const sucess = {
          //   status: 'ok',
          //   data: {
          //     amount: 0,
          //     floatAmount: 0,
          //     currency: 'USD',
          //     status: 'Success',
          //     checksum: '',
          //     id_order: 'e7d2b213-1a56-4420-86dc-0ec7d6c5fb7c',
          //     transaction_id: '404040512785818',
          //     reference: null,
          //     type: '',
          //     additional_param: '',
          //     payment_method: 'Card',
          //     merchant_id_order: 'e7d2b213-1a56-4420-86dc-0ec7d6c5fb7c',
          //     payment_date: '2024-02-09T14:14:40Z',
          //     cardNumber: '421389xxxxxx9025',
          //     cardType: 'VS',
          //     cardTypeCode: '',
          //     cardHolderName: '',
          //     cardExpiry: '2027-5-01',
          //     referenceNumber: '',
          //     token: {
          //       id_token: '4213890A1009G192OS8VHSSC9025',
          //     },
          //     email: '',
          //     country: '',
          //     expiresAt: '0001-01-01T00:00:00Z',
          //     updatedAt: '0001-01-01T00:00:00Z',
          //     referenceId: '',
          //     linkId: '',
          //   },
          // };

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
        console.log(event?.data?.data);
        // handlePaymentResponse(event?.data);
      }
    };
  }

  return (
    <>
      {loading && <PaymentLoader />}

      <iframe
        ref={iframeRef}
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
      ></iframe>
      {/* 
      <iframe
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        src={
          'https://hpc.uat.freedompay.com/api/v1.5/controls?sessionKey=' + paymentIntent
            ? paymentIntent
            : ''
        }
      ></iframe> */}
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

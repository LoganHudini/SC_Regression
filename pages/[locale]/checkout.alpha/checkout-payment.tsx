import { ApolloError, useQuery } from '@apollo/client';
import cx from 'classnames';
import { Header } from 'components/shared/Header/Header';
import { client } from 'core/graphql/client';
import {
  IGetReservationApiResponse,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import Head from 'next/head';
import styles from '../../../styles/checkout-payment/checkout-payment.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IGetPaymentStatusApiResponse,
  GET_PAYMENT_STATUS,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { toast } from 'react-toastify';
import { processError } from 'utils/processError';
import { PaymentLoader } from 'components/pages/payment/PaymentLoader/PaymentLoader';
import { ckeckoutTrip } from 'storage/trips.storage';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { ICheckoutApiRequest, CHECKOUT } from 'core/graphql/queries/CHECKOUT';
import { IInvoiceApiResponse, INVOICE } from 'core/graphql/queries/INVOICE';
import { useCheckedIn } from 'storage/check-in.storage';

export { getStaticPaths };

let transactionId: string;

const CheckOutPayment: React.FC = () => {
  const navigate = useLocalizedRouter();

  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(['check-out-payment', 'common']);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkedInData = useCheckedIn();

  const { data: reservationData } = useQuery<IGetReservationApiResponse>(
    GET_RESERVATION_NO_LAST_NAME,
    {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: checkedInData.reservationId,
      },
    },
  );

  const invoiceData = client.readQuery<IInvoiceApiResponse>({
    query: INVOICE,
  });

  const reservationInfo = reservationData?.getReservation.data;

  const reservationType = reservationInfo?.confirmationType as string;
  const reservationId = reservationInfo?.reservationId as string;
  const bookingId = reservationInfo?.uniqueBookingId as string;

  const onPaymentDone = useCallback(async () => {
    try {
      const checkoutPayload: ICheckoutApiRequest = {
        reservationType,
        reservationId,
        bookingId,
        paymentType: 'OPIVA',
      };

      await client.query({
        query: CHECKOUT,
        context: { clientName: 'rest' },
        variables: {
          body: checkoutPayload,
        },
      });

      navigate(availablePaths.CHECKOUT_CONFIRMATION);
      ckeckoutTrip({ reservationId });
    } catch (error) {
      processError(t, error as ApolloError);
    }
  }, [bookingId, navigate, reservationId, reservationType, t]);

  const preparePayment = useCallback(async () => {
    const initiatePaymentPayload: IInitiatePaymentApiRequest = {
      currency: reservationInfo?.details.holdAmount.currency as string,
      amount: Number(invoiceData?.invoice.data.totalDueAmount),
      bookingId: reservationInfo?.confirmationId as string,
    };

    let paymentData: IInitiatePaymentApiResponse | null = null;

    try {
      const { data } = await client.query<IInitiatePaymentApiResponse>({
        query: INITIATE_PAYMENT,
        variables: { body: initiatePaymentPayload },
        context: { clientName: 'rest' },
        fetchPolicy: 'network-only',
      });

      paymentData = data;
    } catch (initiatePaymentError) {
      processError(t, initiatePaymentError as ApolloError);
      navigate(availablePaths.BILL);
    }

    if (paymentData) {
      const html = paymentData.initiatePayment.data.answer.payment_zone_data;
      const doc = iframeRef.current?.contentWindow?.document;

      transactionId = paymentData.initiatePayment.data.answer.transaction_id as string;

      if (doc) {
        doc.open();
        doc.write(html as string);
        doc.close();
        setLoading(false);
      }
    }
  }, [
    reservationInfo?.details.holdAmount.currency,
    reservationInfo?.confirmationId,
    invoiceData?.invoice.data.totalDueAmount,
    t,
    navigate,
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
            onPaymentDone();
          }
          if (status === 'Failed') {
            navigate(availablePaths.BILL);
            toast('Payment failed', { type: 'error' });
          }
        } catch (paymentStatusError) {
          processError(t, paymentStatusError as ApolloError);
        }
      }
    }, 1500);
  }, [onPaymentDone, navigate, t]);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.GET_RESERVATION);
    }
    preparePayment();
  }, [preparePayment, reservationData, navigate]);

  return (
    <>
      <Head>
        <title>{t('Payment')}</title>
      </Head>
      <Header backRoute='/room-assigned' displayBackButton screenTitle={t('Payment') as string} />
      {loading && <PaymentLoader />}
      <iframe
        ref={iframeRef}
        className={cx(styles.paymentWindow, { [styles.paymentWindowHidden]: loading })}
        onLoad={handleIframeChange}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['checkout-payment', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default CheckOutPayment;

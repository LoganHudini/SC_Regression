import { BottomMenu } from 'components/shared/BottomMenu/BottomMenu';
import { Header } from 'components/shared/Header/Header';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from '../../../styles/bill/bill.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { EmailMe } from 'components/pages/bill/EmailMe/EmailMe';
import { ConfirmCheckout } from 'components/pages/bill/ConfirmCheckout/ConfirmCheckout';
import { BillElementSkeleton } from 'components/pages/bill/BillElementSkeleton/BillElementSkeleton';
import { BillSummary } from 'components/pages/bill/BillSummary/BillSummary';
import { BillSummarySkeleton } from 'components/pages/bill/BillSummarySkeleton/BillSummarySkeleton';
import { BillElement } from 'components/pages/bill/BillElement/BillElement';
import { TotalBill } from 'components/pages/bill/TotalBill/TotalBill';
import { TotalBillSkeleton } from 'components/pages/bill/TotalBillSkeleton/TotalBillSkeleton';
import { useCheckedIn } from 'storage/check-in.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  IGetReservationApiResponse,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import { useQuery } from '@apollo/client';
import { IInvoiceApiResponse, INVOICE } from 'core/graphql/queries/INVOICE';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import i18nConfig from 'next-i18next.config';
import { client } from 'core/graphql/client';
import { availablePaths } from 'utils/availablePaths';
import { getStaticPaths } from 'utils/getStatic';

export { getStaticPaths };

const Bill = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('bill');

  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const checkedInData = useCheckedIn();

  const {
    data: reservationData,
    loading: reservationLoading,
    error: reservationError,
  } = useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
    context: { clientName: 'rest' },
    variables: {
      confirmationNumber: checkedInData.reservationId,
    },
  });
  const {
    data: invoiceData,
    loading: invoiceLoading,
    error: invoiceError,
  } = useQuery<IInvoiceApiResponse>(INVOICE, {
    context: { clientName: 'rest' },
    fetchPolicy: 'network-only',
    variables: {
      confirmationNumber: checkedInData.bookingId,
    },
  });

  const invoiceElements = invoiceData?.invoice.data.billItems;

  const reservationInfo = reservationData?.getReservation.data;

  const toggleCheckoutOpened = useCallback(() => {
    if (!checkoutOpened) {
      client.writeQuery({
        query: INVOICE,
        data: invoiceData,
      });
    }

    setCheckoutOpened((oldState) => !oldState);
  }, [checkoutOpened, invoiceData]);

  useEffect(() => {
    if (!checkedInData.checkedIn || reservationError || invoiceError) {
      navigate(availablePaths.HOME);
    }
  }, [
    checkedInData.checkedIn,
    checkedInData.reservationId,
    invoiceError,
    reservationError,
    navigate,
  ]);

  const loading = invoiceLoading || reservationLoading;

  return (
    <>
      <Head>
        <title>{t('Stay Summary')}</title>
      </Head>
      <Header screenTitle={t('Stay Summary') as string} displayBackButton />
      <div className={styles.wrapper}>
        {loading ? (
          <BillSummarySkeleton />
        ) : (
          <BillSummary
            checkInDate={reservationInfo?.details.checkInDate as string}
            checkOutDate={reservationInfo?.details.checkOutDate as string}
            roomNumber={reservationInfo?.roomTypes[0].roomNumber as string}
          />
        )}

        <div className={styles.billElements}>
          {loading ? (
            <>
              <BillElementSkeleton />
              <BillElementSkeleton />
              <BillElementSkeleton />
              <BillElementSkeleton />
              <BillElementSkeleton />
            </>
          ) : (
            invoiceElements?.map((el, index) => (
              <BillElement
                key={index}
                title={el.name}
                price={el.amount}
                chequeNo={el.cheque_no}
                date={el.time_stamp}
              />
            ))
          )}

          {loading ? (
            <TotalBillSkeleton />
          ) : (
            <TotalBill
              totalAmountDue={invoiceData?.invoice.data.totalDueAmount as string}
              totalBillAmount={invoiceData?.invoice.data.totalBillAmount as string}
            />
          )}
        </div>

        <div className={styles.buttonsWrapper}>
          {loading ? (
            <>
              <div className={cx(styles.button, styles.animation)} />
              <div className={cx(styles.button, styles.animation)} />
            </>
          ) : (
            <>
              <StyledButton
                onClick={toggleCheckoutOpened}
                className={styles.button}
                variant='contained'
              >
                {t('Pay & Checkout')}
              </StyledButton>
            </>
          )}
        </div>

        <BottomMenu />
      </div>

      <ConfirmCheckout
        totalAmountDue={invoiceData?.invoice.data.totalDueAmount as string}
        toggleOpened={toggleCheckoutOpened}
        opened={checkoutOpened}
        reservationType={reservationInfo?.confirmationType as string}
        reservationId={checkedInData.reservationId as string}
        bookingId={reservationInfo?.uniqueBookingId as string}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['bill', 'common'], i18nConfig)),
    },
  };
};

export default Bill;

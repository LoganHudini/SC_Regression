import { Header } from 'components/shared/Header/Header';
import React, { useEffect, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/checkout/checkout.module.scss';
import CheckoutDrawer from 'components/pages/checkout/CheckoutDrawer/CheckoutDrawer';
import { useQuery, useReactiveVar } from '@apollo/client';
import { toggleOpenCheckOutDrawer } from 'storage/checkout.storage';
import { toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { BillSummary } from 'components/pages/bill/BillSummary/BillSummary';
import { IInvoiceApiResponse, INVOICE } from 'core/graphql/queries/INVOICE';
import {
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';
import { BillElement } from 'components/pages/bill/BillElement/BillElement';
import { TotalBill } from 'components/pages/bill/TotalBill/TotalBill';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { client } from 'core/graphql/client';
import { EMAIL_INVOICE } from 'core/graphql/queries/EMAIL_INVOICE';
import { Notification } from 'components/shared/Notification/Notification';
import { availablePaths } from 'utils/availablePaths';
import { Loader } from 'components/shared/Loaders/Loaders';

export { getStaticPaths };

const CheckOut = () => {
  const { t } = useTranslation('common');
  const [openNotification, setOpenNotification] = useState(false);
  const openCheckOutDrawer = useReactiveVar(toggleOpenCheckOutDrawer);
  const checkedInData = useCheckedIn();
  const [emailLoader, setEmailLoader] = useState(false);
  const { data: reservationData, loading: reservationLoading } =
    useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: checkedInData.reservationId,
      },
    });

  const { data: invoiceData, loading: invoiceLoading } = useQuery<IInvoiceApiResponse>(INVOICE, {
    context: { clientName: 'rest' },
    fetchPolicy: 'network-only',
    variables: {
      confirmationNumber: checkedInData?.invoiceId,
    },
  });

  const loading = invoiceLoading || reservationLoading;
  const guestData = reservationData?.getReservation?.data?.guests[0];
  const invoiceElements = invoiceData?.invoice?.data?.billItems;
  const roomNo = reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber;
  const reservationInfo = reservationData?.getReservation?.data;

  useEffect(() => {
    if (openCheckOutDrawer) {
      setTimeout(() => {
        toggleDetailsDrawer(true);
      }, 1000);
    }
  }, [openCheckOutDrawer]);

  const handleMail = async () => {
    setEmailLoader(true);
    const emailInvoicePayload = {
      registeredGuest: `${guestData?.firstName} ${guestData?.lastName}`,
      email: guestData?.emails[0],
      checkInDate: reservationInfo?.details?.checkInDate,
      checkOutDate: reservationInfo?.details?.checkOutDate,
      totalBillAmount: invoiceData?.invoice?.data?.totalBillAmount,
      billItems: invoiceElements,
      totalDueAmount: invoiceData?.invoice?.data?.totalDueAmount,
    };

    try {
      await client.query({
        query: EMAIL_INVOICE,
        context: { clientName: 'rest' },
        fetchPolicy: 'network-only',
        variables: {
          confirmationNumber: checkedInData?.reservationId,
          body: emailInvoicePayload,
        },
      });
      toggleNotification(true);
      setEmailLoader(false);
    } catch (getUpdatedReservationError) {
      setEmailLoader(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('Checkout')}</title>
      </Head>
      <Header displayHome screenTitle={t('Stay Summary') as string} />
      <PageWrapper displayBottomMenu className={styles.pageWrapper}>
        {loading ? (
          <Loader />
        ) : (
          <>
            <BillSummary
              checkInDate={reservationInfo?.details?.checkInDate as string}
              checkOutDate={reservationInfo?.details?.checkOutDate as string}
              roomNumber={reservationInfo?.roomTypes[0]?.roomNumber as string}
            />
            <div className={styles.billElements}>
              {((invoiceElements && invoiceElements?.length) ?? 0) > 0 ? (
                invoiceElements?.map((el, index) => (
                  <BillElement
                    key={index}
                    title={el.name}
                    price={el.amount}
                    chequeNo={el.cheque_no}
                    date={el.time_stamp}
                  />
                ))
              ) : (
                <div className={styles.empty}></div>
              )}
              {invoiceData?.invoice?.data?.totalDueAmount &&
                invoiceData?.invoice?.data?.totalBillAmount && (
                  <TotalBill
                    totalAmountDue={invoiceData?.invoice?.data?.totalDueAmount as string}
                    totalBillAmount={invoiceData?.invoice?.data?.totalBillAmount as string}
                  />
                )}
            </div>
            <StyledButton
              loading={emailLoader}
              className={styles.button}
              onClick={() => handleMail()}
            >
              {t('EMAIL')}
            </StyledButton>
          </>
        )}
      </PageWrapper>
      <CheckoutDrawer setOpenNotification={setOpenNotification} />
      <Notification
        title={
          !openNotification
            ? (t('Mail sent successfully') as string)
            : (t('You’ve Checkedout') as string)
        }
        description={
          !openNotification
            ? (t('Hope you had a pleasant stay with us.') as string)
            : (t(
                'Hope you had a pleasant stay with us. We look forward to your next visit.\n Thank You',
              ) as string)
        }
        type='success'
        redirect={!openNotification ? availablePaths.BILL : availablePaths.HOME}
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

export default CheckOut;

import { Header } from 'components/shared/Header/Header';
import React, { useEffect, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/checkout/checkout.module.scss';
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
import { useConfig } from 'utils/hooks/useConfiguration';
import { FAILURE, SUCCESS } from 'utils/constants';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';

export { getStaticPaths };

const CheckOut = () => {
  const { t } = useTranslation('common');
  const hotelName = useConfig()?.name;
  const navigate = useLocalizedRouter();
  const [errorToggle, setErrorToggle] = useState<any>();

  const openCheckOutDrawer = useReactiveVar(toggleOpenCheckOutDrawer);
  const checkedInData = useCheckedIn();
  const [emailLoader, setEmailLoader] = useState(false);

  useEffect(() => {
    if (checkedInData && !checkedInData?.checkedIn) {
      navigate(availablePaths?.HOME);
    }
  }, [checkedInData, navigate]);

  const { data: reservationData, loading: reservationLoading } =
    useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: checkedInData?.reservationId,
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
  const invoiceElements = invoiceData?.invoice?.data?.billItems;
  const reservationInfo = reservationData?.getReservation?.data;
  const currency = reservationInfo?.details?.holdAmount?.currency ?? '';

  useEffect(() => {
    if (openCheckOutDrawer) {
      setTimeout(() => {
        toggleDetailsDrawer(true);
      }, 2000);
    }
  }, [openCheckOutDrawer]);

  const handleMail = async () => {
    setEmailLoader(true);
    const emailInvoicePayload = {
      registeredGuest: checkedInData?.name,
      email: checkedInData?.email,
      checkInDate:
        reservationInfo?.details?.checkInDate?.split('T')[0] +
        ' ' +
        dayjs(
          `${reservationInfo?.details?.checkInDate?.split('T')[0]}${
            reservationInfo?.details?.contactPerson?.eta?.split('.')[0]
          }`,
        )?.format('HH:mm'),
      checkOutDate:
        reservationInfo?.details?.checkOutDate?.split('T')[0] +
        ' ' +
        dayjs(
          `${reservationInfo?.details?.checkOutDate?.split('T')[0]}${
            reservationInfo?.details?.contactPerson?.etd?.split('.')[0]
          }`,
        )?.format('HH:mm'),
      totalBillAmount: invoiceData?.invoice?.data?.totalBillAmount,
      billItems: invoiceElements,
      totalDueAmount: invoiceData?.invoice?.data?.totalDueAmount,
      roomNumber:
        checkedInData?.roomNumber || (reservationInfo?.roomTypes[0]?.roomNumber as string),
      currencyCode: currency,
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
      setEmailLoader(false);
      setErrorToggle({
        state: false,
        message: 'Mail sent successfully',
        type: 'email',
        description: 'Please check your mailbox.',
      });
    } catch (getUpdatedReservationError) {
      setErrorToggle({
        state: true,
        message: 'Oops!',
        type: 'email',
        description: 'Something went wrong',
      });
      setEmailLoader(false);
    }
    toggleNotification(true);
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Checkout')}
        </title>
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
                    currency={currency}
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
                    currency={currency}
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
      <CheckoutDrawer setErrorToggle={setErrorToggle} />
      <Notification
        title={errorToggle?.message}
        description={errorToggle?.description}
        type={errorToggle?.state ? FAILURE : SUCCESS}
        redirect={
          errorToggle?.type === 'feedback'
            ? availablePaths?.FEEDBACK
            : errorToggle?.type === 'checkout'
            ? availablePaths?.BILL
            : errorToggle?.type === 'home'
            ? availablePaths?.HOME
            : null
        }
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

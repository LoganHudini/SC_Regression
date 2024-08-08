import { Header } from 'components/shared/Header/Header';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import styles from '@styles/checkout/checkout.module.scss';
import CheckoutDrawer from 'components/pages/checkout/CheckoutDrawer/CheckoutDrawer';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { toggleOpenCheckOutDrawer } from 'storage/checkout.storage';
import { notificationStorage, toggleDetailsDrawer, toggleNotification } from 'storage/home.storage';
import { BillSummary } from 'components/pages/bill/BillSummary/BillSummary';
import { IInvoiceApiResponse, INVOICE } from 'core/graphql/queries/INVOICE';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { checkinStorage, useCheckedIn } from 'storage/check-in.storage';
import { BillElement } from 'components/pages/bill/BillElement/BillElement';
import { TotalBill } from 'components/pages/bill/TotalBill/TotalBill';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { client } from 'core/graphql/client';
import { EMAIL_INVOICE } from 'core/graphql/queries/EMAIL_INVOICE';
import { availablePaths } from 'utils/availablePaths';
import { Loader } from 'components/shared/Loaders/Loaders';
import { useConfig } from 'utils/hooks/useConfiguration';
import { FAILURE, INHOUSE, INVALID_DATE, SUCCESS } from 'utils/constants';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import dayjs from 'dayjs';
import { checkoutTrip, saveTrip } from 'storage/trips.storage';

export { getStaticPaths };

const CheckOut = () => {
  const { t } = useTranslation(['bill', 'common']);
  const config = useConfig();
  const hotelName = config?.name;
  const openCheckOutDrawer = useReactiveVar(toggleOpenCheckOutDrawer);
  const checkedInData = useCheckedIn();
  const [emailLoader, setEmailLoader] = useState(false);
  const [reservationData, setReservationData] = useState<IGetReservationApiResponse>();
  const [invoiceData, setInvoiceData] = useState<IInvoiceApiResponse>();
  const [loading, setLoading] = useState(true);
  const hotelId = config?.hotelId;
  const checkInToken: { current?: string } = useRef();

  const fetchInvoice = useCallback(
    async (invoiceId: string) => {
      checkInToken.current = await getCheckInToken(
        checkedInData?.reservationId?.toString()?.trim(),
        checkedInData?.lastName?.toString()?.trim(),
      );
      try {
        const { data } = await client.query({
          query: INVOICE,
          context: {
            clientName: 'rest',
            headers: {
              Authorization: 'Bearer ' + checkInToken.current,
            },
          },
          variables: {
            reservationId: invoiceId,
            confirmationId: checkedInData?.reservationId,
          },
          fetchPolicy: 'no-cache',
        });
        setInvoiceData(data);
        setLoading(false);
      } catch (error) {
        const statusCode = processStatusCode(error as ApolloError);
        if (statusCode === 403) {
          handleCheckInAuthenticationFailure(fetchInvoice);
        } else {
          notificationStorage({
            type: FAILURE,
            title: t('Something Went Wrong!'),
            redirect: availablePaths?.HOME,
            description: t('Please try again after sometime.'),
          });
          toggleNotification(true);
        }
      }
    },
    [checkedInData?.lastName, checkedInData?.reservationId, t],
  );

  const fetchReservation = useCallback(async () => {
    try {
      checkInToken.current = await getCheckInToken(
        checkedInData?.reservationId?.toString()?.trim(),
        checkedInData?.lastName?.toString()?.trim(),
      );
      const { data } = await client.query({
        query: GET_RESERVATION,
        context: {
          clientName: 'rest',
          headers: {
            Authorization: 'Bearer ' + checkInToken.current,
          },
        },
        variables: {
          confirmationNumber: checkedInData?.reservationId?.toString()?.trim(),
          lastName: checkedInData?.lastName?.toString()?.trim(),
          hotelId: hotelId,
        },
        fetchPolicy: 'no-cache',
      });
      if (data?.getReservation?.data?.reservationStatus !== INHOUSE) {
        notificationStorage({
          type: FAILURE,
          title: t('Reservation Not Found!'),
          redirect: availablePaths?.HOME,
          description: t('Please enter valid reservation details.'),
        });
        toggleNotification(true);
        checkoutTrip();
      } else {
        setReservationData(data);
        const reservationInformation = data?.getReservation?.data;
        fetchInvoice(reservationInformation?.reservationId);
        saveTrip({
          ...checkedInData,
          firstName: reservationInformation?.details.contactPerson.firstName,
          email: reservationInformation?.details.contactPerson.email,
          reservationId: reservationInformation?.uniqueBookingId,
          invoiceId: reservationInformation?.reservationId,
        });
        checkinStorage({
          ...checkedInData,
          firstName: reservationInformation?.details.contactPerson.firstName,
          email: reservationInformation?.details.contactPerson.email,
          reservationId: reservationInformation?.uniqueBookingId,
          invoiceId: reservationInformation?.reservationId,
          currency: reservationInformation?.details?.holdAmount?.currency,
        });
      }
    } catch (error) {
      const statusCode = processStatusCode(error as ApolloError);
      if (statusCode === 403) {
        handleCheckInAuthenticationFailure(fetchReservation);
      } else {
        notificationStorage({
          type: FAILURE,
          title: t('Please Try Again!'),
          redirect: availablePaths?.HOME,
          description: t('Could not fetch reservation details.'),
        });
        toggleNotification(true);
      }
    }
  }, [checkedInData, fetchInvoice, hotelId, t]);

  useEffect(() => {
    if (checkedInData?.reservationId && checkedInData?.lastName) {
      fetchReservation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedInData?.reservationId, checkedInData?.lastName]);

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
    const validateCheckInCheckOutDate = (date: string, time: string) =>
      dayjs(`${date?.split('T')[0]}${time?.split('.')[0]}`)?.format('HH:mm') !== INVALID_DATE
        ? date?.split('T')[0] +
          ' ' +
          dayjs(`${date?.split('T')[0]}${time?.split('.')[0]}`)?.format('HH:mm')
        : `${date?.split('T')[0]} ${dayjs(time)?.format('HH:mm')}`;

    const emailInvoicePayload = {
      registeredGuest:
        reservationInfo &&
        `${reservationInfo?.guests[0]?.firstName} ${reservationInfo?.guests[0]?.lastName}`,
      email: checkedInData?.email,
      checkInDate:
        reservationInfo &&
        validateCheckInCheckOutDate(
          reservationInfo?.details?.checkInDate,
          reservationInfo?.details?.contactPerson?.eta,
        ),
      checkOutDate:
        reservationInfo &&
        validateCheckInCheckOutDate(
          reservationInfo?.details?.checkOutDate,
          reservationInfo?.details?.contactPerson?.etd,
        ),
      totalBillAmount: `${currency} ${invoiceData?.invoice?.data?.totalBillAmount}`,
      billItems: invoiceElements,
      totalDueAmount: `${currency} ${invoiceData?.invoice?.data?.currentBalance}`,
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
      notificationStorage({
        type: SUCCESS,
        title: t('E-mail sent successfully'),
        description: t('Please check your mailbox.'),
      });
    } catch {
      notificationStorage({
        type: FAILURE,
        title: t('Could not send E-mail'),
        description: t('Please try again after some time.'),
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
      <PageWrapper
        displayBottomMenu
        amountDue={
          invoiceData && (invoiceData?.invoice?.data?.currentBalance as any) > 0 ? false : true
        }
        disabled={reservationData && invoiceData ? false : true}
        className={styles.pageWrapper}
      >
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
              {invoiceData?.invoice?.data?.currentBalance &&
                invoiceData?.invoice?.data?.totalBillAmount && (
                  <TotalBill
                    totalAmountDue={invoiceData?.invoice?.data?.currentBalance as string}
                    totalBillAmount={invoiceData?.invoice?.data?.totalBillAmount as string}
                    currency={currency}
                  />
                )}
            </div>
            {reservationInfo && invoiceElements && checkedInData?.email && (
              <StyledButton
                loading={emailLoader}
                className={styles.button}
                onClick={() => handleMail()}
              >
                {t('EMAIL')}
              </StyledButton>
            )}
          </>
        )}
      </PageWrapper>
      <CheckoutDrawer
        reservationData={reservationData}
        amountDue={invoiceData?.invoice?.data?.currentBalance}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['errors', 'bill', 'common'], i18nConfig)),
    },
  };
};

export default CheckOut;

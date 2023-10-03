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
import styles from '../../../styles/check-in-payment/check-in-payment.module.scss';
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
import { getConfig, paymentConfiguration } from 'utils/getConfiguration';
import { CHECK_IN, CYBERSOURCE, SHIFT4 } from 'utils/constants';
import CyberSource from 'components/pages/payment/CyberSource/CyberSource';
import Shift4 from 'components/pages/payment/Shift4/Shift4';
// import Shift4 from 'components/pages/payment/Shift4/Shift4';

export { getStaticPaths };

const Payment: React.FC = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const paymentConfig = paymentConfiguration;

  // console.log(paymentConfig);

  // const redirectPayment = () => {
  //   switch (paymentConfig?.type) {
  //     case CYBERSOURCE:
  //       return <CyberSource />;
  //     case SHIFT4:
  //       return <Shift4 />;
  //   }
  // };

  return (
    <>
      <Head>
        <title>{t('Payment')}</title>
      </Head>
      <Header backRoute={availablePaths?.GUEST_INFORMATION_INPUT} displayBackButton />
      <PageWrapper>
        {/* {redirectPayment()} */}
        <Shift4 />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['check-in-payment', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default Payment;

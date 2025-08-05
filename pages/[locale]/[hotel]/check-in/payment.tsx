import { Header } from 'components/shared/Header/Header';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import Shift4 from 'components/pages/payment/Shift4/Shift4';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import {
  CYBERSOURCE,
  SHIFT4,
  CCAVENUE,
  FREEDOMPAY,
  OGONE,
  DSP,
  FISERV,
  PLANET,
  PAY_BY_LINK,
  GLOBALBLUE,
} from 'utils/constants';
import CyberSource from 'components/pages/payment/CyberSource/CyberSource';
import { availablePaths } from 'utils/availablePaths';
import CCAvenue from 'components/pages/payment/CCAvenue/CCAvenue';
import FreedomPay from 'components/pages/payment/FreedomPay/FreedomPay';
import DSPIntegration from 'components/pages/payment/DSP/DSP';
import { Ogone } from 'components/pages/payment/Ogone/Ogone';
import { Fiserv } from 'components/pages/payment/Fiserv/Fiserv';
import { Planet } from 'components/pages/payment/Planet/Planet';
import { GlobalBlue } from 'components/pages/payment/GlobalBlue/GlobalBlue';
import { useRouter } from 'next/router';
import { handleReservationPayment } from 'utils/fetchReservation';
import { processStatusCode } from 'utils/processError';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { Loader } from 'components/shared/Loaders/Loaders';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';

export { getStaticPaths };

const Payment: React.FC = () => {
  const { t } = useTranslation(['check-in-payment', 'common', 'check-in']);
  const config = useConfig();
  const hotelName = config?.name;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const resId = router?.query?.resId ?? '';
  const lastName = router?.query?.lastName ?? '';
  const paymentFlow = router?.query?.paymentFlow ?? '';
  const paylinkUniqueId = router?.query?.paylinkUniqueId ?? '';
  const hotelId = config?.hotelId;
  const paymentConfig: any = usePaymentConfig();
  const navigate = useLocalizedRouter();
  const { isReady } = router;

  useEffect(() => {
    if (paymentFlow === PAY_BY_LINK && !paymentConfig?.payByLink) {
      navigate(availablePaths?.HOME);
    }
  }, [paymentFlow, paymentConfig?.payByLink, navigate]);

  useEffect(() => {
    const goToTheNextStep = async () => {
      const values: any = { lastName: lastName, confirmationNumber: resId };
      await handleReservationPayment({
        values,
        hotelId,
        setLoading,
        t,
        processStatusCode,
        goToTheNextStep,
        navigate,
      });
    };
    if (paymentFlow === PAY_BY_LINK && paymentConfig?.payByLink) {
      goToTheNextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastName, paymentFlow, resId]);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  useEffect(() => {
    if (isReady && paymentFlow != PAY_BY_LINK && !reservationData) {
      navigate(availablePaths?.HOME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData, paymentFlow, isReady, navigate]);

  const redirectPayment = () => {
    switch (paymentConfig?.type) {
      case CYBERSOURCE:
        return <CyberSource />;
      case SHIFT4:
        return <Shift4 />;
      case CCAVENUE:
        return <CCAvenue />;
      case FREEDOMPAY:
        return <FreedomPay />;
      case DSP:
        return <DSPIntegration />;
      case OGONE:
        return <Ogone />;
      case FISERV:
        return <Fiserv />;
      case PLANET:
        return <Planet paymentFlow={paymentFlow} paylinkUniqueId={paylinkUniqueId} />;
      case GLOBALBLUE:
        return <GlobalBlue />;
      default:
        break;
    }
  };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Payment')}
        </title>
      </Head>
      {paymentFlow === PAY_BY_LINK ? (
        <Header displayHome />
      ) : (
        <Header displayBackButton backRoute={availablePaths?.CARD_AUTHORISATION} />
      )}
      {loading || !reservationData ? <Loader /> : redirectPayment()}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'check-in-payment', 'common', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default Payment;

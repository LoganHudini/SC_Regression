import { Header } from 'components/shared/Header/Header';
import Head from 'next/head';
import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import Shift4 from 'components/pages/payment/Shift4/Shift4';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { CYBERSOURCE, SHIFT4, CCAVENUE, FREEDOMPAY, OGONE } from 'utils/constants';
import CyberSource from 'components/pages/payment/CyberSource/CyberSource';
import { availablePaths } from 'utils/availablePaths';
import CCAvenue from 'components/pages/payment/CCAvenue/CCAvenue';
import FreedomPay from 'components/pages/payment/FreedomPay/FreedomPay';
import { Ogone } from 'components/pages/payment/Ogone/Ogone';

export { getStaticPaths };

const Payment: React.FC = () => {
  const { t } = useTranslation(['check-in-payment', 'common', 'check-in']);
  const config = useConfig();
  const hotelName = config?.name;
  const paymentConfig: any = usePaymentConfig();

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
      case OGONE:
        return <Ogone />;
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
      <Header displayBackButton backRoute={availablePaths?.CARD_AUTHORISATION} />
      {redirectPayment()}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['check-in-payment', 'common', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default Payment;

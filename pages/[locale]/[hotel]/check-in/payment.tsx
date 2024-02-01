import { Header } from 'components/shared/Header/Header';
import Head from 'next/head';
import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import Shift4 from 'components/pages/payment/Shift4/Shift4';
import { useConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  CREDIT_CARD_INFO,
  CYBERSOURCE,
  FREEDOMPAY,
  INFORMATION,
  SHIFT4,
} from 'utils/constants';
import CyberSource from 'components/pages/payment/CyberSource/CyberSource';
import { availablePaths } from 'utils/availablePaths';
import FreedomPay from 'components/pages/payment/FreedomPay/FreedomPay';

export { getStaticPaths };

const Payment: React.FC = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const config = useConfig();
  const hotelName = config?.name;
  const paymentConfig: any = config?.modules
    ?.find((module: any) => module?.isActive && module?.code === CHECK_IN)
    ?.submodules?.find((submodule: any) => submodule?.isActive && submodule?.name === INFORMATION)
    ?.details?.find((detail: any) => detail?.isActive && detail?.name === CREDIT_CARD_INFO);

  const redirectPayment = () => {
    switch (paymentConfig?.type) {
      case CYBERSOURCE:
        return <CyberSource />;
      case SHIFT4:
        return <Shift4 />;
      case FREEDOMPAY:
        return <FreedomPay />;
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
        ['check-in-payment', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default Payment;

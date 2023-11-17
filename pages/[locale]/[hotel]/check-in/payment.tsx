import { Header } from 'components/shared/Header/Header';
import Head from 'next/head';
import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import Shift4 from 'components/pages/payment/Shift4/Shift4';
import { useConfig } from 'utils/hooks/useConfiguration';

export { getStaticPaths };

const Payment: React.FC = () => {
  const { t } = useTranslation(['check-in-payment', 'common']);
  const hotelName = useConfig()?.name;
  // do not remove
  // const paymentConfig = paymentConfiguration;
  // console.log(paymentConfig);
  // const redirectPayment = () => {
  //   switch (paymentConfig as any) {
  //     case CYBERSOURCE:
  //       return <CyberSource />;
  //     case SHIFT4:
  //       return <Shift4 />;
  //     default:
  //       break;
  //   }
  // };

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Payment')}
        </title>
      </Head>
      <Header displayBackButton />
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

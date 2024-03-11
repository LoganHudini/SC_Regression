import React, { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import cx from 'classnames';
import { GetStaticProps } from 'next';
import { AboutYourStayProps } from 'types/about-your-stay.types';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  CREDIT_CARD_INFO,
  EMAIL_REGEX,
  INFORMATION,
  PHONE,
  PHONE_REGEX,
  EMAILS,
  STEPPER_PAYMENT,
  FAILURE,
  SUCCESS,
  CCAVENUE,
} from 'utils/constants';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage } from 'storage/check-in.storage';
import produce from 'immer';
import {
  PaymentLoaderPopUp,
  PaymentStatusCard,
} from 'components/pages/check-in/PreCheckinPaymentInfo/card-payment';
import { usePersonalisation } from 'utils/hooks/usePersonalisation';
import { openLinknewTab } from 'utils/functions';
import {
  IInitiatePaymentApiRequest,
  IInitiatePaymentApiResponse,
  INITIATE_PAYMENT_CCAVENUE,
} from 'core/graphql/queries/INITIATE_PAYMENT';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import {
  GET_PAYMENT_STATUS,
  IGetPaymentStatusApiResponse,
} from 'core/graphql/queries/GET_PAYMENT_STATUS';
import { toggleNotification } from 'storage/home.storage';
import { Notification } from 'components/shared/Notification/Notification';
import { processStatusCode } from 'utils/processError';

export { getStaticPaths };

const CardAuthorisation: React.FC<AboutYourStayProps> = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const [availablePersonalizations] = usePersonalisation();
  const { t } = useTranslation(['about-your-stay', 'check-in']);
  const transactionId = useRef('');
  const [errorNotification, setErrorNotification] = useState(false);
  const [popUpStatus, setPopUpStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const paymentConfig: any = usePaymentConfig();
  const paymentWindow = useRef<Window | null>(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule.isActive,
  );
  const activeSections = accompanyingGuestSubmodule?.details?.filter(
    (section: any) => section.isActive,
  );
  const creditCardInfoSection = activeSections?.find(
    (section: any) => section?.name === CREDIT_CARD_INFO,
  );

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const goToTheNextStep = useCallback(() => {
    availablePersonalizations?.length > 0
      ? navigate(availablePaths?.PERSONALIZE)
      : navigate(availablePaths?.REVIEW);
  }, [navigate, availablePersonalizations]);

  const validateGuestReservation = (field: any) => {
    if (!guestReservationInfo) {
      return true;
    }

    return field?.every((fieldItem: any) => {
      if (!fieldItem.required) {
        return true;
      }

      const infoValue = guestReservationInfo[fieldItem?.name];

      if (fieldItem.name === PHONE) {
        return PHONE_REGEX.test(infoValue);
      }

      if (fieldItem.name === EMAILS) {
        return EMAIL_REGEX.test(infoValue);
      }

      return !!infoValue;
    });
  };

  const validButton = validateGuestReservation(creditCardInfoSection?.details);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
        if (item) {
          item.value = validButton ? 80 : 40;
          !availablePersonalizations?.length && validButton ? (item.value = 100) : null;
        }
      }),
    );
  }, [validButton, availablePersonalizations]);

  const onPaymentDone = useCallback(() => {
    paymentWindow.current && paymentWindow.current.close();
    setPopUpStatus(false);
  }, []);

  const handleProceedToPayment = useCallback(async () => {
    const checkInToken = getCheckInToken();
    const orderId =
      Math.floor(Math.random() * 9000000000) + 1000000000 + '-' + reservationInfo?.confirmationId;

    const initiatePaymentPayload: IInitiatePaymentApiRequest = {
      currency: reservationInfo?.details?.holdAmount?.currency as string,
      amount: Number(reservationInfo?.roomTypes[0]?.totalCharge) ?? 1,
      bookingId: reservationInfo?.confirmationId as string,
      orderId: orderId,
    };

    try {
      const { data } = await client.query<IInitiatePaymentApiResponse>({
        query: INITIATE_PAYMENT_CCAVENUE,
        variables: {
          body: initiatePaymentPayload,
        },
        context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
        fetchPolicy: 'network-only',
      });
      setUrl(data?.initiatePayment?.data?.answer?.payment_zone_data);
      transactionId.current = orderId;
    } catch (initiatePaymentError) {
      // console.log(initiatePaymentError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationInfo?.confirmationId]);

  const paymentResponse = useCallback(async () => {
    if (transactionId.current) {
      const checkInToken = getCheckInToken();
      const cardOptions = [
        { code: 'MC', value: 'Mastercard' },
        { code: 'VS', value: 'Visa' },
        { code: 'AX', value: 'Americanexpress' },
      ];

      try {
        const { data: paymentStatusData } = await client.query<IGetPaymentStatusApiResponse>({
          query: GET_PAYMENT_STATUS,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          fetchPolicy: 'network-only',
          variables: {
            paymentId: transactionId?.current,
            confirmationId: reservationInfo?.confirmationId,
          },
        });

        const status = paymentStatusData?.getPaymentStatus.data['status '];

        if (status === 'Success') {
          reservationGuestInfoStorageData({
            ...guestReservationInfo,
            token: paymentStatusData?.getPaymentStatus?.data['token'],
            cardNumber: paymentStatusData?.getPaymentStatus?.data['cardNumber '],
            cardHolderName: paymentStatusData?.getPaymentStatus?.data['cardHolderName '],
            cardType: cardOptions?.find(
              (option: any) =>
                option?.value === paymentStatusData?.getPaymentStatus?.data['cardType '],
            )?.code,
            cardExpiryDate: paymentStatusData?.getPaymentStatus?.data['cardExpiry'],
            paymentType: paymentStatusData?.getPaymentStatus?.data['paymentMethod '],
            transactionId: transactionId.current,
          });
          setErrorNotification(false);
          toggleNotification(true);
          onPaymentDone();
        }
        if (status === 'Failed') {
          setErrorNotification(true);
          toggleNotification(true);
          onPaymentDone();
        }
      } catch (paymentStatusError) {
        const statusCode = processStatusCode(paymentStatusError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(paymentResponse)
          : (setErrorNotification(true), toggleNotification(true), onPaymentDone());
      }
    }
  }, [guestReservationInfo, onPaymentDone, reservationInfo?.confirmationId]);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.HOME);
    }
    if (paymentConfig?.type === CCAVENUE) {
      if (!guestReservationInfo?.paymentType) {
        handleProceedToPayment();
      }
      const interval = setInterval(() => {
        if (!guestReservationInfo?.paymentType) {
          paymentResponse();
        }
      }, 6000);

      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestReservationInfo?.paymentType]);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Payment Method')}
        </title>
      </Head>
      <Header
        screenTitle={t(`${accompanyingGuestSubmodule?.label}`) as string}
        displayBackButton
        backRoute={availablePaths?.GUEST_VERIFICATION}
      />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        {!guestReservationInfo?.paymentType && (
          <div className={styles.cardAuthorisationTitleWrapper}>
            <p className={styles.title}>{t('Choose Payment Method')}</p>
            <p className={styles.description}>
              {t('Click ‘Proceed to Payment’ to begin your payment process.')}
            </p>
          </div>
        )}
        {creditCardInfoSection &&
          guestReservationInfo &&
          (!guestReservationInfo?.paymentType ? (
            <PaymentStatusCard
              paymentStatus={true}
              paymentConfig={paymentConfig?.type === CCAVENUE}
              setLoader={setPopUpStatus}
              src={url}
              paymentWindow={paymentWindow}
            />
          ) : (
            <PaymentStatusCard paymentStatus={false} />
          ))}
        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            variant='contained'
            disabled={!validButton || !reservationData}
            onClick={goToTheNextStep}
            className={cx(styles.bottomMenuButton)}
          >
            {t('Next')}
          </StyledButton>
        </div>
        <PaymentLoaderPopUp paymentLoader={popUpStatus} />
        <Notification
          title={errorNotification ? (t('Payment Failed!') as string) : (t('Thank You!') as string)}
          description={
            errorNotification
              ? (t('Card Authentication Failed!') as string)
              : (t('Card Authentication Completed') as string)
          }
          redirect={availablePaths?.CARD_AUTHORISATION}
          type={errorNotification ? FAILURE : SUCCESS}
        />
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
        ['about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default CardAuthorisation;

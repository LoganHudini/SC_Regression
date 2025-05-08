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
  CMS,
  personalisation,
  ROOM,
  ADDON,
  OHIP,
  DEFAULT_PAYMENT_MESSAGE,
} from 'utils/constants';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage } from 'storage/check-in.storage';
import produce from 'immer';
import {
  PaymentLoaderPopUp,
  PaymentStatusCard,
} from 'components/pages/check-in/PreCheckinPaymentInfo/card-payment';
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
import { hotelInformation, notificationStorage, toggleNotification } from 'storage/home.storage';
import { processStatusCode } from 'utils/processError';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { UPDATE_GUEST_DETAILS } from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { getPaymentMessage } from 'utils/functions';

export { getStaticPaths };

const CardAuthorisation: React.FC<AboutYourStayProps> = () => {
  const { t } = useTranslation(['about-your-stay', 'check-in']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const availablePersonalizations = useReactiveVar(personalizationStorage);
  const transactionId = useRef('');
  const [popUpStatus, setPopUpStatus] = useState(false);
  const [url, setUrl] = useState('');
  const paymentConfig: any = usePaymentConfig();
  const paymentWindow = useRef<Window | null>(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const hotelInfo = useReactiveVar(hotelInformation);
  const reservationInfo = reservationData?.getReservation?.data;
  const getPaymentRule = reservationInfo?.paymentRule;
  const details = hotelInfo?.detailsCustomAttributes;
  const paymentMessage = getPaymentMessage(details);

  const PaymentMessage = typeof paymentMessage === 'string' ? JSON.parse(paymentMessage) : {};

  const displayMessage = PaymentMessage[getPaymentRule] || DEFAULT_PAYMENT_MESSAGE;

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const personalisationConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === personalisation && submodule.isActive,
  );
  const accompanyingGuestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule.isActive,
  );
  const activeSections = accompanyingGuestSubmodule?.details?.filter(
    (section: any) => section.isActive,
  );
  const creditCardInfoSection = activeSections?.find(
    (section: any) => section?.name === CREDIT_CARD_INFO,
  );

  const filteredRoomList: any =
    personalisationConfig?.type !== CMS
      ? availablePersonalizations?.length > 0
        ? availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === ADDON)
        : []
      : availablePersonalizations;

  const filteredUpgradeRoomList: any =
    personalisationConfig?.type !== CMS
      ? availablePersonalizations?.length > 0
        ? availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === ROOM)
        : []
      : availablePersonalizations;

  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  const goToTheNextStep = useCallback(async () => {
    if (paymentConfig?.guaranteeCard) {
      const updateGuestDetailsPayload: any = {
        docNumber:
          reservationInfo?.guests[0]?.docNo === guestReservationInfo?.docNo
            ? ''
            : guestReservationInfo?.docNo,
        reservationId: reservationInfo?.confirmationId as string,
        firstName: guestReservationInfo?.firstName,
        lastName: guestReservationInfo?.lastName,
        profileId: reservationInfo?.guests[0]?.id as string,
        isPrimary: 'Y',
        effectiveDate: guestReservationInfo?.issueDate,
        expiryDate: guestReservationInfo?.expiry,
        countryOfIssue: guestReservationInfo?.issueCountry,
        channel: 'PWA',
        updateGuestDetails: {
          name: {
            nameTitle: reservationInfo?.guests[0]?.title,
            firstName: guestReservationInfo?.firstName,
            lastName: guestReservationInfo?.lastName,
            gender: guestReservationInfo?.gender,
            nationality: guestReservationInfo?.nationality ?? '',
            dob: guestReservationInfo?.dob,
            profession: guestReservationInfo?.profession,
          },
          address: {
            id: reservationInfo?.guests[0]?.addressOperaId as string,
            addressLine1: guestReservationInfo?.addressLine,
            addressType: 'HOME',
            countryCode: guestReservationInfo?.countryCode,
            city: guestReservationInfo?.cityName,
            postalCode: guestReservationInfo?.postalCode,
            stateProv: guestReservationInfo?.stateProv,
          },
          phone: {
            id: reservationInfo?.guests[0]?.phoneOperaId
              ? reservationInfo?.guests[0]?.phoneOperaId[0]
              : '',
            phoneType: config?.pms === OHIP ? 'PHONE' : 'HOME',
            phoneNumber: guestReservationInfo?.phone ?? '',
            phoneRole: config?.pms === OHIP ? 'HOME' : 'PHONE',
          },
          email: {
            id: reservationInfo?.guests[0]?.emailOperaId
              ? reservationInfo?.guests[0]?.emailOperaId[0]
              : '',
            email: guestReservationInfo?.emails,
          },
        },
        payment: {
          creditCardType: guestReservationInfo?.cardType,
          cardHolderName:
            guestReservationInfo?.cardHolderName ||
            guestReservationInfo?.firstName + guestReservationInfo?.lastName,
          cardNumber: guestReservationInfo?.cardNumber?.substr(
            guestReservationInfo?.cardNumber?.length - 4,
          ),
          expirationDate: dayjs(guestReservationInfo?.cardExpiryDate as string)?.format(
            timeFormats.MONTH_YEAR_PAYMENT,
          ),
          cardToken: guestReservationInfo?.token,
          tokenProvider: 'LL',
        },
      };

      try {
        const checkInToken = await getCheckInToken();
        await client.query({
          query: UPDATE_GUEST_DETAILS,
          context: {
            clientName: 'rest',
            headers: { Authorization: 'Bearer ' + checkInToken },
          },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: updateGuestDetailsPayload,
          },
        });
        filteredRoomList?.length > 0
          ? navigate(availablePaths?.PERSONALIZE)
          : navigate(availablePaths?.REVIEW);
      } catch (error) {
        const statusCode = processStatusCode(error as ApolloError);
        if (statusCode === 403) {
          handleCheckInAuthenticationFailure(goToTheNextStep);
        }
        toggleNotification(true);
        notificationStorage({
          title: t('Please Try Again!') as string,
          description: t('Failed to update your details.') as string,
          redirect: null,
          type: FAILURE,
        });
      }
    } else {
      filteredRoomList?.length > 0
        ? navigate(availablePaths?.PERSONALIZE)
        : navigate(availablePaths?.REVIEW);
    }
  }, [
    config?.pms,
    filteredRoomList?.length,
    guestReservationInfo?.addressLine,
    guestReservationInfo?.cardExpiryDate,
    guestReservationInfo?.cardHolderName,
    guestReservationInfo?.cardNumber,
    guestReservationInfo?.cardType,
    guestReservationInfo?.cityName,
    guestReservationInfo?.countryCode,
    guestReservationInfo?.dob,
    guestReservationInfo?.docNo,
    guestReservationInfo?.emails,
    guestReservationInfo?.expiry,
    guestReservationInfo?.firstName,
    guestReservationInfo?.gender,
    guestReservationInfo?.issueCountry,
    guestReservationInfo?.issueDate,
    guestReservationInfo?.lastName,
    guestReservationInfo?.nationality,
    guestReservationInfo?.phone,
    guestReservationInfo?.postalCode,
    guestReservationInfo?.profession,
    guestReservationInfo?.stateProv,
    guestReservationInfo?.token,
    navigate,
    paymentConfig?.guaranteeCard,
    reservationInfo?.confirmationId,
    reservationInfo?.guests,
    t,
  ]);

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
    const checkInToken = await getCheckInToken();
    const orderId =
      Math.floor(Math.random() * 9000000000) +
      1000000000 +
      '-' +
      reservationInfo?.confirmationId +
      '-' +
      'Hudini_Pwa';

    const initiatePaymentPayload: IInitiatePaymentApiRequest = {
      currency: 'INR', // reservationInfo?.details?.holdAmount?.currency, commented for testing
      amount: 1, //  Number(reservationInfo?.roomTypes[0]?.totalCharge) ??  (for ITC testing)
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
      const checkInToken = await getCheckInToken();
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
          notificationStorage({
            title: t('Thank You!') as string as string,
            description: t('Card Authentication Completed') as string,
            type: SUCCESS,
          });
          toggleNotification(true);
          onPaymentDone();
        }
        if (status === 'Failed') {
          notificationStorage({
            title: t('Payment Failed!') as string,
            description: t('Card Authentication Failed!') as string,
            type: FAILURE,
          });
          toggleNotification(true);
          onPaymentDone();
        }
      } catch (paymentStatusError) {
        const statusCode = processStatusCode(paymentStatusError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(paymentResponse)
          : (notificationStorage({
              title: t('Payment Failed!') as string,
              description: t('Card Authentication Failed!') as string,
              type: FAILURE,
            }),
            toggleNotification(true),
            onPaymentDone());
      }
    }
  }, [guestReservationInfo, onPaymentDone, reservationInfo?.confirmationId, t]);

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
        backRoute={
          filteredUpgradeRoomList?.length > 0 && personalisationConfig?.type !== CMS
            ? availablePaths.UPGRADE_ROOM
            : availablePaths?.GUEST_VERIFICATION
        }
        language
      />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        {!guestReservationInfo?.paymentType && (
          <div className={styles.cardAuthorisationTitleWrapper}>
            <p className={styles.title}>{t(`${displayMessage?.title}`)}</p>
            <p className={styles.description}>{t(`${displayMessage?.message}`)}</p>
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
        ['errors', 'about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default CardAuthorisation;

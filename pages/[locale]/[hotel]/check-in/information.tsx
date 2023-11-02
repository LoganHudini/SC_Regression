import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { InfoCard } from 'components/shared/InfoCard/InfoCard';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';
import cx from 'classnames';
import { GetStaticProps } from 'next';
import { AboutYourStayProps } from 'types/about-your-stay.types';
import { ApolloError, useReactiveVar, useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { PreCheckinGuestInfo } from 'components/pages/check-in/PreCheckinGuestInfo/PreCheckinGuestInfo';
import { PreCheckinPaymentInfo } from 'components/pages/check-in/PreCheckinPaymentInfo/PreCheckinPaymentInfo';
import { PreCheckinDocInfo } from 'components/pages/check-in/PreCheckinDocInfo/PreCheckinDocInfo';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { processError } from 'utils/processError';
import { useConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  CREDITCARD,
  CREDIT_CARD_INFO,
  EMAIL_REGEX,
  GUESTINFORMATION,
  GUESTICON,
  IDCARD,
  IDENTITYVERIFICATION,
  INFORMATION,
  PHONE,
  PHONE_REGEX,
  EMAILS,
} from 'utils/constants';
import { buttonArrow, updateDocTypeOptions } from 'utils/functions';
import { GET_DOC_TYPES } from 'core/graphql/queries/GET_DOC_TYPES';
import { docTypeStorage } from 'storage/guest-information.storage';

export { getStaticPaths };

const AboutYourStay: React.FC<AboutYourStayProps> = () => {
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const config = useConfig();

  const { t } = useTranslation('about-your-stay');

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const { data: docType, loading: typeLoading } = useQuery(GET_DOC_TYPES, {
    context: { clientName: 'rest' },
  });

  const transformedData = docType?.getDocTypes?.data?.map((item: any) => ({
    value: item?.code,
    name: item?.name,
  }));

  useEffect(() => {
    if (transformedData) {
      docTypeStorage(transformedData);
    }
  }, [docType, docType?.getDocTypes?.data, typeLoading]);

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule.isActive,
  );
  const activeSections = accompanyingGuestSubmodule?.details?.filter(
    (section: any) => section.isActive,
  );

  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION,
  );
  const creditCardInfoSection = activeSections?.find(
    (section: any) => section?.name === CREDIT_CARD_INFO,
  );
  const identityVerificationSection = activeSections?.find(
    (section: any) => section?.name === IDENTITYVERIFICATION,
  );

  const docTypeFunction = updateDocTypeOptions(
    identityVerificationSection?.details,
    transformedData,
  );

  const paymentType = creditCardInfoSection?.type;

  const reservationInfo = reservationData?.getReservation?.data;
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const guestLength = reservationInfo?.guests?.length;

  // console.log(reservationInfo);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.HOME);
    }
  }, [reservationData, navigate]);

  const extractDataForField = useCallback(
    (fieldName: string) => {
      const fieldPath = fieldName.split('.');

      let source: any = reservationInfo?.guests[0];
      const remainingAttributes: any = reservationInfo?.reservePayments[0];

      for (const field of fieldPath) {
        if (source && source[field]) {
          source = source[field];
        } else {
          source = remainingAttributes[field];
          break;
        }
      }

      if (Array.isArray(source)) {
        source = source.join(', ');
      }
      return source;
    },
    [reservationInfo?.guests, reservationInfo?.reservePayments],
  );

  useEffect(() => {
    if (reservationInfo?.guests) {
      const initialGuestReservationInfo = activeSections?.reduce((values: any, section: any) => {
        section?.details?.forEach((field: any) => {
          const { name } = field;
          values[name] = extractDataForField(name);
        });

        return values;
      }, {});

      for (const key in initialGuestReservationInfo) {
        if (Object.prototype.hasOwnProperty.call(initialGuestReservationInfo, key)) {
          if (!initialGuestReservationInfo[key]) {
            initialGuestReservationInfo[key] = '';
          }
        }
      }

      reservationGuestInfoStorageData({
        ...initialGuestReservationInfo,
        ...guestReservationInfo,
        isComplete:
          validateGuestReservation(guestInformationSection?.details) &&
          validateGuestReservation(creditCardInfoSection?.details) &&
          validateGuestReservation(identityVerificationSection?.details),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractDataForField, reservationInfo?.guests]);

  const goToTheNextStep = useCallback(async () => {
    try {
      setLoading(true);
      const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
        docType: guestReservationInfo?.docType,
        docNumber: guestReservationInfo?.docNo,
        reservationId: reservationInfo?.confirmationId as string,
        firstName: guestReservationInfo?.firstName,
        lastName: guestReservationInfo?.lastName,
        profileId: reservationInfo?.guests[0]?.id as string,
        isPrimary: 'Y',
        effectiveDate: guestReservationInfo?.effectiveDate,
        expiryDate: guestReservationInfo?.expiryDate,
        countryOfIssue: guestReservationInfo?.issueCountry,
        channel: 'PWA',
        updateGuestDetails: {
          name: {
            firstName: guestReservationInfo?.firstName,
            lastName: guestReservationInfo?.lastName,
            nationality: guestReservationInfo?.nationality,
            dob: guestReservationInfo?.dob,
          },
          address: {
            id: reservationInfo?.guests[0]?.addressOperaId as string,
            addressLine1: guestReservationInfo?.addressLine1,
            addressLine2: guestReservationInfo?.addressLine2,
            addressType: 'HOME',
            countryCode: guestReservationInfo?.countryCode ?? '',
          },
          phone: {
            id: reservationInfo?.guests[0]?.phoneOperaId
              ? reservationInfo?.guests[0]?.phoneOperaId[0]
              : '',
            phoneType: 'HOME',
            phoneNumber: guestReservationInfo?.phone,
            phoneRole: 'PHONE',
          },
          email: {
            id: reservationInfo?.guests[0]?.emailOperaId
              ? reservationInfo?.guests[0]?.emailOperaId[0]
              : '',
            email: guestReservationInfo?.emails,
          },
        },
      };

      await client.query({
        query: UPDATE_GUEST_DETAILS,
        context: { clientName: 'rest' },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: updateGuestDetailsPayload,
        },
      });
      if (guestLength === 1) {
        navigate(availablePaths?.PERSONALIZE_YOUR_ROOM);
      } else {
        navigate(availablePaths?.ACCOMPANY_GUEST);
      }
    } catch (error) {
      processError(t, error as ApolloError);
      setLoading(false);
    }
    setLoading(false);
  }, [
    guestLength,
    guestReservationInfo?.addressLine1,
    guestReservationInfo?.addressLine2,
    guestReservationInfo?.countryCode,
    guestReservationInfo?.dob,
    guestReservationInfo?.docNo,
    guestReservationInfo?.docType,
    guestReservationInfo?.effectiveDate,
    guestReservationInfo?.emails,
    guestReservationInfo?.expiryDate,
    guestReservationInfo?.firstName,
    guestReservationInfo?.issueCountry,
    guestReservationInfo?.lastName,
    guestReservationInfo?.nationality,
    guestReservationInfo?.phone,
    reservationInfo?.confirmationId,
    reservationInfo?.guests,
    navigate,
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

  const validButton =
    validateGuestReservation(guestInformationSection?.details) &&
    validateGuestReservation(creditCardInfoSection?.details) &&
    validateGuestReservation(identityVerificationSection?.details);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Check-In')}
        </title>
      </Head>
      <Header screenTitle={t(`${accompanyingGuestSubmodule?.label}`) as string} displayHome />
      <PageWrapper className={styles.pageWrapper}>
        <p className={styles.step}>{t('Please Complete Your Check-In Process')}</p>
        <div className={styles.checkDates}>
          <div className={styles.checkDatesColumn}>
            <p className={styles.checkDatesText}>{t('Check-In')}</p>{' '}
            <p className={styles.checkDatesDetails}>
              {dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.DAY_MONTH_YEAR)}
            </p>
          </div>

          <div className={styles.checkDatesColumn}>
            <p className={cx(styles.checkDatesText, styles.right)}>{t('Checkout')}</p>{' '}
            <p className={cx(styles.checkDatesDetails, styles.right)}>
              {dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.DAY_MONTH_YEAR)}
            </p>
          </div>
        </div>
        <div className={styles.checkDates}>
          <div className={styles.checkDatesColumn}>
            <p className={styles.checkDatesText}>{t('Number of Guests')}</p>{' '}
            <p className={styles.checkDatesDetails}>{reservationInfo?.details?.adultGuestCount}</p>
          </div>
        </div>

        <div className={styles.roomDetailsCardWrapper}>
          {guestInformationSection && (
            <InfoCard
              title={t(`${guestInformationSection?.name}`) as string}
              icon={GUESTICON}
              details={guestReservationInfo?.firstName + ' ' + guestReservationInfo?.lastName}
              status={validateGuestReservation(guestInformationSection?.details)}
              isCardOpened={false}
              completedCheck
            >
              <PreCheckinGuestInfo
                selectedGuest={guestReservationInfo}
                guestInformationSection={guestInformationSection?.details}
              ></PreCheckinGuestInfo>
            </InfoCard>
          )}
          {creditCardInfoSection && (
            <InfoCard
              title={t(`${creditCardInfoSection?.name}`) as string}
              icon={CREDITCARD}
              details={guestReservationInfo?.cardNumber as string}
              status={validateGuestReservation(creditCardInfoSection?.details)}
              completedCheck
              paymentType={paymentType}
            >
              <PreCheckinPaymentInfo
                paymentInfo={guestReservationInfo}
                creditCardInfoSection={creditCardInfoSection?.details}
                paymentType={paymentType}
              ></PreCheckinPaymentInfo>
            </InfoCard>
          )}
          {identityVerificationSection && (
            <InfoCard
              title={t(`${identityVerificationSection?.name}`) as string}
              icon={IDCARD}
              details={guestReservationInfo?.docType as string}
              status={validateGuestReservation(identityVerificationSection?.details)}
              completedCheck
            >
              <PreCheckinDocInfo
                docInfo={guestReservationInfo}
                identityVerificationSection={
                  identityVerificationSection?.details && docTypeFunction
                }
              ></PreCheckinDocInfo>
            </InfoCard>
          )}
        </div>
        <div className={cx(styles.bottomMenuWrapper)}>
          <StyledButton
            variant='contained'
            loading={loading}
            disabled={!validButton || !reservationData}
            onClick={goToTheNextStep}
            className={styles.bottomMenuButton}
            arrow={buttonArrow}
          >
            {t('continue')}
          </StyledButton>
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['about-your-stay'], i18nConfig)),
    },
  };
};

export default AboutYourStay;

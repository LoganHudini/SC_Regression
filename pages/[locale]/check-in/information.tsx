import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '../../../styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from '../../../components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { InfoCard } from '../../../components/shared/InfoCard/InfoCard';
import { StyledButton } from '../../../components/shared/StyledButton/StyledButton';

import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';
import cx from 'classnames';
import {
  IGetRoomDetailsApiResponse,
  GET_ROOM_DETAILS,
} from 'core/graphql/queries/GET_ROOM_DETAILS';
import { GetStaticProps } from 'next';
import { AboutYourStayProps } from 'types/about-your-stay.types';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { upgradesStorage } from 'storage/upgrades.storage';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { PreCheckinGuestInfo } from 'components/pages/pre-checkin-form/PreCheckinGuestInfo/PreCheckinGuestInfo';
import { PreCheckinPaymentInfo } from 'components/pages/pre-checkin-form/PreCheckinPaymentInfo/PreCheckinPaymentInfo';
import { PreCheckinDocInfo } from 'components/pages/pre-checkin-form/PreCheckinDocInfo/PreCheckinDocInfo';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { processError } from 'utils/processError';
import { CURRENCY } from 'core/graphql/endpoints';
import {
  phoneRegex,
  checkin,
  creditCardInfo,
  driversLicence,
  email,
  emailRegex,
  guestInformation,
  identityVerification,
  information,
  passport,
  phone,
  phoneNumber,
  DRIVERS_LICENCE, PASSPORT
} from 'utils/constants';
import { getConfig } from 'utils/getConfiguration';

export { getStaticPaths };

const AboutYourStay: React.FC<AboutYourStayProps> = ({ roomDetails }) => {
  const navigate = useLocalizedRouter();
  const [buttonStatus, setButtonStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const config = getConfig();

  const { t } = useTranslation('about-your-stay');

  const upgradeRoomCode = useReactiveVar(upgradesStorage).upgradeId;

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const checkinModule: any = config?.modules?.find((module) => module?.name === checkin);
  const accompanyingGuestSubmodule = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === information && submodule.isActive === 'true',
  );
  const activeSections = accompanyingGuestSubmodule.details.filter(
    (section: any) => section.isActive === 'true',
  );

  const guestInformationSection = activeSections.find(
    (section: any) => section.name === guestInformation,
  );
  const creditCardInfoSection = activeSections.find(
    (section: any) => section.name === creditCardInfo,
  );
  const identityVerificationSection = activeSections.find(
    (section: any) => section.name === identityVerification,
  );
  const paymentType = creditCardInfoSection.type;

  const reservationInfo = reservationData?.getReservation?.data;
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  useEffect(() => {
    const initialGuestReservationInfo = activeSections.reduce((values: any, section: any) => {
      section.details.forEach((field: any) => {
        const { name } = field;
        values[name] = extractDataForField(name);
      });
      return values;
    }, {});

    reservationGuestInfoStorageData({
      ...initialGuestReservationInfo,
      isComplete: buttonStatus,
    });
  }, [reservationInfo]);

  // useEffect(() => {
  //   setButtonStatus(
  //     guestReservationInfo?.firstName &&
  //       guestReservationInfo?.lastName &&
  //       guestReservationInfo?.email &&
  //       guestReservationInfo?.phone &&
  //       guestReservationInfo?.cardHolderName &&
  //       guestReservationInfo?.cardNumber &&
  //       guestReservationInfo?.cardType &&
  //       guestReservationInfo?.cardExpiryDate &&
  //       guestReservationInfo?.docNo &&
  //       guestReservationInfo?.docType &&
  //       guestReservationInfo?.effectiveDate !== 'Invalid Date' &&
  //       guestReservationInfo?.effectiveDate !== '' &&
  //       guestReservationInfo?.issueCountry
  //       ? true
  //       : false,
  //   );
  // }, [guestReservationInfo]);

  // useEffect(() => {
  //   reservationGuestInfoStorageData({
  //     ...guestReservationInfo,
  //     firstName: reservationInfo?.guests[0]?.firstName,
  //     lastName: reservationInfo?.guests[0]?.lastName,
  //     email: guestReservationInfo?.email
  //       ? guestReservationInfo?.email
  //       : reservationInfo?.guests[0]?.emails && reservationInfo?.guests[0]?.emails.length > 0
  //         ? reservationInfo?.guests[0]?.emails[0]
  //         : '',
  //     phone: guestReservationInfo?.phone
  //       ? guestReservationInfo?.phone
  //       : reservationInfo?.guests[0]?.phone
  //         ? reservationInfo?.guests[0]?.phone[0]
  //         : '',
  //     docNo: guestReservationInfo?.docNo ?? reservationInfo?.guests[0]?.docNo,
  //     docType:
  //       guestReservationInfo?.docType ??
  //       reservationInfo?.guests[0]?.docType ??
  //       sessionStorage.getItem('docType') ??
  //       'Passport',
  //     effectiveDate: guestReservationInfo?.effectiveDate ?? '',
  //     expiryDate: guestReservationInfo?.expiryDate ?? '',
  //     countryOfIssue: guestReservationInfo?.issueCountry ?? '',
  //     cardNumber:
  //       guestReservationInfo?.cardNumber ?? reservationInfo?.reservePayments[0]?.cardNumber,
  //     cardHolderName:
  //       guestReservationInfo?.cardHolderName ?? reservationInfo?.reservePayments[0]?.cardHolderName,
  //     cardType: guestReservationInfo?.cardType ?? reservationInfo?.reservePayments[0]?.cardType,
  //     cardExpiryDate:
  //       guestReservationInfo?.cardExpiryDate ?? reservationInfo?.reservePayments[0]?.cardExpiryDate,
  //     isComplete: buttonStatus,
  //   });
  // }, [reservationInfo, buttonStatus]);

  function extractDataForField(fieldName: any) {
    const sources = {
      reservationInfo,
      guestReservationInfo,
    };

    let extractedValue = '';

    for (const source of Object.values(sources)) {
      if (source) {
        const fieldValue = getFieldFromSource(source, fieldName);
        if (fieldValue !== undefined) {
          extractedValue = fieldValue;
          break;
        }
      }
    }

    return extractedValue;
  }

  function getFieldFromSource(source: any, fieldName: any) {
    const fieldPath = fieldName.split('.'); // Handle nested fields
    let fieldValue = source;

    for (const field of fieldPath) {
      if (fieldValue && fieldValue[field] !== undefined) {
        fieldValue = fieldValue[field];
      } else {
        fieldValue = undefined;
        break;
      }
    }

    return fieldValue;
  }

  const currentRoomType = roomDetails.getHotelAccommodationDetails.roomTypes.find(
    (room) => room.code === (upgradeRoomCode || reservationInfo?.roomTypes[0]?.code),
  );

  useEffect(() => {
    if (!reservationData) {
      // navigate(availablePaths.GET_RESERVATION);
    }
  }, [reservationData, navigate]);

  const goToTheNextStep = useCallback(async () => {
    try {
      setLoading(true);
      const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
        docType: guestReservationInfo.docType == 'Passport' ? PASSPORT : DRIVERS_LICENCE,
        docNumber: guestReservationInfo?.docNo,
        reservationId: reservationInfo?.confirmationId as string,
        firstName: guestReservationInfo?.firstName,
        lastName: guestReservationInfo?.lastName,
        profileId: reservationInfo?.guests[0]?.id as string,
        isPrimary: 'Y',
        effectiveDate: guestReservationInfo?.effectiveDate,
        expiryDate: guestReservationInfo?.expiryDate,
        countryOfIssue: guestReservationInfo?.issueCountry,
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
            countryCode: guestReservationInfo?.countryCode,
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
            email: guestReservationInfo?.email,
          },
        },
      };

      // await client.query({
      //   query: UPDATE_GUEST_DETAILS,
      //   context: { clientName: 'rest' },
      //   variables: {
      //     confirmationNumber: reservationInfo?.confirmationId as string,
      //     body: updateGuestDetailsPayload,
      //   },
      // });
    } catch (error) {
      processError(t, error as ApolloError);
      setLoading(false);
    }
    setLoading(false);
    navigate(availablePaths.ACCOMPANY_GUEST);
    // navigate(availablePaths?.PERSONALIZE_YOUR_ROOM);
  }, [navigate]);

  const goToTheRoomDetails = useCallback(() => {
    navigate(availablePaths.ROOM_DETAILS);
  }, [navigate]);

  const goToTheGetReservation = useCallback(() => {
    navigate(availablePaths.GET_RESERVATION);
  }, [navigate]);

  const validateGuestReservation = (field: any) => {
    if (guestReservationInfo) {
      return field.every((fieldItem: any) => {
        if (fieldItem.required == 'false') {
          return true;
        }
        const infoValue = guestReservationInfo[fieldItem?.name];
        if (fieldItem.name === phone) {
          return phoneRegex.test(infoValue);
        }

        if (fieldItem.name === email) {
          return emailRegex.test(infoValue);
        }
        return infoValue !== undefined && infoValue !== null && infoValue !== '';
      });
    }
  };
  const validButton =
    validateGuestReservation(guestInformationSection?.details) &&
    validateGuestReservation(creditCardInfoSection?.details) &&
    validateGuestReservation(identityVerificationSection?.details);

  return (
    <>
      <Head>
        <title>{t('Check-In')}</title>
      </Head>
      <Header
        screenTitle={t(`${accompanyingGuestSubmodule?.label}`) as string}
        displayHome
      />
      <PageWrapper className={styles.pageWrapper}>
        <p className={styles.step}>{t('Please Complete Your Check-In Process')}</p>
        <div className={styles.checkDates}>
          <div className={styles.checkDatesColumn}>
            <p className={styles.checkDatesText}>{t('Check In')}</p>{' '}
            <p className={styles.checkDatesDetails}>
              {dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.DAY_MONTH_YEAR)}
            </p>
          </div>

          <div className={styles.checkDatesColumn}>
            <p className={cx(styles.checkDatesText, styles.right)}>{t('Check Out')}</p>{' '}
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
              icon='guestIcon'
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
              icon='creditCard'
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
              icon='idCard'
              details={guestReservationInfo?.docType as string}
              status={validateGuestReservation(identityVerificationSection?.details)}
              completedCheck
            >
              <PreCheckinDocInfo
                docInfo={guestReservationInfo}
                identityVerificationSection={identityVerificationSection?.details}
              ></PreCheckinDocInfo>
            </InfoCard>
          )}
        </div>
        <div className={styles.confirmOrderButton}>
          <div className={styles.confirmationWrapperBotton}>
            <StyledButton
              disabled={!validButton}
              loading={loading}
              className={styles.button}
              onClick={goToTheNextStep}
              variant='contained'
              arrow
            >
              {t('continue')}
            </StyledButton>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  const { data } = await client.query<IGetRoomDetailsApiResponse>({
    query: GET_ROOM_DETAILS,
    context: { clientName: 'host_v0' },
  });

  return {
    props: {
      roomDetails: data,
      ...(await serverSideTranslations(locale as string, ['about-your-stay'], i18nConfig)),
    },
  };
};

export default AboutYourStay;

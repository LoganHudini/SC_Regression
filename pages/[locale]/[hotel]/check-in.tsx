import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/guestDetail_checkin_v2/guestDetail_checkin_v2.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { timeFormats } from 'utils/timeFormats';
import DropDown from '@icons/detailArrow.svg';
import BedIcon from '@icons/double-bed.svg';
import UserIcon from '@icons/user.svg';
import DocIcon from '@icons/docPoints.svg';
import NightIcon from '@icons/night-mode.svg';
import { availablePaths } from 'utils/availablePaths';
import { useConfig, useDocumentConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { ASSETS_URL, BRAND_CODE } from 'core/graphql/endpoints';
import { useReactiveVar, useQuery } from '@apollo/client';
import { hotelInformation, toggleNotification } from 'storage/home.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import {
  activeCheckInFlow,
  StepperInformationStorage,
  useCheckedIn,
} from 'storage/check-in.storage';
import produce from 'immer';
import {
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  STEPPER_CHECK_IN,
  STEPPER_REVIEW,
  NONE,
  DOCTYPE,
} from 'utils/constants';
import { usePersonalisation } from 'utils/hooks/usePersonalisation';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { useRouter } from 'next/router';
import { Loader } from 'components/shared/Loaders/Loaders';
import { processStatusCode } from 'utils/processError';
import { handleReservation } from 'utils/fetchReservation';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { getWelcomeDrawer } from 'utils/functions';
export { getStaticPaths };
import { Countries } from 'utils/countryList';
const GuestDetail: React.FC<AboutYourStayProps> = () => {
  const { t } = useTranslation(['about-your-stay', 'common']);
  const navigate = useLocalizedRouter();
  const config: any = useConfig();
  const checkedInData = useCheckedIn();

  const router = useRouter();
  const locale = useLocale();
  const hotelName = config?.name;
  const hotelImageInfo = useReactiveVar(hotelInformation);
  const paymentConfig: any = usePaymentConfig();
  const personalisationDataloading = usePersonalisation();
  const availablePersonalizations = useReactiveVar(personalizationStorage);
  const [loading, setLoading] = useState(false);
  const [welcomeDrawer, setWelcomeDrawer] = useState(getWelcomeDrawer());
  const documentConfig: any = useDocumentConfig();
  const resId = router?.query?.resId ?? '';
  const roomNo = router?.query?.roomNo ?? '';
  const pmsRoomNumberLength = config?.pmsRoomNumberLength;
  const lastName = router?.query?.lastName ?? '';
  const countryName = config?.idVerificationNationality?.map((code: any) =>
    Countries?.find((country) => country?.value === code),
  );
  const docTypes: any = [
    ...new Set(
      documentConfig?.details
        ?.find((e: any) => e?.name === DOCTYPE)
        ?.options?.map((opt: any) => opt?.name),
    ),
  ];
  const hotelId = config?.hotelId;

  const { data: hotelInfo, loading: hotelInfoLoading } = useQuery(GET_HOTEL_INFORMATION, {
    skip: !hotelId,
    context: { clientName: 'property_a' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  useEffect(() => {
    if (hotelInfo?.getPropertyDetailsByHotelId?.hotel) {
      hotelInformation(hotelInfo.getPropertyDetailsByHotelId.hotel);
    }
  }, [hotelInfo]);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const activeCheckInFlowInfo = useReactiveVar(activeCheckInFlow);

  const reservationInfo = reservationData?.getReservation?.data;
  useEffect(() => {
    const goToTheNextStep = async () => {
      if (lastName && (resId || roomNo)) {
        const values: any = { lastName: lastName };
        if (activeCheckInFlowInfo) {
          values.confirmationNumber = resId;
        } else {
          values.roomNo = roomNo;
        }
        if (!reservationInfo) {
          await handleReservation({
            activeCheckInFlowInfo,
            values,
            hotelId,
            config,
            toggleNotification,
            setLoading,
            t,
            processStatusCode,
            navigate,
            goToTheNextStep,
            pmsRoomNumberLength,
          });
        }
      } else if (!reservationInfo) {
        const values: any = {
          lastName: checkedInData?.lastName,
          confirmationNumber: checkedInData?.reservationId,
        };
        await handleReservation({
          activeCheckInFlowInfo,
          values,
          hotelId,
          config,
          toggleNotification,
          setLoading,
          t,
          processStatusCode,
          navigate,
          goToTheNextStep,
        });
      }
    };
    goToTheNextStep();
  }, [lastName, resId, roomNo, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!reservationInfo && !lastName && (!resId || !roomNo)) {
        navigate(availablePaths.HOME);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [reservationInfo, lastName, resId, roomNo, navigate]);

  const WelcomeDetails = () => (
    <>
      <div className={styles.drawerWrapper}>
        <h3 className={styles.welcomeTitle}>
          {t('Welcome to')}{' '}
          <span className={cx(styles.capitalise, 'globals-brandCaps')}>
            {hotelInfo?.getPropertyDetailsByHotelId?.hotel?.name}
          </span>{' '}
        </h3>
        {
          <p className={styles.welcomeDescription}>
            {`${
              config?.preCheckInOnly
                ? t('Register now to save time when you arrive.')
                : t('Check-In now to save time when you arrive.')
            }`}
          </p>
        }
        <StableImage
          hideplaceholder={'true'}
          src={`/images/${BRAND_CODE}/Divider.png`}
          alt='Divider'
          className={styles.dividerImage}
        />
        <p className={styles.welcomeDescription}>
          {config && config?.idVerificationNationality?.length > 0
            ? t(
                `If you live outside of ${countryName[0]?.name}, you will need the following documents to finish online check-in`,
              )
            : t('You will need the following documents handy to finish online check-in')}
        </p>

        <p className={styles.documentsList}>
          <DocIcon />
          <span className={styles.space}>
            {docTypes?.map((type: string, index: number) => (
              <React.Fragment key={type + index}>
                {type}
                {index !== docTypes?.length - 1 && ' / '}
              </React.Fragment>
            ))}
          </span>
        </p>
        {paymentConfig?.type !== NONE && (
          <>
            <div className={styles.verticalLine}></div>
            <p className={styles.documentsList}>
              <DocIcon />
              <span className={styles.space}>{t('Credit Card')}</span>
            </p>
          </>
        )}
      </div>
      <StyledButton className={styles.beginCheckIn} onClick={closeWelcomeDrawer}>
        {t('Begin Check-In')}
      </StyledButton>
    </>
  );

  const closeWelcomeDrawer = () => {
    sessionStorage.setItem('welcomeDrawer', JSON.stringify(false));
    setWelcomeDrawer(false);
  };

  useEffect(() => {
    if (!personalisationDataloading) {
      if (
        paymentConfig?.type === NONE ||
        (paymentConfig?.isTotalChargeActive &&
          Number(reservationInfo?.roomTypes[0]?.totalCharge) === 0)
      ) {
        if (availablePersonalizations?.length === 0) {
          StepperInformationStorage([
            { value: 60, label: 1, title: STEPPER_REVIEW },
            { value: 0, label: 2, title: STEPPER_CHECK_IN },
          ]);
        } else {
          StepperInformationStorage(
            produce(StepperInformationStorage(), (draft: any) => {
              const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
              if (item) {
                item.title = STEPPER_CUSTOMISATION;
              }
            }),
          );
        }
      }
    }
  }, [
    personalisationDataloading,
    availablePersonalizations,
    paymentConfig?.type,
    reservationInfo?.roomTypes,
    paymentConfig?.isTotalChargeActive,
  ]);

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Stay Details')}
        </title>
      </Head>
      <Header
        screenTitle={t('check-In') as string}
        displayHome
        backRoute={availablePaths?.HOME}
        language
      />
      {loading || hotelInfoLoading || paymentConfig?.loader ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          {hotelImageInfo && hotelImageInfo?.images?.length > 0 && (
            <StableImage
              className={styles.image}
              src={`${ASSETS_URL}/${hotelImageInfo?.images[0]?.ratio16to9}`}
            />
          )}
          <div className={cx(styles.cardWrapper, 'globals-cardWrapper')}>
            <p className={styles.title}>{t('Your Stay Details')}</p>
            <StableImage
              hideplaceholder={'true'}
              src={`/images/${BRAND_CODE}/Divider.png`}
              alt='Divider'
            />
            <div className={cx(styles.nameBox, 'globals-nameBox')}>
              <div className={styles.nameWrapper}>
                <p className={styles.detailTitle}>{t('NAME')}</p>
                <p
                  className={styles.detailValue}
                >{`${reservationInfo?.details?.contactPerson?.firstName} ${reservationInfo?.details?.contactPerson?.lastName}`}</p>
              </div>
              <div className={styles.divider} />

              <div className={styles.nameWrapper}>
                <p className={styles.detailTitle}>{t('BOOKING ID')}</p>
                <p className={styles.detailValue}>{reservationInfo?.confirmationId}</p>
              </div>
            </div>
            <div className={styles.dateWrapper}>
              <div className={styles.checkInWrapper}>
                <p className={styles.detailCheckinTitleCaps}>{t('Check-In')}</p>
                <div className={cx(styles.checkContainer, 'globals-nameBox')}>
                  <p className={styles.detailCheckinTitle}>
                    {dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.DAY)}
                  </p>
                  <p className={styles.detailCheckinTitleDate}>
                    {dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.DAY_DIGIT)}
                  </p>
                  <p className={styles.detailCheckinTitle}>
                    {dayjs(reservationInfo?.details?.checkInDate).format(timeFormats.MONTH_YEAR)}
                  </p>
                </div>
                {hotelImageInfo?.checkInTime && (
                  <p className={styles.detailCheckinTitle}>
                    {t('From')} {hotelImageInfo?.checkInTime}
                  </p>
                )}
              </div>
              <div className={styles.arrow}>
                <DropDown />
              </div>
              <div className={styles.checkOutWrapper}>
                <p className={styles.detailCheckinTitleCaps}>{t('Checkout')}</p>
                <div className={cx(styles.checkContainer, 'globals-nameBox')}>
                  <p className={styles.detailCheckinTitle}>
                    {dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.DAY)}
                  </p>
                  <p className={styles.detailCheckinTitleDate}>
                    {dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.DAY_DIGIT)}
                  </p>
                  <p className={styles.detailCheckinTitle}>
                    {dayjs(reservationInfo?.details?.checkOutDate).format(timeFormats.MONTH_YEAR)}
                  </p>
                </div>
                {hotelImageInfo?.checkOutTime && (
                  <p className={styles.detailCheckinTitle}>
                    {t('Till')} {hotelImageInfo?.checkOutTime}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.stayWrapper}>
              {reservationInfo?.roomTypes[0]?.shortName && (
                <div className={styles.stayDetails}>
                  <span className={styles.icon}>
                    <BedIcon />
                  </span>
                  {reservationInfo?.roomTypes[0]?.shortName}
                </div>
              )}
              {reservationInfo?.details?.nightCount !== 0 && (
                <div className={styles.stayDetails}>
                  <span className={styles.icon}>
                    <NightIcon />
                  </span>
                  {reservationInfo?.details?.nightCount}{' '}
                  {reservationInfo?.details?.nightCount === 1 ? t('Night') : t('Nights')}
                </div>
              )}
              {(reservationInfo?.details?.adultGuestCount !== 0 ||
                reservationInfo?.details?.childGuestCount !== 0) && (
                <div className={styles.stayDetails}>
                  <span className={styles.icon}>
                    <UserIcon />
                  </span>
                  {reservationInfo?.details?.adultGuestCount !== 0 && (
                    <>
                      {reservationInfo?.details?.adultGuestCount}{' '}
                      {reservationInfo?.details?.adultGuestCount === 1 ? t('Adult') : t('Adults')}{' '}
                    </>
                  )}
                  {reservationInfo?.details?.childGuestCount !== 0 && (
                    <>
                      {reservationInfo?.details?.childGuestCount}{' '}
                      {reservationInfo?.details?.childGuestCount === 1 ? t('Child') : t('Children')}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className={cx(styles.bottomMenuWrapper)}>
              <StyledButton
                variant='contained'
                onClick={() => navigate(availablePaths?.GUEST_VERIFICATION)}
                className={cx(styles.bottomMenuButton)}
              >
                {t('Continue')}
              </StyledButton>
            </div>
          </div>
          <CustomDrawer
            open={welcomeDrawer}
            onClose={closeWelcomeDrawer}
            content={<WelcomeDetails />}
          />
        </PageWrapper>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  const { data } = await client.query<IGetRoomDetailsApiResponse>({
    query: GET_ROOM_DETAILS,
    context: { clientName: 'property_a' },
  });

  return {
    props: {
      roomDetails: data,
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'about-your-stay', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default GuestDetail;

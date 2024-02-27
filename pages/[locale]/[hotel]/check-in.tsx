import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/guestDetail_checkin_v2/guestDetail_checkin_v2.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
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
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { ASSETS_URL, BRAND_CODE } from 'core/graphql/endpoints';
import { useReactiveVar } from '@apollo/client';
import { hotelInformation } from 'storage/home.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { getWelcomeDrawer } from 'utils/functions';
import { StepperInformationStorage } from 'storage/check-in.storage';
import produce from 'immer';
import {
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  STEPPER_CHECK_IN,
  STEPPER_REVIEW,
  NONE,
  OPERA,
} from 'utils/constants';
import { usePersonalisation } from 'utils/hooks/usePersonalisation';

export { getStaticPaths };

const GuestDetail: React.FC<AboutYourStayProps> = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const hotelName = config?.name;
  const hotel = config?.code;
  const pms = config?.pms;
  const hotelImageInfo = useReactiveVar(hotelInformation);
  const [welcomeDrawer, setWelcomeDrawer] = useState(getWelcomeDrawer());
  const paymentConfig: any = usePaymentConfig();
  const [availablePersonalizations, personalisationDataloading] = usePersonalisation();

  const { t } = useTranslation('about-your-stay');

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo = reservationData?.getReservation?.data;

  useEffect(() => {
    !reservationInfo && navigate(`/${hotel}/`);
  }, [hotel, navigate, reservationInfo]);

  const WelcomeDetails = () => (
    <>
      <div className={styles.drawerWrapper}>
        <h3 className={styles.welcomeTitle}>
          Welcome to{' '}
          <span className={cx(styles.capitalise, 'globals-brandCaps')}>
            {BRAND_CODE === '1hotels' ? '1' : BRAND_CODE}
          </span>{' '}
          Hotels!
        </h3>
        <p className={styles.welcomeDescription}>Check-In now to save time when you arrive.</p>
        <StableImage
          src={`/images/${BRAND_CODE}/Divider.png`}
          alt='Divider'
          className={styles.dividerImage}
        />
        <p className={styles.welcomeDescription}>
          You will need the following documents handy to finish online Check-In:
        </p>
        <p className={styles.documentsList}>
          <DocIcon />
          <span className={styles.space}>
            Passport {BRAND_CODE === 'itc' && '/ Aadhaar '}/ Driving License
          </span>
        </p>
        <div className={styles.verticalLine}></div>
        <p className={styles.documentsList}>
          <DocIcon />
          <span className={styles.space}>Credit Card</span>
        </p>
      </div>
      <StyledButton className={styles.beginCheckIn} onClick={closeWelcomeDrawer}>
        {t('BEGIN CHECK-IN')}
      </StyledButton>
    </>
  );

  const closeWelcomeDrawer = () => {
    sessionStorage.setItem('welcomeDrawer', JSON.stringify(false));
    setWelcomeDrawer(false);
  };

  useEffect(() => {
    if (!personalisationDataloading) {
      if (paymentConfig?.type === NONE) {
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
  }, [personalisationDataloading, availablePersonalizations, paymentConfig?.type]);

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Stay Details')}
        </title>
      </Head>
      <Header screenTitle={t('check-In') as string} displayHome backRoute={availablePaths?.HOME} />
      <PageWrapper className={styles.pageWrapper}>
        {hotelImageInfo && hotelImageInfo?.images?.length > 0 && (
          <StableImage
            className={styles.image}
            src={`${ASSETS_URL}/${hotelImageInfo?.images[0]?.ratio16to9}`}
          />
        )}
        <div className={styles.cardWrapper}>
          <p className={styles.title}>{t('Your Stay Details')}</p>
          <StableImage src={`/images/${BRAND_CODE}/Divider.png`} alt='Divider' />
          <div className={styles.nameBox}>
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
              <div className={styles.checkContainer}>
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
              <p className={styles.detailCheckinTitle}>
                From{' '}
                {pms === OPERA
                  ? dayjs(
                      `${reservationInfo?.details?.checkInDate?.split('T')[0]}${
                        reservationInfo?.details?.contactPerson?.eta?.split('.')[0]
                      }`,
                    )?.format(timeFormats.HOURS_MINUTES_AM_2)
                  : dayjs(
                      reservationInfo?.details?.contactPerson?.eta ||
                        reservationInfo?.details?.checkInDate,
                    )?.format(timeFormats.HOURS_MINUTES_AM_2)}
              </p>
            </div>
            <div className={styles.arrow}>
              <DropDown />
            </div>
            <div className={styles.checkOutWrapper}>
              <p className={styles.detailCheckinTitleCaps}>{t('Checkout')}</p>
              <div className={styles.checkContainer}>
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
              <p className={styles.detailCheckinTitle}>
                Till{' '}
                {pms === OPERA
                  ? dayjs(
                      `${reservationInfo?.details?.checkOutDate?.split('T')[0]}${
                        reservationInfo?.details?.contactPerson?.etd?.split('.')[0]
                      }`,
                    )?.format(timeFormats.HOURS_MINUTES_AM_2)
                  : dayjs(
                      reservationInfo?.details?.contactPerson?.etd ||
                        reservationInfo?.details?.checkOutDate,
                    )?.format(timeFormats.HOURS_MINUTES_AM_2)}
              </p>
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
                {reservationInfo?.details?.nightCount === 1 ? 'Night' : 'Nights'}
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
                    {reservationInfo?.details?.adultGuestCount === 1 ? 'Adult' : 'Adults'}{' '}
                  </>
                )}
                {reservationInfo?.details?.childGuestCount !== 0 && (
                  <>
                    {reservationInfo?.details?.childGuestCount}{' '}
                    {reservationInfo?.details?.childGuestCount === 1 ? 'Child' : 'Children'}
                  </>
                )}
              </div>
            )}
          </div>
          <div className={cx(styles.bottomMenuWrapper)}>
            <StyledButton
              variant='contained'
              onClick={() => navigate(availablePaths?.GUEST_VERIFICATION)}
              className={styles.bottomMenuButton}
            >
              {t('continue')}
            </StyledButton>
          </div>
        </div>
      </PageWrapper>
      <CustomDrawer
        open={welcomeDrawer}
        onClose={closeWelcomeDrawer}
        content={<WelcomeDetails />}
      />
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

export default GuestDetail;

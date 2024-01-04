import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '@styles/personalize-your-room-v2/personalize-your-room-v2.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
  GET_AVAILABLE_PERSONALIZATIONS_CMS,
  IPersonalizeYourRoomApiResponse,
} from 'core/graphql/queries/GET_AVAILABLE_PERSONALIZATIONS';
import dayjs from 'dayjs';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { personalizeYourRoomStorage } from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { RoomPersonalizationEntityV2 } from 'components/pages/personalize-your-room-v2/RoomPersonalizationEntityV2/RoomPersonalizationEntityV2';
import { UPDATE_BOOKING_DETAILS } from 'core/graphql/queries/UPDATE_BOOKING_DETAILS';
import {
  CHECK_IN,
  FAILURE,
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  SUCCESS,
  personalisation,
} from 'utils/constants';
import { Loader } from 'components/shared/Loaders/Loaders';
import { Notification } from 'components/shared/Notification/Notification';
import { toggleNotification } from 'storage/home.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { StepperInformationStorage } from 'storage/check-in.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import produce from 'immer';

export { getStaticPaths };

const PersonalizeYourRoom: React.FC = () => {
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const { t } = useTranslation('personalize-your-room');
  const [loadingButton, setLoadingButton] = useState(false);
  const [notificationState, setNotificationState] = useState<any>(false);
  const personalizationStorageInfo = useReactiveVar(personalizeYourRoomStorage);

  const checkinModule: any = config?.modules?.find((module) => module?.code === CHECK_IN);
  const personalisationConfig = checkinModule?.submodules?.find(
    (submodule: any) => submodule?.name === personalisation && submodule.isActive,
  );

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths.HOME);
    }
  }, [reservationData, navigate]);

  const reservationInfo = reservationData?.getReservation.data;

  const startDate = dayjs(reservationInfo?.details.checkInDate).format(timeFormats.YEAR_MONTH_DAY);
  const endDate = dayjs(reservationInfo?.details.checkOutDate).format(timeFormats.YEAR_MONTH_DAY);

  const { loading, data } = useQuery<IPersonalizeYourRoomApiResponse>(
    GET_AVAILABLE_PERSONALIZATIONS_CMS,
    {
      context: { clientName: 'rest' },
      variables: {
        startDate: startDate,
        endDate: endDate,
      },
    },
  );

  useEffect(() => {
    if (data?.getAvailablePersonalizations?.data?.length === 0) {
      navigate(availablePaths?.REVIEW);
    }
  }, [data?.getAvailablePersonalizations?.data?.length, navigate]);

  const availablePersonalizations = data?.getAvailablePersonalizations?.data?.filter(
    (el) => el?.isActive,
  );

  const goToNextStep = useCallback(async () => {
    setLoadingButton(true);
    if (!personalizationStorageInfo?.some((item: any) => item?.quantity > 0)) {
      navigate(availablePaths?.REVIEW);
    } else {
      personalizationStorageInfo?.filter((x: any) => x?.quantity !== 0);

      const updateBookingDetailsPayload = {
        bookingId: reservationInfo?.details.id,
        reservationId: reservationInfo?.reservationId,
        startDate: reservationInfo?.details.checkInDate.split('T')[0],
        endDate: reservationInfo?.details.checkOutDate.split('T')[0],
        uniqueBookingId: reservationInfo?.uniqueBookingId,
        reservationType: reservationInfo?.confirmationType,
        accountId: reservationInfo?.accountId,
        noOfGuest: reservationInfo?.details.totalGuestCount,
        roomCategory: reservationInfo?.roomTypes[0].name,
        roomCharge: reservationInfo?.roomTypes[0].totalCharge,
        personalisation: [],
        comments: personalizationStorageInfo?.map((a: any) => a?.title + ' X ' + a?.quantity),
      };

      try {
        await client.query({
          query: UPDATE_BOOKING_DETAILS,
          context: { clientName: 'rest' },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: updateBookingDetailsPayload,
          },
        });
        navigate(availablePaths?.REVIEW);
      } catch (e) {
        toggleNotification(true);
        setNotificationState({
          title: 'Please Try Again!',
          description: 'Your order was not confirmed',
          redirect: null,
          type: FAILURE,
        });
      }
    }
    setLoadingButton(false);
  }, [
    navigate,
    personalizationStorageInfo,
    reservationInfo?.accountId,
    reservationInfo?.confirmationId,
    reservationInfo?.confirmationType,
    reservationInfo?.details.checkInDate,
    reservationInfo?.details.checkOutDate,
    reservationInfo?.details.id,
    reservationInfo?.details.totalGuestCount,
    reservationInfo?.reservationId,
    reservationInfo?.roomTypes,
    reservationInfo?.uniqueBookingId,
  ]);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find(
          (el: any) => el?.title === (STEPPER_CUSTOMISATION || STEPPER_PAYMENT),
        );
        if (item) {
          item.value = 100;
        }
      }),
    );
  }, []);

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Customisation')}
        </title>
      </Head>
      <Header displayBackButton screenTitle={t(`${personalisationConfig?.label}`) as string} />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{t('Customise My Stay')}</p>
          <p className={styles.description}>
            {t('Personalize every aspect of your stay – tailor your experience to perfection.')}
          </p>
        </div>
        <div className={styles.personalizationEntitiesWrapper}>
          {loading ? (
            <>
              <Loader />
            </>
          ) : (
            availablePersonalizations?.map((el) => (
              <RoomPersonalizationEntityV2
                key={el.id}
                id={el.id}
                title={el.name}
                description={el.description}
                type='PER_DAY'
                price={el.cost}
                currency={el.currency}
                maxQuantity={el.maxQuantity}
                setNotificationState={setNotificationState}
              />
            ))
          )}
        </div>

        <div className={styles.confirmButtonWrapper}>
          <StyledButton
            className={styles.confirmButton}
            variant='contained'
            onClick={goToNextStep}
            loading={loadingButton}
          >
            {t('Next')}
          </StyledButton>
        </div>
        <Notification
          title={notificationState?.title}
          description={notificationState?.description}
          redirect={notificationState?.redirect}
          type={notificationState?.type}
        />
      </PageWrapper>{' '}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['personalize-your-room'], i18nConfig)),
    },
  };
};

export default PersonalizeYourRoom;

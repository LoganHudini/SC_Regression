import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '@styles/personalize-your-room-v2/personalize-your-room-v2.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  personalizationStorage,
  personalizeYourRoomStorage,
} from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { RoomPersonalizationEntityV2 } from 'components/pages/personalize-your-room-v2/RoomPersonalizationEntityV2/RoomPersonalizationEntityV2';
import { UPDATE_BOOKING_DETAILS } from 'core/graphql/queries/UPDATE_BOOKING_DETAILS';
import {
  CHECK_IN,
  FAILURE,
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  personalisation,
  CMS,
  ADDON,
  NONE,
  ROOM,
} from 'utils/constants';
import { notificationStorage, toggleNotification } from 'storage/home.storage';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { StepperInformationStorage } from 'storage/check-in.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import produce from 'immer';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import cx from 'classnames';

export { getStaticPaths };

const PersonalizeYourRoom: React.FC = () => {
  const { t } = useTranslation(['personalize-your-room', 'check-in']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const [loadingButton, setLoadingButton] = useState(false);

  const personalizationStorageInfo = useReactiveVar(personalizeYourRoomStorage);

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const personalisationConfig = checkInModule?.submodules?.find(
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

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
        if (item) {
          item.value = 100;
        }
      }),
    );
  }, []);

  const reservationInfo = reservationData?.getReservation.data;

  const availablePersonalizations = useReactiveVar(personalizationStorage);

  const filteredAddonsList: any =
    personalisationConfig?.type !== CMS
      ? availablePersonalizations?.length > 0 &&
        availablePersonalizations?.filter(
          (item: any) => item?.isActive && (item?.type === ADDON || item?.type === ''),
        )
      : availablePersonalizations;

  const filteredUpgradeRoomList: any =
    personalisationConfig?.type !== CMS
      ? availablePersonalizations?.length > 0
        ? availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === ROOM)
        : []
      : availablePersonalizations;

  const goToNextStep = useCallback(async () => {
    setLoadingButton(true);
    if (
      !personalizationStorageInfo?.some((item: any) => item?.quantity > 0) ||
      personalisationConfig?.type === CMS
    ) {
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
        personalisation: personalizationStorageInfo?.map((el: any) => ({
          code: el?.id,
          quantity: el?.quantity.toString(),
        })),
        specialRequest: [''],
        comments: [],
      };

      const updateBookingDetails = async () => {
        const checkInToken = getCheckInToken();
        try {
          await client.query({
            query: UPDATE_BOOKING_DETAILS,
            context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: updateBookingDetailsPayload,
            },
          });
          navigate(availablePaths?.REVIEW);
        } catch (e) {
          const statusCode = processStatusCode(e as ApolloError);
          statusCode === 403 && handleCheckInAuthenticationFailure(updateBookingDetails);
          toggleNotification(true);
          notificationStorage({
            title: t('Please Try Again!'),
            description: t('Your order was not confirmed'),
            redirect: null,
            type: FAILURE,
          });
        }
        setLoadingButton(false);
      };
      updateBookingDetails();
    }
  }, [
    navigate,
    personalisationConfig?.type,
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
    t,
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
      <Header
        displayBackButton
        screenTitle={t(`${personalisationConfig?.label}`) as string}
        backRoute={
          paymentConfig?.type !== NONE
            ? availablePaths?.CARD_AUTHORISATION
            : filteredUpgradeRoomList?.length > 0 && personalisationConfig?.type !== CMS
            ? availablePaths.UPGRADE_ROOM
            : availablePaths.GUEST_VERIFICATION
        }
        language
      />
      <PageWrapper className={styles.pageWrapper}>
        <Stepper />
        <div className={styles.titleWrapper}>
          <p className={styles.title}>{t('Customise My Stay')}</p>
          <p className={styles.description}>
            {t('Personalize every aspect of your stay – tailor your experience to perfection.')}
          </p>
        </div>
        <div className={styles.personalizationEntitiesWrapper}>
          {filteredAddonsList?.length > 0 &&
            filteredAddonsList?.map((el: any, index: number) => (
              <RoomPersonalizationEntityV2
                key={index}
                id={el?.code}
                title={el?.name}
                description={el?.description}
                type='PER_DAY'
                price={el?.cost}
                currency={el?.currency}
                maxQuantity={el?.maxQuantity}
              />
            ))}
        </div>

        <div className={styles.confirmButtonWrapper}>
          <StyledButton
            className={cx(styles.confirmButton)}
            variant='contained'
            onClick={goToNextStep}
            loading={loadingButton}
          >
            {t('Next')}
          </StyledButton>
        </div>
      </PageWrapper>{' '}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'personalize-your-room', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default PersonalizeYourRoom;

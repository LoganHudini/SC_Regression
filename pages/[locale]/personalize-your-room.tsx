import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import styles from 'styles/personalize-your-room-v2/personalize-your-room-v2.module.scss';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
  GET_AVAILABLE_PERSONALIZATIONS_CMS,
  IPersonalizeYourRoomApiResponse,
} from 'core/graphql/queries/GET_AVAILABLE_PERSONALIZATIONS';
import dayjs from 'dayjs';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  personalizeYourRoomStorage,
  specialRequestsStorage,
} from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { RoomPersonalizationEntitySkeletonV2 } from 'components/pages/personalize-your-room-v2/RoomPersonalizationEntitySkeletonV2/RoomPersonalizationEntitySkeletonV2';
import { RoomPersonalizationEntityV2 } from 'components/pages/personalize-your-room-v2/RoomPersonalizationEntity/RoomPersonalizationEntityV2';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';

export { getStaticPaths };

const PersonalizeYourRoom: React.FC = () => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('personalize-your-room');

  const personalizationEntities = useReactiveVar(personalizeYourRoomStorage);
  const specialRequests = useReactiveVar(specialRequestsStorage);

  const [currentPersonalizationEntities, setCurrentPersonalizationEntities] = useState(
    personalizationEntities || [],
  );

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
    }
  }, [reservationData, navigate]);

  const reservationInfo = reservationData?.getReservation.data;

  const startDate = dayjs(reservationInfo?.details.checkInDate).format(timeFormats.YEAR_MONTH_DAY);
  const endDate = dayjs(reservationInfo?.details.checkOutDate).format(timeFormats.YEAR_MONTH_DAY);

  const { loading, data, error } = useQuery<IPersonalizeYourRoomApiResponse>(
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
    if (data?.getAvailablePersonalizations?.data.length === 0) {
      navigate(availablePaths.CHECK_IN);
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast('Please try again', { type: 'error' });
    }
  }, [error]);

  const availablePersonalizations = data?.getAvailablePersonalizations?.data?.filter(
    (el) => el?.isActive,
  );

  const goToNextStep = useCallback(() => {
    personalizeYourRoomStorage(currentPersonalizationEntities.filter((x) => x.quantity !== '0'));
    navigate(availablePaths.CHECK_IN);
  }, [currentPersonalizationEntities, navigate]);

  return (
    <>
      <Head>
        <title>{t('Check-In')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Personalise My Stay') as string} />
      <PageWrapper>
        <div className={styles.personalizationEntitiesWrapper}>
          <p className={styles.step}>
            Step <div className={styles.active}>1</div>
            <div className={styles.disabled}>2</div>
          </p>

          {loading ? (
            <>
              <RoomPersonalizationEntitySkeletonV2 />
              <RoomPersonalizationEntitySkeletonV2 />
              <RoomPersonalizationEntitySkeletonV2 />
              <RoomPersonalizationEntitySkeletonV2 />
              <RoomPersonalizationEntitySkeletonV2 />
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
                setCurrentPersonalizationEntities={setCurrentPersonalizationEntities}
                count={
                  currentPersonalizationEntities.find((entity) => el.code === entity.code)
                    ?.quantity || '0'
                }
              />
            ))
          )}
        </div>

        <div className={styles.confirmButtonWrapper}>
          <StyledButton className={styles.confirmButton} variant='contained' onClick={goToNextStep}>
            {t('Continue')}
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
      ...(await serverSideTranslations(locale as string, ['personalize-your-room'], i18nConfig)),
    },
  };
};

export default PersonalizeYourRoom;

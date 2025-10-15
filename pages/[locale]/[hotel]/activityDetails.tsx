import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import styles from '@styles/activities/activity-details.module.scss';
import {
  toggleDetailsDrawer,
  selectActivityCategory,
  selectedActivityName,
  // toggleCheckInDetailsDrawer,
  selectActivityDetails,
} from 'storage/home.storage';
import { ListComponentEntity } from 'components/shared/ListComponents/ListComponents';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { GET_ACTIVITIES, IGetActivitiesApiResponse } from 'core/graphql/queries/GET_ACTIVITY';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { activityStorage } from 'storage/activity.storage';
import { ActivityDetailDrawer } from 'components/shared/ActivityDetailDrawer/ActivityDetailDrawer';
import { Loader } from 'components/shared/Loaders/Loaders';
import { ACTIVITIES_MODULE } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';
import { availablePaths } from 'utils/availablePaths';
import { getTrips } from 'storage/trips.storage';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import dayjs from 'dayjs';

const ActivityDetails: React.FC = () => {
  const checkedInData = getTrips();
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation?.data;
  const checkInDateInfo = dayjs(reservationInfo?.details?.checkInDate).format('YYYY-MM-DD');
  const checkOutDateInfo = dayjs(reservationInfo?.details?.checkOutDate).format('YYYY-MM-DD');
  const { t } = useTranslation('common');
  const [showSelectedActivity, setShowSelectedActivity] = useState<any>();
  const hotelId = useConfig()?.hotelId;
  const locale = useLocale();
  const [drawerstate, setDrawerState] = useState('Content');
  const categorySelected: any = useReactiveVar(selectActivityCategory);
  const detailsSelected: any = useReactiveVar(selectActivityDetails);
  const categoryNameSelected: any = useReactiveVar(selectedActivityName);
  const navigate = useLocalizedRouter();
  const drawerStatus = useReactiveVar(toggleDetailsDrawer);

  const { data: activitiesData, loading: activitiesLoading } = useQuery<IGetActivitiesApiResponse>(
    GET_ACTIVITIES,
    {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_f' },
      variables: {
        hotelId: hotelId,
        id: '',
        startDate: '',
        endDate: '',
        categoryId: '',
        availability: '',
        priceType: '',
        location: '',
        limit: 0,
        pageToken: '',
        lang: locale === 'en' ? '' : locale,
      },
      skip: !hotelId,
      onCompleted(data) {
        const loadedData = data?.getActivitiesV2?.activities;
        const onCompleteData = loadedData.filter(
          (activity: any) => activity?.categoryId === categorySelected,
        );

        const filteredActivities = loadedData?.find((i: any) => i?.id === detailsSelected);
        setShowSelectedActivity(filteredActivities);
        if (filteredActivities) {
          toggleDetailsDrawer(true);
        } else if (onCompleteData?.length == 0) {
          navigate(availablePaths.ACTIVITY);
        }
      },
    },
  );

  const activitiesList: any = activitiesData?.getActivitiesV2?.activities;

  useEffect(() => {
    const response = activitiesList;

    if (response) {
      const selectedActivities = response.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        isActive: activity.isActive,
        categoryId: activity.categoryId,
        categoryName: activity.categoryName,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      }));

      activityStorage({
        selectedActivities,
        currentActivityItem: activitiesData,
      });
    }
  }, [activitiesData, activitiesList]);

  const selectedListItem = (activity: any) => {
    setShowSelectedActivity(activity);
    toggleDetailsDrawer(true);
  };

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    setDrawerState('Content');
    setShowSelectedActivity(null);
  };

  return (
    <>
      <Head>
        <title>{t('Activities')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Activities') as string} />
      <PageWrapper className={styles.pageWrapper} displayBottomMenu>
        <p className={styles.title}>{categoryNameSelected}</p>
        {activitiesLoading ? (
          <Loader />
        ) : activitiesList?.length > 0 &&
          activitiesList.some((activity: any) => activity?.categoryId === categorySelected) ? (
          activitiesList
            .filter((activity: any) => {
              if (activity?.categoryId !== categorySelected || !activity.isActive) return false;

              const checkinDate = checkInDateInfo || checkedInData?.checkInDate;
              const checkoutDate = checkOutDateInfo || checkedInData?.checkOutDate;

              if (!checkinDate || !checkoutDate) return true;

              const today = checkedInData?.checkedIn
                ? dayjs().startOf('day')
                : dayjs(checkinDate, 'YYYY-MM-DD').startOf('day');

              const checkOut = dayjs(checkoutDate, 'YYYY-MM-DD').startOf('day');

              const schedule = activity.schedule || {};
              const recurring = schedule.recurring;
              const oneTime = schedule.oneTime;

              const parseDate = (dateStr: string): dayjs.Dayjs => {
                const parsed = dayjs(dateStr, 'DD-MM-YYYY').startOf('day');
                if (!parsed.isValid()) {
                  console.warn('Invalid activity date:', dateStr);
                }
                return parsed;
              };
              if (oneTime?.date) {
                const activityDate = parseDate(oneTime.date);
                return activityDate.isBetween(today, checkOut, null, '[]');
              }

              if (recurring?.startDate && recurring?.endDate) {
                const recurringStart = parseDate(recurring.startDate);
                const recurringEnd = parseDate(recurring.endDate);

                // Check if recurring period overlaps with [today, checkout]
                return recurringStart.isSameOrBefore(checkOut) && recurringEnd.isSameOrAfter(today);
              }
              return true;
            })
            .map((activity: any) => (
              <div key={activity?.id}>
                <ListComponentEntity
                  queryResultEntity={activity}
                  selectedListItem={selectedListItem}
                  module={ACTIVITIES_MODULE}
                />
              </div>
            ))
        ) : (
          <Loader />
        )}
        {showSelectedActivity && (
          <CustomDrawer
            open={toggleDetailsDrawer()}
            onClose={closeDrawer}
            content={
              <ActivityDetailDrawer
                showSelectedActivity={showSelectedActivity}
                drawerstate={drawerstate}
                setDrawerState={setDrawerState}
                closeDrawer={closeDrawer}
              />
            }
          />
        )}
      </PageWrapper>
    </>
  );
};

export default ActivityDetails;

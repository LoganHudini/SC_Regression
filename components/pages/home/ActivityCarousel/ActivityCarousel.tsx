import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
// import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
// import { ActivityDetailDrawer } from 'components/shared/ActivityDetailDrawer/ActivityDetailDrawer';
import styles from './ActivityCarousel.module.scss';
import cx from 'classnames';

import { activityStorage } from 'storage/activity.storage';
import { CAROUSEL_RESPONSIVE } from 'utils/constants';
import { availablePaths } from 'utils/availablePaths';
import {
  selectActivityCategory,
  selectActivityDetails,
  selectedActivityName,
  // selectedActivityName,
} from 'storage/home.storage';
import { useQuery } from '@apollo/client';
import {
  GET_ACTIVITY_TAGS,
  IGetActivityTagsApiResponse,
} from 'core/graphql/queries/GET_ACTIVITY_TAGS';
import { useConfig } from 'utils/hooks/useConfiguration';
import dayjs from 'dayjs';
import { getTrips } from 'storage/trips.storage';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';

interface ICarouselSlideProps {
  className?: string; // <-- add this
  slide: any;
  openDrawer: (activity: any) => void;
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, openDrawer, className }) => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation('common');

  const handleItemClick = () => {
    selectActivityCategory(slide?.categoryId);
    selectActivityDetails(slide?.id);
    selectedActivityName(slide?.categoryName),
      // openDrawer(slide); // This will set state in parent
      navigate(availablePaths.ACTIVITY_DETAILS);
  };

  return (
    <div className={styles.wrapper} onClick={handleItemClick}>
      <StableImage
        className={styles.image}
        src={`${process.env.NEXT_PUBLIC_ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div className={cx(styles.imgWrapper)}>
        <h3 className={cx(styles.name, 'globals-activityTitle')}>{slide?.name}</h3>
      </div>
    </div>
  );
};

export const ActivityCarousel: React.FC<{ data: any[] }> = ({ data }) => {
  const recommendedActivities = data;
  const hotelId = useConfig()?.hotelId;
  const locale = useLocale();

  const { data: tags, loading: tagsLoading } = useQuery<IGetActivityTagsApiResponse>(
    GET_ACTIVITY_TAGS,
    {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_f' },
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    },
  );
  const checkedInData = getTrips();
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation?.data;
  const checkInDateInfo = dayjs(reservationInfo?.details?.checkInDate).format('YYYY-MM-DD');
  const checkOutDateInfo = dayjs(reservationInfo?.details?.checkOutDate).format('YYYY-MM-DD');

  const reservationRoomStatus = checkedInData?.lastName && checkedInData?.roomNumber ? true : false;
  const reservationStatus = checkedInData?.lastName && checkedInData?.reservationId ? true : false;

  const checkinDate = checkInDateInfo || checkedInData?.checkInDate;
  const checkoutDate = checkOutDateInfo || checkedInData?.checkOutDate;

  // Find the "Recommended" tag ID
  const recommendedTag = tags?.getActivityTags?.find((tag) => tag.name === 'Recommended');
  const recommendedTagId = recommendedTag?.id;

  const currentDate = dayjs().startOf('day'); // Normalize to start of today

  const filteredActivities = recommendedActivities?.filter((activity) => {
    if (!activity?.tags?.includes(recommendedTagId)) return false;
    if (activity?.isActive === false) return false;

    const schedule = activity?.schedule || {};
    const scheduleType = schedule?.scheduleType;

    const parseDate = (dateString: string | null | undefined): dayjs.Dayjs | null => {
      if (!dateString) return null;
      const parsed = dayjs(dateString, ['DD-MM-YYYY', 'YYYY-MM-DD']);
      return parsed.isValid() ? parsed.startOf('day') : null;
    };

    let startDateFilter: dayjs.Dayjs | null = null;
    let endDateFilter: dayjs.Dayjs | null = null;

    if (reservationRoomStatus) {
      startDateFilter = currentDate;
      endDateFilter = parseDate(checkoutDate);
    } else if (reservationStatus) {
      startDateFilter = parseDate(checkinDate);
      endDateFilter = parseDate(checkoutDate);
    } else {
      startDateFilter = currentDate;
    }

    if (scheduleType === 'ONE_TIME') {
      const oneTimeDate = parseDate(schedule?.oneTime?.date);
      const oneTimeEndTime = schedule?.oneTime?.endTime;

      if (!oneTimeDate) return false;

      if (startDateFilter && oneTimeDate.isBefore(startDateFilter)) return false;
      if (endDateFilter && oneTimeDate.isAfter(endDateFilter)) return false;

      if (oneTimeDate.isSame(currentDate, 'day') && oneTimeEndTime) {
        const now = dayjs();
        const endTime = dayjs(oneTimeEndTime, 'HH:mm');
        const combinedEnd = oneTimeDate.hour(endTime.hour()).minute(endTime.minute());
        if (now.isAfter(combinedEnd)) return false;
      }

      return true;
    }

    if (scheduleType === 'RECURRING') {
      const recurringStartDate = parseDate(schedule?.recurring?.startDate);
      const recurringEndDate = parseDate(schedule?.recurring?.endDate);

      if (!recurringStartDate) return false;

      const filterStart = startDateFilter || currentDate;
      const filterEnd = endDateFilter || currentDate.add(1, 'year');

      if (!recurringEndDate) {
        return recurringStartDate.isBefore(filterEnd);
      }

      return !(recurringEndDate.isBefore(filterStart) || recurringStartDate.isAfter(filterEnd));
    }

    return true; // fallback
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const { t } = useTranslation(['common']);

  const openDrawer = (activity: any) => {
    setSelectedActivity(activity);
    setDrawerOpen(true);
    activityStorage({
      selectedActivities: [activity],
      currentActivityItem: { getActivitiesV2: { activities: [activity] } },
    });
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedActivity(null);
    const stored = activityStorage();
    activityStorage({
      ...stored,
      selectedActivities: [],
      currentActivityItem: undefined,
    });
  };

  return (
    filteredActivities?.length > 0 && (
      <div className={styles.activityCarouselWrapper}>
        <p className={styles.activityCarouselTitle}>{t('Experiences')}</p>
        <WithScrollbar
          responsive={CAROUSEL_RESPONSIVE}
          className={cx(styles.carouselWrapper, {
            [styles.carouselWrapperSingleImageUl]: filteredActivities?.length === 1,
          })}
          itemClass={styles.carouselItemScroll}
        >
          {filteredActivities.map((slide, index) => (
            <CarouselSlide key={index} slide={slide} openDrawer={openDrawer} />
          ))}
        </WithScrollbar>
      </div>
    )
  );
};

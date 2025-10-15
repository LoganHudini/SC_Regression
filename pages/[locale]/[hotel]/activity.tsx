import React, { useEffect } from 'react';
import styles from '../../../styles/activities/activity.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';
import Head from 'next/head';
import { t } from 'i18next';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import {
  GET_ACTIVITY_CATEGORIES,
  IGetActivityCategoriesApiResponse,
} from 'core/graphql/queries/GET_ACTIVITY_CATEGORIES';
import { activityCategoriesStorage } from 'storage/activity-categories.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import { ASSETS_URL } from 'core/graphql/endpoints';
import {
  hotelLocation,
  selectActivityCategory,
  selectActivityDetails,
  selectedActivityName,
} from 'storage/home.storage';
import { Loader } from 'components/shared/Loaders/Loaders';
import { useConfig } from 'utils/hooks/useConfiguration';
import { GET_LOCATIONS, IGetLocationsApiResponse } from 'core/graphql/queries/GET_LOCATIONS';

const Activity = () => {
  const hotelId = useConfig()?.hotelId;
  const navigate = useLocalizedRouter();
  const locale = useLocale();
  const { data: locationData, loading: locationLoading } = useQuery<IGetLocationsApiResponse>(
    GET_LOCATIONS,
    {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_d' },
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
      skip: !hotelId,
    },
  );

  const hotelsLocation = useReactiveVar(hotelLocation);

  // Set location only if not already set
  useEffect(() => {
    if (locationData?.getLocations && hotelsLocation?.length === 0) {
      hotelLocation(locationData.getLocations);
    }
  }, [locationData, hotelsLocation]);

  useEffect(() => {
    selectActivityCategory([]);
    selectActivityDetails([]);
    selectedActivityName([]);
  }, []);

  const { data: categories, loading: categoriesLoading } =
    useQuery<IGetActivityCategoriesApiResponse>(GET_ACTIVITY_CATEGORIES, {
      fetchPolicy: 'no-cache',
      context: { clientName: 'property_g' },
      variables: {
        hotelId: hotelId,
        lang: locale === 'en' ? '' : locale,
      },
    });

  useEffect(() => {
    if (categories?.getActivityCategories?.data) {
      activityCategoriesStorage({
        selectedCategories: categories.getActivityCategories.data.map((category: any) => ({
          id: category.id,
          categoryCode: category.categoryCode,
          name: category.name,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
      });
    }
  }, [categories]);

  const handleClick = (id: any, name: any) => {
    id === 'spa'
      ? navigate(availablePaths.SPA_INFO)
      : id === 'restaurant'
      ? navigate(availablePaths.RESTAURANTS_BARS)
      : (selectActivityCategory(id),
        selectedActivityName(name),
        navigate(availablePaths.ACTIVITY_DETAILS));
  };

  const activityList: any = categories?.getActivityCategories ?? [];

  return (
    <>
      <Head>
        <title>{t('Activities')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Resort Activities') as string} />
      <PageWrapper displayBottomMenu className={styles.pageWrapper}>
        <div className={styles.title}>Explore Activities</div>
        <div className={styles.container}>
          {categoriesLoading ? (
            <Loader />
          ) : (
            <>
              {/* Combine dynamic activityList with hardcoded spa and restaurant */}
              {[
                ...(activityList?.length > 0
                  ? activityList.filter((activity: any) => activity.isActive)
                  : []),

                // Hardcoded Spa entry
                // Hardcoded Spa entry
                {
                  id: 'spa',
                  name: 'Spa',
                  images: [
                    {
                      ratio1to1: '/images/activity/spa.jpg',
                    },
                  ],
                },

                // Hardcoded Restaurant entry
                {
                  id: 'restaurant',
                  name: 'Eat & Drink',
                  images: [
                    {
                      ratio1to1: '/images/activity/restaurant.jpg',
                    },
                  ],
                },
              ]?.map((activity: any) => {
                const imageUrl =
                  activity.id === 'spa' || activity.id === 'restaurant'
                    ? activity.images?.[0]?.ratio1to1 || '' // These already have valid URLs
                    : activity.images?.length > 0
                    ? `${ASSETS_URL}/${activity?.images[0]?.ratio1to1}`
                    : '';

                return (
                  <div
                    key={activity.id}
                    className={styles.wrapper}
                    onClick={() => handleClick(activity.id, activity?.name)}
                  >
                    <div className={styles.imgWrapper}>
                      <p className={cx(styles.name, 'globals-activityTitle')}>{activity?.name}</p>
                    </div>
                    <StableImage className={styles.image} src={imageUrl} alt={activity?.name} />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default Activity;
function elseif(arg0: boolean) {
  throw new Error('Function not implemented.');
}

import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL, BRAND_CODE } from '../../../../core/graphql/endpoints';
import styles from './DiningCarousel.module.scss';
import {
  irdActiveMenuList,
  getTimings,
  diningOptionList,
  activeItems,
  filterIRDMenuItems,
  getFormattedTime,
  convertTo12HourFormat,
  getCurrentOpenPeriod,
} from 'utils/functions';
import {
  CAROUSEL_RESPONSIVE,
  IN_ROOM_DINING,
  RESTAURANTS_AND_BARS,
  RESTAURANT,
  ALL_DAY,
  DINING,
} from 'utils/constants';
import cx from 'classnames';
import { diningInformationStorage } from 'storage/dining.storage';
import { availablePaths } from 'utils/availablePaths';
import {
  hotelInfoStorage,
  diningOptions,
  toggleDetailsDrawer,
  toggleRestaurantDetailsDrawer,
} from 'storage/home.storage';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { IRDMenuApiResponse } from 'core/graphql/queries/IRD_MENU';
import { useReactiveVar } from '@apollo/client';
import { RestaurantDetail } from 'components/pages/dining/RestaurantDetail/RestaurantDetail';
import useTimeStatus from 'utils/hooks/useTimeStatus';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { useConfig } from 'utils/hooks/useConfiguration';

interface ICarouselProps {
  ird: any;
  restaurants: any;
  loading?: boolean;
}

interface ICarouselSlideProps {
  slide: any;
  imageSlide?: any;
  diningOptionsCarousal?: any;
  module?: boolean;
  slideStyle?: any;
}

export const DiningCarousel: React.FC<ICarouselProps> = ({ ird, restaurants }) => {
  const { t } = useTranslation(['common']);
  const isCheckedIn = useCheckedIn();
  const hotelInformation = useReactiveVar(hotelInfoStorage);

  const [diningOptionsState, setDiningOption] = useState<any>();
  const [timeSelectDrawer, setTimeSelectDrawer] = useState(false);

  const irdMenuActive: IRDMenuApiResponse = irdActiveMenuList(
    ird,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );
  const irdActiveMenu = filterIRDMenuItems(irdMenuActive);
  const queryResultsData: any = restaurants?.getRestaurantDetails?.restaurant;
  const activeRestaurants = activeItems(restaurants?.getRestaurantDetails?.restaurant);
  const config = useConfig();

  const filteredOptionFunction = () => {
    const value: any[] = [];

    if (activeRestaurants?.length > 0) {
      value.push({
        type: RESTAURANT,
        label: diningOptionList(RESTAURANT),
      });
    }

    if (isCheckedIn?.checkedIn && irdActiveMenu && irdActiveMenu?.length > 0) {
      const irdModuleName =
        config?.modules?.find((m: any) => m?.code === IN_ROOM_DINING)?.name ||
        diningOptionList(IN_ROOM_DINING);

      value.unshift({
        type: IN_ROOM_DINING,
        label: irdModuleName,
      });
    }

    return value;
  };
  const restaurantDetailsDrawerStatus = useReactiveVar(toggleRestaurantDetailsDrawer);

  const selectedRestaurant = useReactiveVar(selectedRestaurantStorage);

  const irdMenu = irdActiveMenu?.map((option: any) => ({
    ...option,
    type: IN_ROOM_DINING,
  }));

  const CarouselSlide: React.FC<ICarouselSlideProps> = ({
    slide,
    module,
    diningOptionsCarousal,
  }) => {
    const navigate = useLocalizedRouter();
    const [iframeComponent, setIframeComponent] = useState<boolean>(false);

    const handleMenu = () => {
      diningInformationStorage({
        selectedMenu: slide?.id,
        menuName: slide?.name,
        selectedCategory: slide?.categories[0]?.id,
        categoryName: slide?.categories[0]?.name,
      });
      navigate(availablePaths?.DINING);
    };

    const getRestaurantStatus = useTimeStatus({
      module: DINING,
      slide: slide,
      hotelInformation: hotelInformation,
      t,
    });

    const redirect = (buttonClick?: any) => {
      diningOptions(diningOptionsCarousal);
      selectedRestaurantStorage(slide);
      !buttonClick && toggleRestaurantDetailsDrawer(true);
    };

    const time = getTimings(slide?.customAttributes);

    const closeBooking = () => {
      setIframeComponent(false);
    };

    const isOpen = getFormattedTime(slide?.hours?.map((time: any) => time?.open));
    const isClose = getFormattedTime(slide?.hours?.map((time: any) => time?.close));

    function isToday(day: any) {
      const today = dayjs().format('dddd').toUpperCase();
      return today === day.toUpperCase() || day === 'EVERYDAY';
    }

    const isAnyDayToday = slide?.hours.some((entry: any) => isToday(entry.day));

    const currentOpenPeriod: any = getCurrentOpenPeriod(slide?.hours);

    const getIRDMenuStatus = () => {
      if (!slide?.hours || slide?.hours.length === 0) {
        return { status: t('Closed'), timing: '' };
      }

      const today = dayjs().format('dddd').toUpperCase();
      const currentTime = dayjs();

      const todaySchedule = slide?.hours.find(
        (entry: any) => entry.day.toUpperCase() === today || entry.day === 'EVERYDAY',
      );

      if (!todaySchedule) {
        return { status: t('Closed'), timing: '' };
      }

      if (todaySchedule.open === ALL_DAY && todaySchedule.close === ALL_DAY) {
        if (todaySchedule.day === 'EVERYDAY') {
          return { status: t('Open'), timing: t('Open 24x7') };
        }

        if (todaySchedule.day.toUpperCase() === today) {
          return { status: t('Open'), timing: t('Open') };
        }

        return { status: t('Closed'), timing: '' };
      }

      if (todaySchedule.open && todaySchedule.close) {
        if (todaySchedule.day.toUpperCase() === today || todaySchedule.day === 'EVERYDAY') {
          const openTime = dayjs(todaySchedule.open, 'HH:mm');
          const closeTime = dayjs(todaySchedule.close, 'HH:mm');

          if (closeTime.isBefore(openTime)) {
            if (currentTime.isAfter(openTime) || currentTime.isBefore(closeTime)) {
              return {
                status: t('Open'),
                timing: `${t('From')} ${convertTo12HourFormat(
                  todaySchedule.open,
                )} - ${convertTo12HourFormat(todaySchedule.close)}`,
              };
            }
          } else {
            if (currentTime.isAfter(openTime) && currentTime.isBefore(closeTime)) {
              return {
                status: t('Open'),
                timing: `${t('From')} ${convertTo12HourFormat(
                  todaySchedule.open,
                )} - ${convertTo12HourFormat(todaySchedule.close)}`,
              };
            }
          }
        }
      }
      const timingInfo = todaySchedule
        ? `${t('From')} ${convertTo12HourFormat(todaySchedule.open)} - ${convertTo12HourFormat(
            todaySchedule.close,
          )}`
        : '';

      return { status: t('Closed'), timing: timingInfo };
    };

    return (
      <>
        <div
          className={cx(styles.carouselSlideWrapper, 'globals-carouselSlideWrapper')}
          onClick={() => (module ? handleMenu() : redirect(''))}
        >
          <StableImage
            className={cx(styles.carouselSlideImage, 'globals-carouselSlideImage')}
            src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
          />
          <div
            className={cx(
              styles.carouselSlideDetailsWrapperRestaurantsAndBars,
              { [styles.carouselSlideDetailsWrapperIrd]: module },
              'globals-carouselSlideDetailsWrapperRestaurantsAndBars',
              'globals-cardWrapperRestaurantsAndBars',
            )}
          >
            <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>

            {!module &&
              (isOpen?.includes(ALL_DAY) && isClose?.includes(ALL_DAY) && isAnyDayToday ? (
                <div className={styles.carouselRestaurantTimeStatus}>
                  <p>{t('Open')}</p>
                </div>
              ) : (
                <div className={styles.carouselRestaurantTimeStatus}>
                  <p>{getRestaurantStatus?.status}</p>
                </div>
              ))}

            {slide?.hours[0]?.day &&
              module &&
              (() => {
                const irdStatus = getIRDMenuStatus();
                return (
                  <p className={styles.carouselSlideTimings}>
                    {irdStatus.timing || irdStatus.status}
                  </p>
                );
              })()}

            <CustomReadMore
              text={t(BRAND_CODE === 'fairmont' ? 'Discover' : 'View More') as string}
            />
          </div>
        </div>
        {iframeComponent && (
          <CustomDrawer
            open={iframeComponent}
            onClose={closeBooking}
            content={
              <IframeComponent
                src={slide?.cta?.redirectUrl}
                handledrawerState={setIframeComponent}
                name={RESTAURANTS_AND_BARS}
              />
            }
            isIframe={true}
          />
        )}
      </>
    );
  };

  const renderSlides = (slides: any, module: boolean) =>
    slides?.length > 0 &&
    slides?.map((slide: any, index: any) => (
      <CarouselSlide
        key={index}
        slide={slide}
        diningOptionsCarousal={diningOptionsState}
        module={module}
        slideStyle={slides?.length === 1}
      />
    ));

  const uniqueFilteredDiningOptions = filteredOptionFunction();
  const isIRD = diningOptionsState?.type === IN_ROOM_DINING;
  const slides = isIRD ? irdMenu : activeRestaurants;

  useEffect(() => {
    if (uniqueFilteredDiningOptions?.length > 0) {
      setDiningOption(uniqueFilteredDiningOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckedIn?.checkedIn, ird, queryResultsData]);

  return (
    slides?.length > 0 && (
      <div className={styles.diningCarouselWrapper}>
        <p
          className={cx(styles.diningCarouselTitle, {
            [styles.diningSecondaryCarouselTitle]: uniqueFilteredDiningOptions?.length <= 1,
          })}
        >
          {t('Eat & Drink')}
        </p>
        {uniqueFilteredDiningOptions?.length > 1 && (
          <div className={cx(styles.diningOptions, 'globals-diningOptions')}>
            {uniqueFilteredDiningOptions?.map((dining: any, index: any) => (
              <p
                key={index}
                className={cx(styles.diningOptionsItem, 'globals-diningOptionsItem', {
                  [cx(styles.diningOptionsItemActive, 'globals-diningOptionsItemActive')]:
                    diningOptionsState?.type === dining?.type,
                })}
                onClick={() => setDiningOption(dining)}
                data-tip={dining?.label}
              >
                {dining?.label}
              </p>
            ))}
          </div>
        )}
        <WithScrollbar
          key={isIRD ? 'IRD' : 'RESTAURANTS'}
          responsive={CAROUSEL_RESPONSIVE}
          className={cx(styles.carouselWrapper, {
            [styles.carouselWrapperSingleImageUl]: slides?.length === 1,
          })}
        >
          {renderSlides(slides, isIRD)}
        </WithScrollbar>
        {!isEmpty(selectedRestaurant) && (
          <CustomDrawer
            open={restaurantDetailsDrawerStatus}
            onClose={() => {
              toggleDetailsDrawer(false);
              setTimeSelectDrawer(false);
              toggleRestaurantDetailsDrawer(false);
              diningOptions({});
              selectedRestaurantStorage({});
            }}
            content={
              <RestaurantDetail
                selectedRestaurant={selectedRestaurant && selectedRestaurant}
                timeSelectProps={timeSelectDrawer}
              />
            }
          />
        )}
      </div>
    )
  );
};

import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './DiningCarousel.module.scss';
import {
  filterRestaurantList,
  irdActiveMenuList,
  getTimings,
  diningOptionList,
  restaurantCtaNavigation,
  activeItems,
  filterIRDMenuItems,
} from 'utils/functions';
import {
  CAROUSEL_RESPONSIVE,
  IN_ROOM_DINING,
  EXTERNAL_URL,
  RESTAURANTS_AND_BARS,
  RESTAURANT,
  ACTIVE,
} from 'utils/constants';
import cx from 'classnames';
import { diningInformationStorage } from 'storage/dining.storage';
import { availablePaths } from 'utils/availablePaths';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import { diningOptions } from 'storage/home.storage';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { useCheckedIn } from 'storage/check-in.storage';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { getHotelCode } from 'utils/fetchConfigs';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useRouter } from 'next/router';
import { PlaceholderImage } from 'components/shared/PlaceholderImage/PlaceholderImage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { IRDMenuApiResponse } from 'core/graphql/queries/IRD_MENU';

interface ICarouselProps {
  ird: any;
  restaurants: any;
  loading?: boolean;
  irdModule?: boolean;
}

interface ICarouselSlideProps {
  slide: any;
  imageSlide?: any;
  diningOptionsCarousal?: any;
  module?: boolean;
  slideStyle?: any;
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, module, diningOptionsCarousal }) => {
  const hotel = getHotelCode();

  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
  const router = useRouter();
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
  const redirect = () => {
    diningOptions(diningOptionsCarousal);
    selectedRestaurantStorage(slide);
    navigate(`/${hotel}/${module ? 'dining' : 'restaurants-bars'}`);
  };

  const time = getTimings(slide?.customAttributes);

  const closeBooking = () => {
    setIframeComponent(false);
  };

  return (
    <>
      <div
        className={cx(styles.carouselSlideWrapper, 'globals-carouselSlideWrapper')}
        onClick={module ? handleMenu : redirect}
      >
        {slide?.images[0]?.master ? (
          <StableImage
            className={cx(styles.carouselSlideImage, 'globals-carouselSlideImage')}
            src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
          />
        ) : (
          <PlaceholderImage />
        )}
        <div
          className={cx(
            styles.carouselSlideDetailsWrapperRestaurantsAndBars,
            { [styles.carouselSlideDetailsWrapperIrd]: module },
            'globals-carouselSlideDetailsWrapperRestaurantsAndBars',
          )}
        >
          <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>
          <div className={cx(styles.content, 'globals-content')}>
            {slide?.primaryCuisine && (
              <div className={styles.cuisineRow}>
                <DishIcon className={styles.cuisineIcon} />
                <span>{slide?.primaryCuisine?.toLowerCase()}</span>
              </div>
            )}{' '}
            {slide.hours[0]?.day && module && (
              <p className={styles.carouselSlideTimings}>{slide.hours[0]?.day}</p>
            )}
            {time && (
              <div className={styles.cuisineRowTime}>
                <ClockIcon className={styles.cuisineIcon} />
                <p>{time?.value}</p>
              </div>
            )}
          </div>
          {module ? (
            <CustomReadMore text={'READ MORE'} />
          ) : (
            slide?.cta?.status === ACTIVE && (
              <div className={cx(styles.buttonWrapper, 'globals-buttonWrapper')}>
                <StyledButton
                  variant='outlined'
                  className={styles.button}
                  onClick={() => {
                    slide?.cta?.redirectOption === EXTERNAL_URL
                      ? setIframeComponent(true)
                      : restaurantCtaNavigation(
                          slide,
                          router,
                          navigate(availablePaths.RESTAURANTS_BARS),
                        );
                  }}
                >
                  {slide?.cta?.ctaTitle || t('BOOK NOW')}
                </StyledButton>
              </div>
            )
          )}
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

export const DiningCarousel: React.FC<ICarouselProps> = ({ ird, restaurants, irdModule }) => {
  const { t } = useTranslation(['common']);
  const isCheckedIn = useCheckedIn();

  const [diningOptionsState, setDiningOption] = useState<any>();

  const irdMenuActive: IRDMenuApiResponse = irdActiveMenuList(ird);
  const irdActiveMenu = filterIRDMenuItems(irdMenuActive);
  const queryResultsData: any = restaurants?.getRestaurantDetails?.restaurant;
  const filteredList = filterRestaurantList(queryResultsData, diningOptionsState);

  const activeRestaurants = activeItems(restaurants?.getRestaurantDetails?.restaurant);
  const filteredOptionFunction = () => {
    const value = activeRestaurants?.length > 0 ? [{ type: RESTAURANT }] : [];
    if (isCheckedIn?.checkedIn && irdModule && irdActiveMenu) {
      value?.unshift({ type: IN_ROOM_DINING });
    }

    return value;
  };

  const irdMenu = irdActiveMenu?.map((option: any) => ({
    ...option,
    type: IN_ROOM_DINING,
  }));

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

  const slides = diningOptionsState?.type === IN_ROOM_DINING ? irdMenu : activeRestaurants;
  useEffect(() => {
    if (uniqueFilteredDiningOptions?.length > 0) {
      setDiningOption(uniqueFilteredDiningOptions[0]);
    }
  }, [isCheckedIn?.checkedIn, irdModule, ird, queryResultsData]);

  return (
    (irdActiveMenu?.length > 0 || activeRestaurants?.length > 0) && (
      <div className={styles.diningCarouselWrapper}>
        <p
          className={cx(styles.diningCarouselTitle, {
            [styles.diningSecondaryCarouselTitle]: uniqueFilteredDiningOptions?.length <= 1,
          })}
        >
          {t('Dining')}
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
                data-tip={diningOptionList(dining?.type)}
              >
                {diningOptionList(dining?.type)}
              </p>
            ))}
          </div>
        )}
        <WithScrollbar
          responsive={CAROUSEL_RESPONSIVE}
          className={cx(styles.carouselWrapper, {
            [styles.carouselWrapperSingleImageUl]: slides?.length === 1,
          })}
        >
          {renderSlides(slides, diningOptionsState?.type === IN_ROOM_DINING)}
        </WithScrollbar>
      </div>
    )
  );
};

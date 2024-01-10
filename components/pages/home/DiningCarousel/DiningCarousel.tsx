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
  uniqueDiningOption,
  diningOptionList,
} from 'utils/functions';
import {
  BAR,
  BARS_CAPS,
  CAROUSEL_RESPONSIVE,
  DINING_OPTIONS,
  DINING_OPTIONS_PRE_CHECK_IN,
  IN_ROOM_DINING,
  RESTAURANT,
  RESTAURANTS,
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

const CarouselSlide: React.FC<ICarouselSlideProps> = ({
  slide,
  module,
  diningOptionsCarousal,
  slideStyle,
}) => {
  const hotel = getHotelCode();

  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
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

  return (
    <>
      {module ? (
        <div className={styles.carouselSlideWrapper} onClick={handleMenu}>
          <StableImage
            src={`${ASSETS_URL}/${slide.images[0]?.master}`}
            className={cx(styles.carouselSlideImage, {
              [styles.carouselWrapperSingleImage]: slideStyle,
            })}
          />
          <div
            className={cx(styles.carouselSlideDetailsWrapper, {
              [styles.detailPosition]: slideStyle,
            })}
          >
            {slide.name && <h3 className={styles.carouselSlideTitle}>{slide.name}</h3>}
            {slide.hours[0]?.day && (
              <p className={styles.carouselSlideTimings}>{slide.hours[0]?.day}</p>
            )}
            <CustomReadMore text={'READ MORE'} />
          </div>
        </div>
      ) : (
        <div className={styles.carouselSlideWrapper} onClick={redirect}>
          <StableImage
            className={styles.carouselSlideImage}
            src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
          />
          <div
            className={cx(styles.carouselSlideDetailsWrapperRestaurantsAndBars, {
              [styles.detailPosition]: slideStyle,
            })}
          >
            <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>
            <div className={styles.content}>
              {slide?.primaryCuisine && (
                <div className={styles.cuisineRow}>
                  <DishIcon className={styles.cuisineIcon} />
                  <span>{slide?.primaryCuisine?.toLowerCase()}</span>
                </div>
              )}{' '}
              {time && (
                <div className={styles.cuisineRowTime}>
                  <ClockIcon className={styles.cuisineIcon} />
                  <p>{time?.value}</p>
                </div>
              )}
            </div>
            <CustomReadMore text={'READ MORE'} />
          </div>
        </div>
      )}
    </>
  );
};

export const DiningCarousel: React.FC<ICarouselProps> = ({
  ird,
  restaurants,
  loading,
  irdModule,
}) => {
  const { t } = useTranslation(['common']);
  const isCheckedIn = useCheckedIn();

  const [diningOptionsState, setDiningOption] = useState<any>();

  const irdActiveMenu = irdActiveMenuList(ird);
  const queryResultsData: any = restaurants?.getRestaurantDetails?.restaurant;
  const filteredList = filterRestaurantList(queryResultsData, diningOptionsState);

  const filteredOptionFunction = () => {
    const value = uniqueDiningOption(queryResultsData);
    if (value?.length > 0) {
      if (value[0]?.type === BAR) {
        const firstItem = value?.shift();
        value?.push(firstItem);
      }

      if (isCheckedIn?.checkedIn && irdModule && irdActiveMenu) {
        value?.unshift({ type: IN_ROOM_DINING });
      }
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

  const slides = filterRestaurantList(
    diningOptionsState?.type === IN_ROOM_DINING ? irdMenu : queryResultsData,
    diningOptionsState,
  );

  useEffect(() => {
    if (uniqueFilteredDiningOptions?.length > 0) {
      setDiningOption(uniqueFilteredDiningOptions[0]);
    }
  }, [isCheckedIn?.checkedIn, irdModule, ird, queryResultsData]);

  return (
    (irdActiveMenu?.length > 0 || filteredList?.length > 0) && (
      <div className={styles.diningCarouselWrapper}>
        <p className={styles.diningCarouselTitle}>{t('Dining')}</p>
        {uniqueFilteredDiningOptions?.length !== 0 && (
          <div className={styles.diningOptions}>
            {uniqueFilteredDiningOptions?.map((dining: any, index: any) => (
              <p
                key={index}
                className={cx(styles.diningOptionsItem, {
                  [styles.diningOptionsItemActive]: diningOptionsState?.type === dining?.type,
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

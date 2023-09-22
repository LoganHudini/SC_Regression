import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './DiningCarousel.module.scss';
import { useReactiveVar } from '@apollo/client';
import {
  buttonArrow,
  filterRestaurantList,
  irdActiveMenuList,
  restaurantTimings,
} from 'utils/functions';
import { CAROUSEL_RESPONSIVE, DINING_OPTIONS, IN_ROOM_DINING, TIMINGS } from 'utils/constants';
import cx from 'classnames';
import { diningInformationStorage } from 'storage/dining.storage';
import { availablePaths } from 'utils/availablePaths';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import { diningOptions } from 'storage/home.storage';
import { selectedRestaurantStorage } from 'storage/table-reservation.storage';
import { CarouselLoader } from 'components/shared/Loaders/Loaders';
import ArrowButton from '@icons/readMoreArrow.svg';

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
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, module, diningOptionsCarousal }) => {
  const buttonArrowState = buttonArrow;

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
    navigate(`${diningOptionsCarousal.path}`);
  };

  const time = restaurantTimings(slide?.customAttributes);

  return (
    <>
      {module ? (
        <div className={styles.carouselSlideWrapper} onClick={handleMenu}>
          <StableImage
            className={styles.carouselSlideImage}
            src={`${ASSETS_URL}/${slide.images[0]?.master && slide.images[0]?.master}`}
          />
          <div className={styles.carouselSlideDetailsWrapper}>
            {slide.name && <h3 className={styles.carouselSlideTitle}>{slide.name}</h3>}
            {slide.hours[0]?.day && (
              <p className={styles.carouselSlideTimings}>{slide.hours[0]?.day}</p>
            )}
            <p className={styles.carouselSlideViewMore}>
              {t('view more')}
              {buttonArrowState && <ArrowButton />}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.carouselSlideWrapper} onClick={redirect}>
          <StableImage
            className={styles.carouselSlideImage}
            src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
          />
          <div className={styles.carouselSlideDetailsWrapperRestaurantsAndBars}>
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
            <p className={styles.carouselSlideViewMore}>
              {t('read more')}
              {buttonArrowState && <ArrowButton />}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export const DiningCarousel: React.FC<ICarouselProps> = ({ ird, restaurants, loading }) => {
  const { t } = useTranslation(['common']);

  const diningOptionSelected = useReactiveVar(diningOptions);

  const [diningOptionsState, setDiningOption] = useState(diningOptionSelected);

  const irdActiveMenu = irdActiveMenuList(ird);
  const queryResultsData: any = restaurants?.getRestaurantDetails?.restaurant;
  const filteredList = filterRestaurantList(queryResultsData, diningOptionsState);

  const slides = diningOptionsState.title === IN_ROOM_DINING ? irdActiveMenu : filteredList;

  const renderSlides = (slides: any, module: boolean) =>
    slides?.length > 0 &&
    slides?.map((slide: any) => (
      <CarouselSlide
        key={slide?.name}
        slide={slide}
        diningOptionsCarousal={diningOptionsState}
        module={module}
      />
    ));

  return (
    <div className={styles.diningCarouselWrapper}>
      <p className={styles.diningCarouselTitle}>{t('Dining')}</p>
      <div className={styles.diningOptions}>
        {DINING_OPTIONS?.map((dining) => (
          <p
            key={dining?.id}
            className={cx(styles.diningOptionsItem, {
              [styles.diningOptionsItemActive]: diningOptionsState?.id === dining?.id,
            })}
            onClick={() => setDiningOption(dining)}
            data-tip={dining?.title}
          >
            {dining?.title}
          </p>
        ))}
      </div>
      {loading ? (
        <CarouselLoader />
      ) : (
        <WithScrollbar responsive={CAROUSEL_RESPONSIVE} className={styles.carouselWrapper}>
          {renderSlides(slides, diningOptionsState.title === IN_ROOM_DINING)}
        </WithScrollbar>
      )}
    </div>
  );
};

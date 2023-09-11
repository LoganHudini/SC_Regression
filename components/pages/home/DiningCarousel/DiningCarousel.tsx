import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './DiningCarousel.module.scss';
import { useReactiveVar } from '@apollo/client';
import { filterRestaurantList, irdActiveMenuList, platformLoader } from 'utils/functions';
import { CAROUSEL_RESPONSIVE, DINING_OPTIONS, IN_ROOM_DINING } from 'utils/constants';
import cx from 'classnames';
import { diningInformationStorage } from 'storage/dining.storage';
import { availablePaths } from 'utils/availablePaths';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import { diningOptions, toggleLoader } from 'storage/home.storage';
import { SquareLoader } from 'components/shared/Loaders/Loaders';

interface ICarouselProps {
  ird: any;
  restaurants: any;
}

interface ICarouselSlideProps {
  slide: any;
  imageSlide?: any;
  diningOptionsCarousal?: any;
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide }) => {
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

  return (
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
        <p className={styles.carouselSlideViewMore}>{t('view more')}</p>
      </div>
    </div>
  );
};

const CarouselSlideRestaurantAndBars: React.FC<ICarouselSlideProps> = ({
  slide,
  diningOptionsCarousal,
}) => {
  const navigate = useLocalizedRouter();
  const redirect = () => {
    diningOptions(diningOptionsCarousal);
    navigate(`${diningOptionsCarousal.path}`);
  };
  const time = `${slide.hours[0]?.day.slice(0, 3).toLowerCase()}-${slide.hours[0]?.open}-${
    slide.hours[0]?.close
  }...`;
  const { t } = useTranslation(['common']);
  return (
    <div className={styles.carouselSlideWrapper} onClick={redirect}>
      <StableImage
        className={styles.carouselSlideImage}
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div className={styles.carouselSlideDetailsWrapperRestaurantsAndBars}>
        <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>
        {slide?.primaryCuisine && (
          <div className={styles.cuisineRow}>
            <DishIcon className={styles.cuisineIcon} />
            <span>{slide?.primaryCuisine?.toLowerCase()}</span>
          </div>
        )}{' '}
        {slide?.hours && (
          <div className={styles.cuisineRow}>
            <ClockIcon className={styles.cuisineIcon} />
            <span>{time}</span>
          </div>
        )}
        <p className={styles.carouselSlideViewMore}>{t('read more')}</p>
      </div>
    </div>
  );
};

export const DiningCarousel: React.FC<ICarouselProps> = ({ ird, restaurants }) => {
  const { t } = useTranslation(['common']);

  const loading = useReactiveVar(toggleLoader);
  const diningOptionSelected = useReactiveVar(diningOptions);

  const [diningOptionsState, setDiningOption] = useState(diningOptionSelected);

  const irdActiveMenu = irdActiveMenuList(ird);
  const queryResultsData: any = restaurants?.getRestaurantDetails?.restaurant;
  const filteredList = filterRestaurantList(queryResultsData, diningOptionsState);

  return (
    <div className={styles.diningCarouselWrapper}>
      {loading && <SquareLoader />}
      <p className={styles.diningCarouselTitle}>{t('Dining')}</p>
      <div className={styles.diningOptions}>
        {DINING_OPTIONS?.map((dining) => (
          <p
            key={dining?.id}
            className={cx(styles.diningOptionsItem, {
              [styles.diningOptionsItemActive]: diningOptionsState?.id === dining?.id,
            })}
            onClick={() => {
              setDiningOption(dining);
              platformLoader(300);
            }}
            data-tip={dining?.title}
          >
            {dining?.title}
          </p>
        ))}
      </div>
      <WithScrollbar responsive={CAROUSEL_RESPONSIVE} className={styles.carouselWrapper}>
        {diningOptionsState.title === IN_ROOM_DINING
          ? irdActiveMenu?.length > 0 &&
            irdActiveMenu?.map((slide: any) => (
              <CarouselSlide
                key={slide?.name}
                slide={slide}
                diningOptionsCarousal={diningOptionsState}
              />
            ))
          : queryResultsData?.length > 0 &&
            filteredList?.map((slide: any) => (
              <CarouselSlideRestaurantAndBars
                key={slide?.name}
                slide={slide}
                diningOptionsCarousal={diningOptionsState}
              />
            ))}
      </WithScrollbar>
    </div>
  );
};

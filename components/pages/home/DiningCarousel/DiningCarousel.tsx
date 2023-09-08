import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningCarousel.module.scss';
import { useRouter } from 'next/router';
import { IDiningCarouselProps } from './DiningCarousel.types';
import { useQuery, useReactiveVar } from '@apollo/client';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { locale } from 'dayjs';
import { filterRestaurantList, irdActiveMenuList } from 'utils/functions';
import { BARS, DINING_OPTIONS, INROOMDINING, RESTAURANTS } from 'utils/constants';
import cx from 'classnames';
import { diningMenuStorage } from 'storage/dining-menu.storage';
import { diningInformationStorage } from 'storage/dining.storage';
import { availablePaths } from 'utils/availablePaths';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import { diningOptions } from 'storage/home.storage';

interface ICarouselSlideProps {
  slide: any;
  imageSlide?: any;
  diningOptionsCarousal?: any;
}

const carousalResponsive = {
  desktop: {
    breakpoint: { max: 100000, min: 701 },
    items: 2.5,
  },
  tablet: {
    breakpoint: { max: 700, min: 551 },
    items: 2,
  },
  mobileLarge: {
    breakpoint: { max: 550, min: 491 },
    items: 1.7,
  },
  mobile: {
    breakpoint: { max: 490, min: 361 },
    items: 1.3,
  },
  mobileSmall: {
    breakpoint: { max: 360, min: 0 },
    items: 1,
  },
};

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
  imageSlide,
  diningOptionsCarousal,
}) => {
  const router = useRouter();

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

export const DiningCarousel = () => {
  const diningOptionSelected = useReactiveVar(diningOptions);

  const locale = useLocale();
  const { t } = useTranslation(['common']);

  const [diningOptionsState, setDiningOption] = useState(diningOptionSelected);

  const { data } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    variables: {
      restaurantId: '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const { data: restaurantList } = useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });
  const queryResultsData: any = restaurantList?.getRestaurantDetails?.restaurant;

  const irdActiveMenu = irdActiveMenuList(data);

  const filteredList = filterRestaurantList(queryResultsData, diningOptionsState);

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
          >
            {dining?.title}
          </p>
        ))}
      </div>
      <WithScrollbar responsive={carousalResponsive} className={styles.carouselWrapper}>
        {diningOptionsState.title === INROOMDINING
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

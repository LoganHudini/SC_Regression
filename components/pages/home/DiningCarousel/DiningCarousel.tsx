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
import { useQuery } from '@apollo/client';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { locale } from 'dayjs';
import { irdActiveMenuList } from 'utils/functions';
import { DINING_OPTIONS } from 'utils/constants';
import cx from 'classnames';

interface ICarouselSlideProps {
  slide: any;
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
  const router = useRouter();

  return (
    <div className={styles.carouselSlideWrapper}>
      <StableImage className={styles.carouselSlideImage} src={`${ASSETS_URL}/${slide.images[0]}`} />
      <div className={styles.carouselSlideDetailsWrapper}>
        <h3 className={styles.carouselSlideTitle}>{slide.name}</h3>
        <p className={styles.carouselSlideTimings}>{slide.hours[0]?.day}</p>
        <p className={styles.carouselSlideViewMore}>view more</p>
      </div>
    </div>
  );
};

export const DiningCarousel = () => {
  const locale = useLocale();
  const { t } = useTranslation(['common']);

  const [diningOptions, setDiningOption] = useState(DINING_OPTIONS[0]);

  const { data } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    variables: {
      restaurantId: '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const irdActiveMenu = irdActiveMenuList(data);

  return (
    <div className={styles.diningCarouselWrapper}>
      <p className={styles.diningCarouselTitle}>{t('Dining')}</p>
      <div className={styles.diningOptions}>
        {DINING_OPTIONS?.map((dining) => (
          <p
            key={dining?.id}
            className={cx(styles.diningOptionsItem, {
              [styles.diningOptionsItemActive]: diningOptions?.id === dining?.id,
            })}
            onClick={() => setDiningOption(dining)}
          >
            {dining?.title}
          </p>
        ))}
      </div>
      <WithScrollbar responsive={carousalResponsive} className={styles.carouselWrapper}>
        {irdActiveMenu?.length > 0 &&
          irdActiveMenu?.map((slide: any) => <CarouselSlide key={slide?.name} slide={slide} />)}
      </WithScrollbar>
    </div>
  );
};

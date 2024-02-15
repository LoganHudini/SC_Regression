/* eslint-disable @next/next/no-img-element */
import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './HomeCarousel.module.scss';
import { useTranslation } from 'react-i18next';

interface IHomeCarouselProps {
  data: any;
}

interface IHomeCarouselItemProps {
  carouselItem: { name: string; description: string; images: { master: string }[] };
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ carouselItem }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className={styles.imgGradient}>
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${carouselItem?.images[0]?.master}`}
        />
      </div>

      <div className={styles.pageTitle}>
        {carouselItem?.name && <h1 className={styles.title}>{t(`${carouselItem?.name}`)}</h1>}
        {carouselItem?.description && (
          <p className={styles.description}>{t(`${carouselItem?.description}`)}</p>
        )}
      </div>
    </>
  );
};

export const HomeCarousel: React.FC<IHomeCarouselProps> = ({ data }) => {
  return (
    <Carousel
      navButtonsAlwaysInvisible
      indicatorContainerProps={{
        className: styles.indicatorIconContainer,
      }}
      IndicatorIcon={<div className={styles.indicatorIcon} />}
      activeIndicatorIconButtonProps={{
        className: styles.activeIndicatorIcon,
      }}
      indicators={(data?.length || 0) > 1}
      className={styles.carousel}
      autoPlay={false}
      animation={'slide'}
    >
      {data?.slice(0, 6)?.map((carouselItem: any, i: number) => (
        <HeroBannerItem key={i} carouselItem={carouselItem} />
      ))}
    </Carousel>
  );
};

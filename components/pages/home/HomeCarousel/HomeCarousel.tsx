import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './HomeCarousel.module.scss';
import { useTranslation } from 'react-i18next';

interface IHomeCarouselProps {
  carouselDetails: {
    slides: {
      titleH1: string;
      titleH3: string;
    }[];
  };
}
interface IHomeCarouselItemProps {
  carouselItem: { titleH1: string; titleH3: string; imgURL: string };
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ carouselItem }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <StableImage className={styles.bannerImage} src={`${ASSETS_URL}/${carouselItem?.imgURL}`} />

      <div className={styles.pageTitle}>
        {carouselItem?.titleH1 && (
          <h1 className={styles.titleh1}>{t(`${carouselItem?.titleH1}`)}</h1>
        )}
        {carouselItem?.titleH3 && (
          <h3 className={styles.titleh3}>{t(`${carouselItem?.titleH3}`)}</h3>
        )}
      </div>
    </>
  );
};

export const HomeCarousel: React.FC<IHomeCarouselProps> = ({ carouselDetails }) => {
  return (
    <Carousel
      navButtonsAlwaysInvisible
      indicatorContainerProps={{
        className: styles.indicatorIconContainer,
      }}
      indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
      activeIndicatorIconButtonProps={{
        className: styles.activeIndicatorIcon,
      }}
      IndicatorIcon={<div className={styles.indicatorIcon} />}
      indicators={(carouselDetails?.slides?.length || 0) > 1}
      className={styles.carousel}
    >
      {carouselDetails?.slides?.map((carouselItem: any, i) => (
        <HeroBannerItem key={i} carouselItem={carouselItem} />
      ))}
    </Carousel>
  );
};

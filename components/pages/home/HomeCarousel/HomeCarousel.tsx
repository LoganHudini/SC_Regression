/* eslint-disable @next/next/no-img-element */
import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './HomeCarousel.module.scss';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'utils/getConfiguration';
import { BANNER_CAROUSEL, HOME } from 'utils/constants';

interface IHomeCarouselProps {
  details: any;
}

interface IHomeCarouselItemProps {
  carouselItem: { title: string; description: string; imgURL: string };
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ carouselItem }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className={styles.imgGradient}>
        <StableImage className={styles.bannerImage} src={`${ASSETS_URL}/${carouselItem?.imgURL}`} />
      </div>

      <div className={styles.pageTitle}>
        {carouselItem?.title && <h1 className={styles.title}>{t(`${carouselItem?.title}`)}</h1>}
        {carouselItem?.description && (
          <p className={styles.description}>{t(`${carouselItem?.description}`)}</p>
        )}
      </div>
    </>
  );
};

export const HomeCarousel: React.FC<IHomeCarouselProps> = ({ details }) => {
  const config = getConfig();

  const hotelImages = details?.getPropertyDetailsByHotelId?.hotel?.images;
  const homeModule: any = config?.modules?.find((module) => module?.code === HOME);
  const carouselDetails = homeModule?.submodules?.find(
    (submodule: any) => submodule?.code === BANNER_CAROUSEL && submodule.isActive,
  );

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
      indicators={(carouselDetails?.details?.length || 0) > 1}
      className={styles.carousel}
      animation={'slide'}
      duration={1000}
      interval={5000}
    >
      {carouselDetails?.details &&
        hotelImages &&
        carouselDetails?.details
          ?.map((item: any, index: number) => ({
            ...item,
            imgURL: hotelImages[index]?.master,
          }))
          ?.map((carouselItem: any, i: number) => (
            <HeroBannerItem key={i} carouselItem={carouselItem} />
          ))}
    </Carousel>
  );
};

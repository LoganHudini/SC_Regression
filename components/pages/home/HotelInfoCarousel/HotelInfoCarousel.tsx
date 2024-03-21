/* eslint-disable @next/next/no-img-element */
import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './HotelInfoCarousel.module.scss';
import { useTranslation } from 'react-i18next';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { hotelInformation, toggleHotelInfoDrawer, toggleMapState } from 'storage/home.storage';

interface IHomeCarouselProps {
  data: any;
}

interface IHomeCarouselItemProps {
  title: string;
  description: string;
  image: { master: string };
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ title, description, image }) => {
  const { t } = useTranslation('common');
  return (
    <div
      onClick={() => {
        toggleHotelInfoDrawer(true);
        toggleMapState(true);
      }}
    >
      <div className={styles.imgGradient}>
        <StableImage className={styles.bannerImage} src={`${ASSETS_URL}/${image?.master}`} />
      </div>
      <div className={styles.pageTitle}>
        {title && <h1 className={styles.title}>{t(`${title}`)}</h1>}
        {description && <p className={styles.description}>{t(`${description}`)}</p>}
        <CustomReadMore text={t('READ MORE') as string} className={styles.readMore} />
      </div>
    </div>
  );
};

export const HotelInfoCarousel: React.FC<IHomeCarouselProps> = ({ data }) => {
  hotelInformation(data);
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
      indicators={(data?.images?.length || 0) > 1}
      className={styles.carousel}
      autoPlay={false}
      animation={'slide'}
    >
      {data?.images?.length > 0 &&
        data?.images
          ?.slice(0, 6)
          ?.map((image: any, i: number) => (
            <HeroBannerItem
              key={i}
              title={data?.name}
              description={data?.description}
              image={image}
            />
          ))}
    </Carousel>
  );
};

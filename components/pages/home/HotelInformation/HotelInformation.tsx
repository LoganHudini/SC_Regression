import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import styles from './HotelInformation.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-material-ui-carousel';
import { toggleDetailsDrawer } from 'storage/home.storage';

const HotelInformation = (props: any) => {
  const { details } = props;
  const { t } = useTranslation(['common']);
  const hotelInfo = details && details?.getPropertyDetailsByHotelId?.hotel;

  return (
    <div className={styles.carouselSlideWrapper}>
      <div className={styles.welcome}>{t('Welcome to')}</div>
      <div className={styles.name}>{hotelInfo?.name}</div>
      <div onClick={() => toggleDetailsDrawer(true)}>
        <Carousel
          navButtonsAlwaysInvisible
          indicatorContainerProps={{ className: styles.indicatorIconContainer }}
          indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
          activeIndicatorIconButtonProps={{
            className: styles.activeIndicatorIcon,
          }}
          IndicatorIcon={<div className={styles.indicatorIcon} />}
          indicators={(hotelInfo?.images?.length || 0) > 1}
        >
          {hotelInfo?.images?.map((image: any, i: any) => (
            <StableImage
              className={styles.bannerImage}
              key={i}
              src={`${ASSETS_URL}/${image?.master}`}
            />
          ))}
        </Carousel>
        <div className={styles.description}>{hotelInfo?.description}</div>
        <div className={styles.read}>{t('READ MORE')}</div>
      </div>
    </div>
  );
};

export default HotelInformation;

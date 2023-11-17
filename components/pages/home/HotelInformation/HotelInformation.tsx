import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import styles from './HotelInformation.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-material-ui-carousel';
import { hotelImage, toggleHotelInfoDrawer, toggleMapState } from 'storage/home.storage';
import { CarouselLoader } from 'components/shared/Loaders/Loaders';

const HotelInformation = (props: any) => {
  const { details, loading } = props;
  const { t } = useTranslation(['common']);
  const hotelInfo = details && details?.getPropertyDetailsByHotelId?.hotel;
  hotelImage(hotelInfo?.images[0]);

  return (
    <>
      {loading ? (
        <CarouselLoader />
      ) : (
        details && (
          <div
            className={styles.carouselSlideWrapper}
            onClick={() => {
              toggleHotelInfoDrawer(true);
              toggleMapState(true);
            }}
          >
            <p className={styles.welcome}>{t('Welcome to')}</p>
            <p className={styles.name}>{hotelInfo?.name}</p>
            <div>
              <Carousel
                navButtonsAlwaysInvisible
                indicatorContainerProps={{
                  className: styles.indicatorIconContainer,
                }}
                IndicatorIcon={<div className={styles.indicatorIcon} />}
                activeIndicatorIconButtonProps={{
                  className: styles.activeIndicatorIcon,
                }}
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
              <p className={styles.description}>{hotelInfo?.description}</p>
              <p className={styles.read}>{t('READ MORE')}</p>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default HotelInformation;

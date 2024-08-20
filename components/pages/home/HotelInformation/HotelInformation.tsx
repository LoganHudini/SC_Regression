import React from 'react';
import styles from './HotelInformation.module.scss';
import { BRAND_CODE } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import { hotelInformation, toggleHotelInfoDrawer, toggleMapState } from 'storage/home.storage';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';

const HotelInformation = (props: any) => {
  const { details } = props;
  const { t } = useTranslation(['common']);
  const hotelInfo = details && details?.getPropertyDetailsByHotelId?.hotel;
  hotelInformation(hotelInfo);

  return (
    <>
      {hotelInfo && (
        <div
          className={styles.carouselSlideWrapper}
          onClick={() => {
            toggleHotelInfoDrawer(true);
            toggleMapState(true);
          }}
        >
          <p className={styles.welcome}>{t('Welcome to')}</p>
          <p className={styles.name}>{hotelInfo?.name}</p>
          {hotelInfo?.images?.length > 0 && (
            <div>
              <div className={styles.margin}>
                <CustomCarousel imageData={hotelInfo} />
              </div>
              <p className={styles.description}>{hotelInfo?.description}</p>
              <CustomReadMore
                text={t(BRAND_CODE === 'fairmont' ? 'Discover' : 'View More') as string}
                className={styles.readMore}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HotelInformation;

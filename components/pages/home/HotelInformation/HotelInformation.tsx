import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import styles from './HotelInformation.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import { hotelImage, toggleHotelInfoDrawer, toggleMapState } from 'storage/home.storage';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { CAROUSEL_RESPONSIVE } from 'utils/constants';
import cx from 'classnames';

const HotelInformation = (props: any) => {
  const { details } = props;
  const { t } = useTranslation(['common']);
  const hotelInfo = details && details?.getPropertyDetailsByHotelId?.hotel;
  hotelImage(hotelInfo?.images[0]);

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
          <div>
            <WithScrollbar
              responsive={CAROUSEL_RESPONSIVE}
              className={cx(styles.carouselWrapper, {
                [styles.carouselWrapperSingleImage]: hotelInfo?.images?.length === 1,
              })}
            >
              {hotelInfo?.images?.map((image: any, i: any) => (
                <StableImage
                  className={styles.bannerImage}
                  key={i}
                  src={`${ASSETS_URL}/${image?.master}`}
                />
              ))}
            </WithScrollbar>
            <p className={styles.description}>{hotelInfo?.description}</p>
            <CustomReadMore text={'READ MORE'} />
          </div>
        </div>
      )}
    </>
  );
};

export default HotelInformation;

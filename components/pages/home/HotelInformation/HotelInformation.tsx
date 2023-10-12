import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import styles from './HotelInformation.module.scss';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-material-ui-carousel';
import { toggleHotelInfoDrawer, toggleMapState } from 'storage/home.storage';
import { buttonArrow } from 'utils/functions';
import ArrowButton from '@icons/readMoreArrow.svg';
import { CarouselLoader } from 'components/shared/Loaders/Loaders';

const HotelInformation = (props: any) => {
  const { details, loading } = props;
  const { t } = useTranslation(['common']);
  const buttonArrowState = buttonArrow;
  const hotelInfo = details && details?.getPropertyDetailsByHotelId?.hotel;

  return (
    <>
      {loading ? (
        <CarouselLoader />
      ) : (
        <div className={styles.carouselSlideWrapper}>
          <p className={styles.welcome}>{t('Welcome to')}</p>
          <p className={styles.name}>{hotelInfo?.name}</p>
          <div
            onClick={() => {
              toggleHotelInfoDrawer(true);
              toggleMapState(true);
            }}
          >
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
            <p className={styles.read}>
              {t('READ MORE')} {buttonArrowState && <ArrowButton />}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelInformation;

import { StableImage } from 'components/shared/StableImage/StableImage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL, BRAND_CODE } from '../../../../core/graphql/endpoints';
import styles from './OffersCarousel.module.scss';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import ClockIcon from '@icons/clockIcon.svg';
import { getTimings } from 'utils/functions';
import { offerInformationStorage } from 'storage/offers-carousel.storage';
import { OfferDetails } from '../OffersDetail/OffersDetail';

interface ICarouselProps {
  data: any;
  loading?: boolean;
}

interface ICarouselSlideProps {
  slide: any;
  slideStyle?: any;
  handleDrawer?: any;
}

export const CarouselSlide: React.FC<ICarouselSlideProps> = ({
  slide,
  slideStyle,
  handleDrawer,
}) => {
  const { t } = useTranslation(['common']);

  const handleOfferInfo = () => {
    offerInformationStorage({
      selectedOfferInfoName: slide?.name,
      selectedOfferInfoId: slide?.id,
    });
    handleDrawer && handleDrawer(true);
  };

  const time = getTimings(slide?.customAttributes);

  return (
    <>
      <div
        className={cx(styles.carouselSlideWrapperOffer, 'globals-carouselSlideWrapperSpa', {
          [styles.carouselWrapperSingleImage]: slideStyle,
        })}
        onClick={handleOfferInfo}
      >
        <StableImage
          className={cx(styles.carouselSlideImage, 'globals-carouselSlideImage')}
          src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
        />
        <div
          className={cx(
            styles.carouselSlideDetailsWrapper,
            { [styles.carouselSlideDetailsWrapperIrd]: module },
            'globals-carouselSlideDetailsWrapperRestaurantsAndBars',
          )}
        >
          {slide?.name && <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>}
          {time && (
            <div className={cx(styles.cuisineRowTime, 'globals-spaTimings')}>
              <ClockIcon className={styles.cuisineIcon} />
              <p>{time?.value}</p>
            </div>
          )}
          <CustomReadMore
            text={t(BRAND_CODE === 'fairmont' ? 'Discover' : 'View More') as string}
          />
        </div>
      </div>
      <OfferDetails carouselItem={slide} onCtaClick={handleOfferInfo} />
    </>
  );
};

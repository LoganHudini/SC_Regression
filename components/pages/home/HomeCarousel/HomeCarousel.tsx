import { StableImage } from 'components/shared/StableImage/StableImage';
import React, { useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL, BRAND_CODE } from '../../../../core/graphql/endpoints';
import styles from './HomeCarousel.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { EXTERNAL_URL_CAPS, FLOW, OFFERS } from 'utils/constants';
import { flowPathMap } from 'utils/flowPathMap';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { OfferDetails } from '../OffersDetail/OffersDetail';

interface IHomeCarouselProps {
  data: any;
}

interface IHomeCarouselItemProps {
  carouselItem: any;
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ carouselItem }) => {
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();
  const [offerBooking, setOfferBooking] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSelect = () => {
    setOpenDrawer(true);
  };

  const onCtaClick = () => {
    if (carouselItem?.CTA?.redirectTo === EXTERNAL_URL_CAPS) {
      setOfferBooking(true);
    }
    if (carouselItem?.CTA?.redirectTo === FLOW) {
      const redirectUrl = flowPathMap[carouselItem?.CTA?.redirectData as keyof typeof flowPathMap];
      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
    setOpenDrawer(false);
  };

  return (
    <>
      <div className={styles.imgGradient} onClick={() => handleSelect()}>
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${carouselItem?.images[0]?.master}`}
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>

      <div className={styles.pageTitle} onClick={handleSelect}>
        {carouselItem?.name && <h1 className={styles.title}>{t(`${carouselItem?.name}`)}</h1>}
        {carouselItem?.description && (
          <p className={styles.description}>{t(`${carouselItem?.description}`)}</p>
        )}
        <CustomReadMore
          text={t(BRAND_CODE === 'fairmont' ? 'Discover' : 'View More') as string}
          className={styles.readMore}
        />
      </div>

      {offerBooking ? (
        <CustomDrawer
          open={offerBooking}
          onClose={() => setOfferBooking(false)}
          content={
            <IframeComponent
              src={carouselItem?.CTA?.URL}
              handledrawerState={setOfferBooking}
              name={OFFERS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          content={<OfferDetails carouselItem={carouselItem} onCtaClick={onCtaClick} />}
        />
      )}
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

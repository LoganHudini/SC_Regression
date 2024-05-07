/* eslint-disable @next/next/no-img-element */
import { StableImage } from 'components/shared/StableImage/StableImage';
import React, { useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './HomeCarousel.module.scss';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import cx from 'classnames';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import dayjs from 'dayjs';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { OFFERS, EXTERNAL_URL_CAPS, FLOW, ACTIVE } from 'utils/constants';
import { flowPathMap } from 'utils/flowPathMap';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';

interface IHomeCarouselProps {
  data: any;
}

interface IHomeCarouselItemProps {
  carouselItem: any;
}

const HeroBannerItem: React.FC<IHomeCarouselItemProps> = ({ carouselItem }) => {
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();
  const [offerBooking, setofferBooking] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleSelect = () => {
    offerDetails();
    setOpenDrawer(true);
  };
  const startDate = dayjs(carouselItem?.duration?.startDate, 'DD-MM-YYYY');
  const endDate = dayjs(carouselItem?.duration?.endDate, 'DD-MM-YYYY');

  const displayStartDate =
    startDate?.year() === endDate?.year()
      ? startDate.format('MMMM D')
      : startDate.format('MMMM D, YYYY');

  const displayEndDate = endDate.format('MMMM D, YYYY');
  const timeDisplayed =
    carouselItem &&
    !carouselItem?.duration?.alwaysActive &&
    `${displayStartDate} until ${displayEndDate}`;

  const onCtaClick = () => {
    if (carouselItem?.CTA?.redirectTo === EXTERNAL_URL_CAPS) {
      setofferBooking(true);
    }
    if (carouselItem?.CTA?.redirectTo === FLOW) {
      const redirectUrl = flowPathMap[carouselItem?.CTA?.redirectData as keyof typeof flowPathMap];

      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
    setOpenDrawer(false);
  };

  const offerDetails = () => (
    <div
      className={cx(styles.listComponent, {
        [styles.listComponentMargin]: carouselItem?.CTA?.status === ACTIVE,
      })}
    >
      <div className={styles.imageWrapper}>
        {carouselItem?.images?.length > 0 && <CustomCarousel imageData={carouselItem} />}
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.listComponentData}>
          {carouselItem?.name && (
            <h2 className={styles.listComponentTitle}>{t(`${carouselItem?.name}`)}</h2>
          )}
        </div>
        <div className={styles.gapList}>
          {carouselItem?.description && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Offer Includes')}</p>
              <p className={styles.listComponentDataText}>{t(`${carouselItem?.description}`)}</p>
            </>
          )}
          {carouselItem?.duration && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Availability')}</p>
              <p className={styles.listComponentDataText}>
                {carouselItem?.duration?.alwaysActive ? t('Everyday') : timeDisplayed}
              </p>
            </>
          )}
        </div>
      </div>
      {carouselItem?.CTA?.status === ACTIVE && (
        <StyledButton
          variant='contained'
          onClick={onCtaClick}
          className={cx(styles.button, {
            [styles.withoutImageButton]: carouselItem && !carouselItem?.images[0]?.ratio16to9,
          })}
        >
          {carouselItem?.CTA?.displayCTATitle || t('BOOK NOW')}
        </StyledButton>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.imgGradient} onClick={() => handleSelect()}>
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${carouselItem?.images[0]?.master}`}
        />
      </div>

      <div className={styles.pageTitle} onClick={() => handleSelect()}>
        {carouselItem?.name && <h1 className={styles.title}>{t(`${carouselItem?.name}`)}</h1>}
        {carouselItem?.description && (
          <p className={styles.description}>{t(`${carouselItem?.description}`)}</p>
        )}
        <CustomReadMore text={t('READ MORE') as string} className={styles.readMore} />
      </div>
      {offerBooking ? (
        <CustomDrawer
          open={offerBooking}
          onClose={() => setofferBooking(false)}
          content={
            <IframeComponent
              src={carouselItem?.CTA?.URL}
              handledrawerState={setofferBooking}
              name={OFFERS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          content={offerDetails()}
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

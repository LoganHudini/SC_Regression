import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL, BRAND_CODE } from '../../../../core/graphql/endpoints';
import styles from './OffersCarousel.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { useReactiveVar } from '@apollo/client';
import ClockIcon from '@icons/clockIcon.svg';
import { ACTIVE, EXTERNAL_URL_CAPS, FLOW, OFFERS } from 'utils/constants';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import { getTimings } from 'utils/functions';
import { offerInformationStorage } from 'storage/offers-carousel.storage';
import { flowPathMap } from 'utils/flowPathMap';
import dayjs from 'dayjs';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';

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
    </>
  );
};

export const OffersCarousel: React.FC<ICarouselProps> = ({ data, loading }) => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation(['common']);
  const [offerBooking, setOfferBooking] = useState(false);
  const [drawerState, setDrawerState] = useState(false);

  const offersInfo = useReactiveVar(offerInformationStorage);

  const offerInfoDetails = data?.find((info: any) => info?.id === offersInfo?.selectedOfferInfoId);
  const closeDrawer = () => {
    setDrawerState(false);
  };
  const closeOfferBooking = () => {
    setOfferBooking(false);
  };

  const onCtaClick = useCallback(() => {
    handleCtaClick(offerInfoDetails, setOfferBooking, navigate, closeDrawer);
  }, [navigate, offerInfoDetails]);

  return (
    <>
      {data?.length > 0 && (
        <div className={styles.offerCarouselWrapper}>
          <p className={styles.offerTitle}>{t(OFFERS)}</p>
          <WithScrollbar
            className={cx(styles.carouselWrapper, {
              [styles.carouselWrapperSingleImageUl]: data?.length === 1,
            })}
          >
            {data?.map((slide: any) => (
              <CarouselSlide
                key={slide?.name}
                slide={slide}
                handleDrawer={setDrawerState}
                slideStyle={data?.length === 1}
              />
            ))}
          </WithScrollbar>
        </div>
      )}
      {!loading &&
        (offerBooking ? (
          <CustomDrawer
            open={offerBooking}
            onClose={closeOfferBooking}
            content={
              <IframeComponent
                src={offerInfoDetails?.CTA?.URL}
                handledrawerState={setOfferBooking}
                name={OFFERS}
              />
            }
            isIframe={true}
          />
        ) : (
          <CustomDrawer
            open={drawerState}
            onClose={closeDrawer}
            content={offerDetails(offerInfoDetails, timeDisplayed, onCtaClick, t)}
          />
        ))}
    </>
  );
};

export const offerDetails = (
  offerInfoDetails: any,
  timeDisplayed: any,
  onCtaClick: any,
  t: any,
) => (
  <div
    className={cx(styles.listComponent, {
      [styles.listComponentMargin]: offerInfoDetails?.CTA?.status === ACTIVE,
    })}
  >
    <div className={styles.imageWrapper}>
      {offerInfoDetails?.images?.length > 0 && <CustomCarousel imageData={offerInfoDetails} />}
    </div>
    <div className={styles.contentWrapper}>
      <div className={styles.listComponentData}>
        {offerInfoDetails?.name && (
          <h2 className={cx(styles.listComponentTitle)}>{t(`${offerInfoDetails?.name}`)}</h2>
        )}
      </div>
      <div className={styles.gapList}>
        {offerInfoDetails?.description && (
          <>
            <p className={styles.listComponentDataTitle}>{t('Offer Includes')}</p>
            <p className={styles.listComponentDataText}>{t(`${offerInfoDetails?.description}`)}</p>
          </>
        )}
        {offerInfoDetails?.duration && (
          <>
            <p className={styles.listComponentDataTitle}>{t('Availability')}</p>
            <p className={styles.listComponentDataText}>
              {/* {time()} */}
              {offerInfoDetails?.duration.alwaysActive
                ? t('Everyday')
                : timeDisplayed(offerInfoDetails, t)}
            </p>
          </>
        )}
        {(offerInfoDetails?.contact?.phoneNumber || offerInfoDetails?.contact?.email) && (
          <PhoneEmail
            phone={offerInfoDetails?.contact?.phoneNumber as string}
            email={offerInfoDetails?.contact?.email as string}
          />
        )}
        {offerInfoDetails?.CTA?.status === ACTIVE && (
          <div style={{ position: 'fixed' }}>
            <StyledButton
              variant='contained'
              onClick={onCtaClick}
              className={cx(styles.button, 'globals-actionCtaWrapper', {
                [styles.withoutImageButton]:
                  offerInfoDetails && !offerInfoDetails?.images[0]?.ratio16to9,
              })}
            >
              {offerInfoDetails?.CTA?.displayCTATitle || t('BOOK NOW')}
            </StyledButton>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const handleCtaClick = (
  offerInfoDetails: any,
  setOfferBooking: any,
  navigate: any,
  closeDrawer: any,
) => {
  if (offerInfoDetails?.CTA?.redirectTo === EXTERNAL_URL_CAPS) {
    setOfferBooking(true);
  }
  if (offerInfoDetails?.CTA?.redirectTo === FLOW) {
    const redirectUrl =
      flowPathMap[offerInfoDetails?.CTA?.redirectData as keyof typeof flowPathMap];

    if (redirectUrl) {
      navigate(redirectUrl);
    }
  }
  closeDrawer();
};

export const timeDisplayed = (offerInfoDetails: any, t: any) => {
  const startDate = dayjs(offerInfoDetails?.duration?.startDate, 'DD-MM-YYYY');
  const endDate = dayjs(offerInfoDetails?.duration?.endDate, 'DD-MM-YYYY');

  const displayStartDate =
    startDate?.year() === endDate?.year()
      ? startDate.format('MMMM D')
      : startDate.format('MMMM D, YYYY');

  const displayEndDate = endDate.format('MMMM D, YYYY');

  return (
    offerInfoDetails &&
    !offerInfoDetails?.duration.alwaysActive &&
    `${displayStartDate} ${t('until')} ${displayEndDate}`
  );
};

import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL, BRAND_CODE } from '../../../../core/graphql/endpoints';
import styles from './SpaCarousel.module.scss';
import { activeItems, getFormattedTime, getTimings } from 'utils/functions';
import { spaInformationStorage } from 'storage/spa.storage';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { hotelInfoStorage, toggleDetailsDrawer } from 'storage/home.storage';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { SPA_AND_WELLNESS, ALL_DAY, SPA } from 'utils/constants';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';
import useTimeStatus from 'utils/hooks/useTimeStatus';
import SpaDetails from 'components/pages/spa/SpaDetail';

interface ICarouselProps {
  data: any;
  loading?: boolean;
}
interface ICarouselSlideProps {
  slide: any;
  slideStyle?: any;
}

export const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, slideStyle }) => {
  const { t } = useTranslation(['common']);
  const hotelInformation = useReactiveVar(hotelInfoStorage);

  const handleSpaInfo = () => {
    spaInformationStorage({
      selectedSpaInfoName: slide?.name,
      selectedSpaInfoId: slide?.id,
    });
    toggleDetailsDrawer(true);
  };

  const time = getTimings(slide?.customAttributes);

  const getSpaStatus = useTimeStatus({
    module: SPA,
    slide: slide,
    hotelInformation: hotelInformation,
    t,
  });

  const isOpen = getFormattedTime(slide?.hours?.timings?.map((time: any) => time?.from));
  const isClose = getFormattedTime(slide?.hours?.timings?.map((time: any) => time?.to));

  return (
    <>
      <div
        className={cx(styles.carouselSlideWrapperSpa, 'globals-carouselSlideWrapperSpa', {
          [styles.carouselWrapperSingleImage]: slideStyle,
        })}
        onClick={handleSpaInfo}
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
            'globals-cardWrapperRestaurantsAndBars',
          )}
        >
          {slide?.name && <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>}
          {isOpen?.includes(ALL_DAY) && isClose?.includes(ALL_DAY) ? (
            <div className={styles.carouselSpaTimeStatus}>
              <p>{t('Open')}</p>
            </div>
          ) : (
            <div className={styles.carouselSpaTimeStatus}>
              <p>{getSpaStatus?.status}</p>
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

export const SpaCarousel: React.FC<ICarouselProps> = ({ data }) => {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const [spaBooking, setspaBooking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [menuLink, setmenuLink] = useState(null);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    spaInformationStorage({});
  };

  const closespaBooking = () => {
    setspaBooking(false);
  };

  const closeMenu = () => {
    setMenu(false);
  };

  const spaInfoList = activeItems(data?.getSpaDetails?.spa);
  const spaInfo = useReactiveVar(spaInformationStorage);

  const spaInfoDetails = activeItems(data?.getSpaDetails?.spa)?.find(
    (info: any) => info?.id === spaInfo?.selectedSpaInfoId,
  );

  const spaTreatments =
    data?.getSpaDetails?.treatments?.length > 0 &&
    activeItems(data?.getSpaDetails?.treatments)?.filter(
      (item: any) => item?.spaId === spaInfoDetails?.id,
    );

  const time = getTimings(spaInfoDetails?.customAttributes);

  return (
    <>
      {spaInfoList?.length > 0 && (
        <div className={styles.spaCarouselWrapper}>
          <p className={styles.spaTitle}>{t('Wellness')}</p>
          <WithScrollbar
            className={cx(styles.carouselWrapper, {
              [styles.carouselWrapperSingleImageUl]: spaInfoList?.length === 1,
            })}
          >
            {spaInfoList?.map((slide: any) => (
              <CarouselSlide
                key={slide?.name}
                slide={slide}
                slideStyle={spaInfoList?.length === 1}
              />
            ))}
          </WithScrollbar>
        </div>
      )}
      {spaBooking || menu ? (
        <CustomDrawer
          open={spaBooking ? spaBooking : menu}
          onClose={spaBooking ? closespaBooking : closeMenu}
          content={
            <IframeComponent
              src={spaBooking ? spaInfoDetails?.cta?.redirectUrl : menuLink}
              handledrawerState={spaBooking ? setspaBooking : setMenu}
              name={SPA_AND_WELLNESS}
            />
          }
          isIframe={true}
        />
      ) : (
        <CustomDrawer
          open={spaDetailsDrawerStatus}
          onClose={closeDrawer}
          content={
            <SpaDetails
              spaInfoDetails={spaInfoDetails}
              spaTreatments={spaTreatments}
              setspaBooking={setspaBooking}
              setMenu={setMenu}
              setmenuLink={setmenuLink}
              time={time}
            />
          }
        />
      )}
    </>
  );
};

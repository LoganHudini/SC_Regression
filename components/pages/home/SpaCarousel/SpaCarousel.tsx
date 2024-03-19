import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './SpaCarousel.module.scss';
import { activeItems, convertTo12HourFormat, getTimings } from 'utils/functions';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { spaInformationStorage } from 'storage/spa.storage';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { toggleDetailsDrawer } from 'storage/home.storage';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import produce from 'immer';
import ClockIcon from '@icons/clockIcon.svg';
import LocationIcon from '@icons/location.svg';
import { ACTIVE, EXTERNAL_URL, SPA_AND_WELLNESS } from 'utils/constants';
import Phone from '@icons/telephone.svg';
import Mail from '@icons/email.svg';
import { PlaceholderImage } from 'components/shared/PlaceholderImage/PlaceholderImage';
import { IframeComponent } from 'components/shared/IframeComponent/IframeComponent';

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
  const handleClick = () => {
    spaInformationStorage({
      selectedSpaInfoName: slide?.name,
      selectedSpaInfoId: slide?.id,
    });
    toggleDetailsDrawer(true);
  };

  const time = getTimings(slide?.customAttributes);

  return (
    <>
      <div
        className={cx(styles.carouselSlideWrapperSpa, 'globals-carouselSlideWrapperSpa', {
          [styles.carouselWrapperSingleImage]: slideStyle,
        })}
        onClick={handleClick}
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
          <CustomReadMore text={t('VIEW MORE') as string} />
        </div>
      </div>
    </>
  );
};

export const SpaCarousel: React.FC<ICarouselProps> = ({ data }) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
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

  const spaTreatments = activeItems(data?.getSpaDetails?.treatments)?.filter(
    (item: any) => item?.spaId === spaInfoDetails?.id,
  );

  const onCtaClick = () => {
    toggleDetailsDrawer(false);
    if (spaTreatments?.length > 0) {
      navigate(availablePaths?.SPA);
    } else if (spaInfoDetails?.cta?.redirectOption === EXTERNAL_URL) {
      setspaBooking(true);
    }
  };

  const onViewMenu = () => {
    setMenu(true);
    let link = null;
    const menuType = spaInfoDetails?.treatmentsMenu?.split('type=')[1].split('}')[0].split(',')[0];
    if (menuType === 'WEB_URL') {
      link = spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0];
    }

    if (menuType === 'S3') {
      link = `${ASSETS_URL}/${spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0]}`;
    }
    setmenuLink(link);
  };

  const time = getTimings(spaInfoDetails?.customAttributes);

  const spaDetails = () => (
    <>
      {spaInfoDetails?.images?.length > 0 ? (
        <StableImage
          className={styles.image}
          src={`${ASSETS_URL}/${spaInfoDetails?.images[0]?.ratio16to9}`}
        />
      ) : (
        <PlaceholderImage />
      )}

      {(spaTreatments?.length > 0 || spaInfoDetails?.cta?.status === ACTIVE) && (
        <StyledButton
          variant='contained'
          onClick={onCtaClick}
          className={cx(
            styles.button,
            {
              [styles.withoutImageButton]: spaInfoDetails && !spaInfoDetails?.images[0]?.ratio16to9,
            },
            'globals-actionCtaWrapper',
          )}
        >
          {spaTreatments?.length > 0
            ? t('View Treatments')
            : spaInfoDetails?.cta?.status === ACTIVE &&
              (spaInfoDetails?.cta?.ctaTitle || t('BOOK NOW'))}
        </StyledButton>
      )}

      <div className={styles.wrapper}>
        {spaInfoDetails?.name && (
          <h2 className={styles.detailComponentTitle}>{t(`${spaInfoDetails?.name}`)}</h2>
        )}
        {spaInfoDetails?.location.addressLine1 && (
          <div className={styles.location}>
            <LocationIcon className={styles.locationicon} />
            <p>{spaInfoDetails?.location.addressLine1}</p>
          </div>
        )}
        {time?.value && (
          <div className={styles.DetailscuisineRowTime}>
            <ClockIcon className={styles.cuisineIcon} />
            <p>{time?.value}</p>
          </div>
        )}
        {spaInfoDetails?.treatmentsMenu !== '{}' &&
          spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0] && (
            <StyledButton variant='outlined' onClick={onViewMenu} className={styles.buttonView}>
              {t('VIEW MENU')}
            </StyledButton>
          )}

        {spaInfoDetails?.description && (
          <p className={styles.detailComponentDescription}>{t(`${spaInfoDetails?.description}`)}</p>
        )}

        <div className={styles.informationWrapper}>
          {spaInfoDetails?.contact?.phone && (
            <a
              aria-label={`${t('Phone')}`}
              href={`tel:${spaInfoDetails?.contact?.phone}`}
              target='_blank'
              rel='noreferrer'
              className={styles.infoText}
            >
              <Phone className={styles.telephoneIcon} />
              <span className={styles.text}>{t('Call')}</span>
            </a>
          )}
          {spaInfoDetails?.contact?.email && (
            <a
              href={`mailto:${spaInfoDetails?.contact?.email}`}
              aria-label={`${t('Email')}`}
              target='_blank'
              rel='noreferrer'
              className={styles.infoText}
            >
              <Mail className={styles.mailIcon} />
              <span className={styles.text}>{t('Email')}</span>
            </a>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {spaInfoList?.length > 0 && (
        <div className={styles.spaCarouselWrapper}>
          <p className={styles.spaTitle}>{t('Spa & Wellness')}</p>
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
        <CustomDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={spaDetails()} />
      )}
    </>
  );
};

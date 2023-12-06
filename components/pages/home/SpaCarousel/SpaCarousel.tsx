import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React from 'react';
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
import { ACTIVE, EXTERNAL_URL } from 'utils/constants';
import Phone from '@icons/telephone.svg';
import Mail from '@icons/email.svg';
import { downloadFile } from 'utils/downloadFile';

interface ICarouselProps {
  data: any;
  loading?: boolean;
}
interface ICarouselSlideProps {
  slide: any;
  slideStyle?: any;
}

export const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, slideStyle }) => {
  const handleClick = () => {
    spaInformationStorage({
      selectedSpaInfoName: slide?.name,
      selectedSpaInfoId: slide?.id,
    });
    toggleDetailsDrawer(true);
  };

  const time = getTimings(slide?.customAttributes);

  return (
    <div className={styles.carouselSlideWrapper} onClick={handleClick}>
      <StableImage
        className={cx(styles.carouselSlideImage, {
          [styles.carouselWrapperSingleImage]: slideStyle,
        })}
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div
        className={cx(styles.carouselSlideDetailsWrapper, {
          [styles.detailPosition]: slideStyle,
        })}
      >
        {slide?.name && <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>}
        {time?.value && (
          <div className={styles.timings}>
            <ClockIcon />
            <p>{time?.value}</p>
          </div>
        )}
        <CustomReadMore text={'VIEW TREATMENTS'} />
      </div>
    </div>
  );
};

export const SpaCarousel: React.FC<ICarouselProps> = ({ data }) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
  const router = useRouter();
  const spaDetailsDrawerStatus = useReactiveVar(toggleDetailsDrawer);

  const closeDrawer = () => {
    toggleDetailsDrawer(false);
    spaInformationStorage(
      produce(spaInformationStorage(), (draft) => {
        null;
      }),
    );
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
      router.push(spaInfoDetails?.cta?.redirectUrl);
    }
  };

  const onViewMenu = () => {
    const menuType = spaInfoDetails?.treatmentsMenu?.split('type=')[1].split('}')[0].split(',')[0];

    if (menuType === 'WEB_URL') {
      router.push(spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0]);
    }

    if (menuType === 'S3') {
      downloadFile(
        `${ASSETS_URL}/${spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0]}`,
        'treatmentsMenu.pdf',
      );
    }
  };

  const time = getTimings(spaInfoDetails?.customAttributes);

  const spaDetails = () => (
    <>
      {spaInfoDetails?.images[0]?.ratio16to9 && (
        <StableImage
          className={styles.image}
          src={`${ASSETS_URL}/${spaInfoDetails?.images[0]?.ratio16to9}`}
        />
      )}
      {(spaTreatments?.length > 0 || spaInfoDetails?.cta?.status === ACTIVE) && (
        <StyledButton
          variant='contained'
          onClick={onCtaClick}
          className={cx(styles.button, {
            [styles.withoutImageButton]: spaInfoDetails && !spaInfoDetails?.images[0]?.ratio16to9,
          })}
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
          <div className={styles.cuisineRowTime}>
            <ClockIcon className={styles.cuisineIcon} />
            <p>{time?.value}</p>
          </div>
        )}
        {spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0] && (
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
          <p className={styles.spaTitle}>{t('Spa')}</p>
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

      <CustomDrawer open={spaDetailsDrawerStatus} onClose={closeDrawer} content={spaDetails()} />
    </>
  );
};

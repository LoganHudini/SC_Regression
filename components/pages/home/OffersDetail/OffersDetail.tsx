import React from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import dayjs from 'dayjs';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { ACTIVE } from 'utils/constants';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import styles from './OfferDetail.module.scss';

interface IOfferDetailsProps {
  carouselItem: any;
  onCtaClick: () => void;
}

export const OfferDetails: React.FC<IOfferDetailsProps> = ({ carouselItem, onCtaClick }) => {
  const { t } = useTranslation('common');
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

  return (
    <div className={cx(styles.listComponent, styles.listComponentMargin)}>
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
          {carouselItem?.highLights && (
            <>
              <p className={styles.listComponentDataText}>{t(`${carouselItem?.highLights}`)}</p>
            </>
          )}

          {carouselItem?.duration && (
            <>
              <p className={styles.listComponentDataTitle}>{t('Availability')}</p>
              <p className={styles.listComponentDataText}>
                {carouselItem?.duration?.alwaysActive
                  ? t('Everyday')
                  : startDate.isSame(endDate, 'day') && !carouselItem.alwaysActive
                  ? t('Today')
                  : timeDisplayed}
              </p>

              {carouselItem?.duration?.timings?.length < 7 &&
                !carouselItem?.duration.alwaysActive && (
                  <div className={styles.listComponentDataText}>
                    <span className={styles.daysLabel}>{t('Days: ')}</span>
                    <span className={styles.days}>
                      {carouselItem?.duration?.timings?.map((days: any, index: number) => (
                        <span className={styles.day} key={index}>
                          {days?.day?.charAt(0)?.toUpperCase() + days?.day?.slice(1)?.toLowerCase()}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
            </>
          )}
          {(carouselItem?.contact?.phoneNumber || carouselItem?.contact?.email) && (
            <PhoneEmail
              phone={carouselItem?.contact?.phoneNumber as string}
              email={carouselItem?.contact?.email as string}
            />
          )}
          {carouselItem?.CTA?.status === ACTIVE && carouselItem?.CTA?.URL && (
            <div style={{ position: 'fixed' }}>
              <StyledButton
                variant='contained'
                onClick={onCtaClick}
                className={cx(styles.button, 'globals-actionCtaWrapper')}
              >
                {carouselItem?.CTA?.displayCTATitle || t('Book Now')}
              </StyledButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

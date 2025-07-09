import React, { useState } from 'react';
import styles from './stayDetails.module.scss';
import cx from 'classnames';
import { StableImage } from 'components/shared/StableImage/StableImage';
import StayDetailArrow from '@icons/staydetailArrow.svg';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { toggleCheckInDetailsDrawer, isGetStarted } from 'storage/home.storage';
import dayjs from 'dayjs';
import { getTrips } from 'storage/trips.storage';

export const StayDetails: React.FC<any> = ({ activeOffersList }) => {
  const { t } = useTranslation(['common']);
  const [imageLoaded, setImageLoaded] = useState(false);
  const carouselItem = activeOffersList?.length > 0 ? activeOffersList[0] : [];
  const navigate = useLocalizedRouter();
  const checkInData = getTrips();

  const OnClickManageStay = () => {
    navigate(availablePaths.ITINERARY);
  };

  const OnClickCheckin = () => {
    navigate(availablePaths.CHECK_IN);
    isGetStarted(false);
  };

  const handleManageStayBtn = () => {
    toggleCheckInDetailsDrawer(true);
    isGetStarted(true);
  };

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo: any = reservationData?.getReservation?.data;

  return (
    <>
      {reservationInfo || checkInData?.checkedIn || checkInData?.preCheckedIn ? (
        <>
          <p className={styles.stayDetailsTitle}>{t('Stay Details')}</p>
          <div className={cx(styles.detailsWrapper, {})}>
            <div>
              {carouselItem?.images?.[0]?.master && (
                <StableImage
                  className={styles.bannerImage}
                  src={`${ASSETS_URL}/${carouselItem?.images[0]?.master}`}
                  onLoad={() => setImageLoaded(true)}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
              )}
            </div>
            <div className={styles.dateWrapper}>
              <div className={styles.checkInWrapper}>
                <p className={styles.detailCheckinTitleName}>{t('Check-in Date')}</p>
                <p className={styles.detailCheckinTitleDate}>
                  {dayjs(checkInData?.checkInDate).format('DD MMM YYYY')}
                </p>
              </div>

              <div className={styles.arrow}>
                <StayDetailArrow />
              </div>

              <div className={styles.checkOutWrapper}>
                <p className={styles.detailCheckinTitleName}>{t('Checkout Date')}</p>
                <p className={styles.detailCheckinTitleDate}>
                  {dayjs(checkInData?.checkOutDate).format('DD MMM YYYY')}
                </p>
              </div>
            </div>

            <div className={styles.btnWrapper}>
              <StyledButton
                variant='outlined'
                onClick={OnClickManageStay}
                className={styles.buttonView}
              >
                {t('my itinerary')}
              </StyledButton>

              {!checkInData?.checkedIn && !checkInData?.preCheckedIn && (
                <StyledButton
                  variant='outlined'
                  onClick={OnClickCheckin}
                  className={styles.buttonView}
                >
                  {t('check-in')}
                </StyledButton>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={cx(styles.StayWrapper)}>
          <p className={styles.StayWrapperTitle}>{t('My Itinerary')}</p>
          <p className={styles.StayWrapperdesc}>
            {t('Access and manage your')}{' '}
            <span className={styles.stayDetailBold}>
              {t('itinerary, check-in, in-room activities,')}
            </span>
            {t(' and all exclusive services to enhance your stay')}
          </p>
          <div className={styles.StaybuttonWrapper}>
            <StyledButton
              variant='outlined'
              className={styles.button}
              onClick={handleManageStayBtn}
            >
              {t('Get Started')}
            </StyledButton>
          </div>
        </div>
      )}
    </>
  );
};

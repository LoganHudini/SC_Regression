import { useQuery } from '@apollo/client';
import { client } from 'core/graphql/client';
import { ASSETS_URL } from 'core/graphql/endpoints';
import {
  GET_RESERVATION,
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';
import dayjs from 'dayjs';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { TimeFilter } from '../UpcomingStaysFilter/UpcomingStaysFilter.types';
import { UpcomingStaySkeleton } from '../UpcomingStaySkeleton/UpcomingStaySkeleton';
import styles from './UpcomingStay.module.scss';
import CheckMarkEmpty from '@icons/checkMarkEmpty.svg';
import { IUpcomingStayProps } from './UpcomingStay.types';
import { GET_ROOM_STATUS, IGetRoomStatusApiResponse } from 'core/graphql/queries/GET_ROOM_STATUS';
import { guestInformationStorage } from 'storage/guest-information.storage';
import {
  personalizeYourRoomStorage,
  specialRequestsStorage,
} from 'storage/personalize-your-room.storage';
import { useTranslation } from 'react-i18next';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';

export const UpcomingStay: React.FC<IUpcomingStayProps> = ({
  reservationId,
  roomDetails,
  selectedFilter,
  specialRequests,
  guests,
  personalizationEntities,
}) => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('trips');

  const [isAbleToCheckin, setIsAbleToCheckin] = useState(false);

  const { data: reservationData, loading: reservationDataLoading } =
    useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: reservationId,
      },
    });

  const reservationInfo = reservationData?.getReservation.data;

  const checkIn = useCallback(() => {
    client.writeQuery({
      query: GET_RESERVATION,
      data: reservationData,
    });

    personalizeYourRoomStorage(personalizationEntities);
    specialRequestsStorage(specialRequests);
    guestInformationStorage(guests);

    navigate(availablePaths.ROOM_ASSIGNED);
  }, [guests, personalizationEntities, reservationData, navigate, specialRequests]);

  const currentRoomType = roomDetails.getHotelAccommodationDetails.roomTypes.find(
    (room) => room.code === reservationInfo?.roomTypes[0].code,
  );

  const prettyCheckInDate = dayjs(reservationInfo?.details.checkInDate).format(
    timeFormats.DAY_MONTH_YEAR,
  );
  const prettyCheckOutDate = dayjs(reservationInfo?.details.checkOutDate).format(
    timeFormats.DAY_MONTH_YEAR,
  );

  const isPrecheckedin = reservationInfo?.isPreCheckedIn;
  const isCheckedin = reservationInfo?.reservationStatus === 'INHOUSE';

  useEffect(() => {
    (async () => {
      if (isPrecheckedin) {
        const { data: roomStatusData } = await client.query<IGetRoomStatusApiResponse>({
          query: GET_ROOM_STATUS,
          context: { clientName: 'rest' },
          variables: { roomId: reservationInfo?.roomTypes[0].roomNumber },
        });

        if (roomStatusData.getRoomStatus.data.roomStatus === 'IP') {
          setIsAbleToCheckin(true);
        }
      }
    })();
  }, [isPrecheckedin, reservationInfo?.roomTypes]);

  if (selectedFilter === TimeFilter.Current && !reservationDataLoading) {
    if (
      !(
        new Date(reservationInfo?.details.checkInDate as string) <= new Date() &&
        new Date(reservationInfo?.details.checkOutDate as string) >= new Date()
      )
    ) {
      return null;
    }
  }

  if (selectedFilter === TimeFilter.Upcoming && !reservationDataLoading) {
    if (new Date(reservationInfo?.details.checkInDate as string) <= new Date()) {
      return null;
    }
  }

  if (selectedFilter === TimeFilter.Past && !reservationDataLoading) {
    if (new Date(reservationInfo?.details.checkOutDate as string) >= new Date()) {
      return null;
    }
  }

  if (reservationDataLoading) {
    return <UpcomingStaySkeleton />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.upcomingStayWrapper}>
        <StableImage
          className={styles.upcomingStayImage}
          src={
            currentRoomType?.images[0]
              ? `${ASSETS_URL}/${currentRoomType?.images[0].master}`
              : undefined
          }
        />

        <div className={styles.imageOverlay} />
        {isPrecheckedin && (
          <div className={styles.precheckedinWrapper}>
            <CheckMarkEmpty className={styles.precheckedinIcon} />
            <p className={styles.precheckedinText}>{t('Pre Checked-In')}</p>
          </div>
        )}

        <div className={styles.upcomingStayTextWrapper}>
          <div className={styles.checkWrapper}>
            <div className={styles.checkInWrapper}>
              <p className={styles.checkText}>{t('CHECK IN')}</p>
              <p className={styles.checkDate}>{prettyCheckInDate}</p>
            </div>
            <div className={styles.checkOutWrapper}>
              <p className={styles.checkText}>{t('CHECK OUT')}</p>
              <p className={styles.checkDate}>{prettyCheckOutDate}</p>
            </div>
          </div>
          <div className={styles.hotelDataWrapper}>
            <div className={styles.hotelDataColumn}>
              <p className={styles.hotelDataText}>{reservationInfo?.details.hotel_name}</p>
              {reservationInfo?.roomTypes.map((el, index) => (
                <p key={index} className={styles.hotelDataText}>
                  {el.count} X {el.name}
                </p>
              ))}
            </div>
            <p className={styles.nightsCount}>{`${reservationInfo?.details.nightCount}N`}</p>
          </div>
        </div>
      </div>
      {isPrecheckedin &&
        (isAbleToCheckin ? (
          <div className={styles.buttonsWrapper}>
            <StyledButton className={styles.button} onClick={checkIn} variant='contained'>
              {t('COMPLETE CHECK-IN')}
            </StyledButton>
          </div>
        ) : (
          <p className={styles.preCheckinText}>
            {t('We will notify you once check-in is available')}
          </p>
        ))}
      {isCheckedin && (
        <div className={styles.buttonsWrapper}>
          <StyledButton className={styles.button} onClick={checkIn} variant='contained'>
            {t('ADD DEVICE')}
          </StyledButton>
        </div>
      )}
    </div>
  );
};

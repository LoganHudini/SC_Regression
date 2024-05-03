import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './RoomPersonalizationEntityV2.module.scss';
import cx from 'classnames';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import { IRoomPersonalizationEntityProps } from './RoomPersonalizationEntityV2.types';
import { useTranslation } from 'react-i18next';
import produce from 'immer';
import {
  personalizeYourRoomStorage,
  upgradeYourRoomStorage,
} from 'storage/personalize-your-room.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { PlusMinusInput } from 'components/shared/PlusMinusInput/PlusMinusInput';
import { toggleNotification } from 'storage/home.storage';
import { FAILURE, UPGRADE_ROOM } from 'utils/constants';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { UPDATE_BOOKING_DETAILS } from 'core/graphql/queries/UPDATE_BOOKING_DETAILS';
import { client } from 'core/graphql/client';
import { processStatusCode } from 'utils/processError';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';

export const RoomPersonalizationEntityV2: React.FC<IRoomPersonalizationEntityProps> = ({
  title,
  description,
  price,
  currency,
  type,
  id,
  maxQuantity,
  setNotificationState,
  code,
}) => {
  const { t } = useTranslation('personalize-your-room');
  const personalizationStorageInfo = useReactiveVar(personalizeYourRoomStorage);
  const upgradeRoomStorageInfo = useReactiveVar(upgradeYourRoomStorage);
  const [loading, setLoading] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [show, setShow] = useState(false);
  const readMoreRef = useRef(null);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation.data;
  const currentItem = personalizationStorageInfo?.find((el) => el.id === id);
  const currentItemForRoom = upgradeRoomStorageInfo?.find((el) => el.id === id);

  const quantity = currentItem?.quantity || 0;
  const quantityForRoom = currentItemForRoom?.quantity || 0;

  useEffect(() => {
    const elementToCheck: any = readMoreRef.current;
    if (elementToCheck && elementToCheck?.offsetHeight < elementToCheck?.scrollHeight) {
      setShow(true);
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (quantity < maxQuantity?.maxQuantityValue) {
      personalizeYourRoomStorage(
        produce(personalizeYourRoomStorage(), (draft) => {
          const item = draft?.find((el) => el.id === id);
          if (item) {
            item.quantity++;
          } else {
            draft?.push({
              id: id,
              quantity: 1,
              selected: true,
              title: title,
              price: price,
              currency: currency,
            });
          }
        }),
      );
    } else {
      toggleNotification(true);
      setNotificationState({
        title: t('Limit Exceeded!'),
        description: t('Maximum limit reached for the selected item'),
        redirect: null,
        type: FAILURE,
      });
    }
  }, [
    t,
    currency,
    id,
    maxQuantity?.maxQuantityValue,
    price,
    quantity,
    setNotificationState,
    title,
  ]);

  const handleRemove = useCallback(() => {
    personalizeYourRoomStorage(
      produce(personalizeYourRoomStorage(), (draft) => {
        const item = draft?.find((el) => el?.id === id);
        if (item) {
          const index = (draft ?? [])?.indexOf(item);
          item.quantity === 1 ? index > -1 && draft?.splice(index, 1) : item.quantity--;
        }
      }),
    );
  }, [id]);

  const isActive = Number(quantity) > 0;

  const handleToggle = () => {
    personalizeYourRoomStorage(
      produce(personalizeYourRoomStorage(), (draft) => {
        const item = draft?.find((el) => el.id === id);
        if (item) {
          const index = (draft ?? [])?.indexOf(item);
          if (index > -1) {
            draft?.splice(index, 1);
          }
        } else {
          draft?.push({
            id: id,
            quantity: 1,
            selected: true,
            title: title,
            price: price,
            currency: currency,
          });
        }
      }),
    );
  };

  const handleUpgradeRoom = () => {
    upgradeYourRoomStorage(
      produce(upgradeYourRoomStorage(), (draft) => {
        const item = draft?.find((el) => el.id === id);
        if (item) {
          const index = (draft ?? [])?.indexOf(item);
          if (index > -1) {
            draft?.splice(index, 1);
          }
        } else {
          draft.splice(0, draft.length);
          draft?.push({
            id: id,
            quantity: 1,
            selected: true,
            title: title,
            price: price,
            currency: currency,
            code: code,
          });
        }
      }),
    );
    setLoading(true);
    updateBookingDetails();
  };

  const updateBookingDetails = async () => {
    const updateBookingDetailsPayload = {
      bookingId: reservationInfo?.details.id,
      reservationId: reservationInfo?.reservationId,
      startDate: reservationInfo?.details.checkInDate.split('T')[0],
      endDate: reservationInfo?.details.checkOutDate.split('T')[0],
      uniqueBookingId: reservationInfo?.uniqueBookingId,
      reservationType: reservationInfo?.confirmationType,
      accountId: reservationInfo?.accountId,
      noOfGuest: reservationInfo?.details.totalGuestCount,
      roomCategory: title,
      price: parseFloat(price),
      roomType: code,
      personalisation: [],
      specialRequest: [''],
      comments: [''],
    };

    const checkInToken = getCheckInToken();
    try {
      await client.query({
        query: UPDATE_BOOKING_DETAILS,
        context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: updateBookingDetailsPayload,
        },
      });
      setNotificationState({
        title: t('Upgrade Successful'),
        description: t('Your room upgrade processed successfully.'),
        redirect: null,
        type: FAILURE,
      });
      setLoading(false);
    } catch (e) {
      const statusCode = processStatusCode(e as ApolloError);
      statusCode === 403 && handleCheckInAuthenticationFailure(updateBookingDetails);
      toggleNotification(true);
      setNotificationState({
        title: t('Sorry!'),
        description: t(
          'The selected room is currently not available for an upgrade. Please select a different room type.',
        ),
        redirect: null,
        type: FAILURE,
      });
      setLoading(false);
      upgradeYourRoomStorage([]);
    }
  };

  return (
    <div className={styles.roomPersonalizationEntityWrapper}>
      <div className={styles.roomPersonalizationFirstColumn}>
        <h2 className={styles.roomPersonalizationTitle}>{title}</h2>
        {description && (
          <>
            <p
              id={id}
              ref={readMoreRef}
              className={cx(styles.roomPersonalizationText, {
                [styles.roomPersonalizationTextReadMore]: readMore,
              })}
            >
              {description}
            </p>
            {show && (
              <div className={styles.readMore} onClick={() => setReadMore(!readMore)}>
                {readMore ? t('Read Less') : t('Read More')}
              </div>
            )}
          </>
        )}

        <div className={styles.bottomSec}>
          <div className={cx(styles.price, { [styles.priceActive]: isActive })}>
            {currency}{' '}
            <span className={styles.priceNo}>
              {Number(price)?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {maxQuantity?.status === 'active' ? (
            <>
              <PlusMinusInput
                value={quantity}
                onClickMinus={handleRemove}
                onClickPlus={handleAdd}
              />
            </>
          ) : type === UPGRADE_ROOM ? (
            <StyledButton
              variant={quantityForRoom === 0 ? 'outlined' : 'contained'}
              className={styles.addButton}
              loading={loading}
              onClick={handleUpgradeRoom}
            >
              {quantityForRoom === 0 && !loading ? t('Upgrade') : t('Upgraded')}
            </StyledButton>
          ) : (
            <StyledButton
              variant={quantity === 0 ? 'outlined' : 'contained'}
              className={styles.addButton}
              onClick={handleToggle}
            >
              {quantity === 0 ? t('Select') : t('Selected')}
            </StyledButton>
          )}
        </div>
      </div>
    </div>
  );
};

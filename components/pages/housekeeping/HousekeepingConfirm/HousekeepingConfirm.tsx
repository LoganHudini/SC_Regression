import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from './HousekeepingConfirm.module.scss';
import { IHousekeepingConfirmProps } from './HousekeepingConfirm.types';
import { ApolloError, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HOUSEKEEPING_ORDER';
import {
  IGetReservationApiResponse,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { processError } from 'utils/processError';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { CUSTOM } from 'utils/constants';

export const HousekeepingConfirm: React.FC<IHousekeepingConfirmProps> = ({
  opened,
  toggleOpened,
  housekeepingItems,
}) => {
  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const navigate = useLocalizedRouter();

  const { t } = useTranslation(['housekeeping', 'common']);

  const checkedInData = useCheckedIn();

  const {
    data: reservationData,
    loading: reservationLoading,
    error: reservationError,
  } = useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
    context: { clientName: 'rest' },
    variables: {
      confirmationNumber: checkedInData.reservationId,
    },
  });

  const roomNo = reservationData?.getReservation.data.roomTypes[0].roomNumber;

  const [loading, setLoading] = useState(false);

  const itemsCount = housekeepingInfo.selectedItems.reduce((acc, el) => {
    return acc + el.quantity;
  }, 0);

  const selectedItems = housekeepingInfo.selectedItems.filter((el) => el.quantity > 0);

  const [sendHousekeepingOrder] = useMutation(HOUSEKEEPING_ORDER, {
    context: { clientName: 'host_v4' },
  });

  const handleOrder = useCallback(async () => {
    setLoading(true);

    try {
      const response = await sendHousekeepingOrder({
        variables: {
          items: housekeepingInfo?.selectedItems
            ?.filter((item) => item?.quantity > 0)
            ?.map((el) => ({
              id: el?.itemId,
              name: el?.name + ' X ' + el?.quantity,
              instructions: '',
              scheduledFor:
                el?.schedule !== undefined
                  ? el?.schedule === CUSTOM
                    ? 'Schedule : ' +
                      el?.schedule +
                      ' , ' +
                      'Date : ' +
                      el?.date +
                      ' , ' +
                      'Time : ' +
                      el?.time
                    : 'Schedule : ' + el?.schedule
                  : '',
            })),
          hotelId: HOTEL_ID,
          roomNo: roomNo ?? '',
          guestName:
            reservationData?.getReservation.data.details.contactPerson.firstName ?? 'Testing',
        },
      });
      navigate(availablePaths.HOUSEKEEPING_RESERVATION_CONFIRMATION);
      housekeepingStorage({ selectedItems: [] });
    } catch (e) {
      processError(t, e as ApolloError);
    }
    setLoading(false);
  }, [
    housekeepingInfo?.selectedItems,
    navigate,
    reservationData?.getReservation.data.details.contactPerson.firstName,
    roomNo,
    sendHousekeepingOrder,
    t,
  ]);

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (opened) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [opened]);

  return (
    <>
      <div
        onClick={toggleOpened}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      ></div>
      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{t('Confirm Request')}</h2>
          <div className={styles.totalRequestsWrapper}>
            <p className={styles.totalRequests}>
              {t('Total Requests:')} {String(itemsCount).padStart(2, '0')}
            </p>

            {
              // We iterate throught the all existing items and sub items and display only
              housekeepingItems?.map((housekeepingItem) => {
                const selectedItem = selectedItems.find(({ itemId }) => {
                  const itemIsSelected = itemId === housekeepingItem.id;

                  const subItemIsSelected = housekeepingItem.items?.find(
                    (housekeepingSubItem) => itemId === housekeepingSubItem.id,
                  );

                  return itemIsSelected || subItemIsSelected;
                });

                if (selectedItem)
                  return (
                    <React.Fragment key={housekeepingItem.id}>
                      <p className={styles.option}>{`${housekeepingItem.name} ${
                        housekeepingItem.maxQuantityActive
                          ? `: ${String(selectedItem.quantity).padStart(2, '0')}`
                          : ''
                      }`}</p>

                      {housekeepingItem.items?.map((housekeepingItem) => {
                        const selectedSubItem = selectedItems.find(
                          ({ itemId }) => itemId === housekeepingItem.id,
                        );

                        if (selectedSubItem) {
                          return (
                            <React.Fragment key={housekeepingItem.id}>
                              <p className={styles.optionDescription}>{`${housekeepingItem.name} ${
                                housekeepingItem.maxQuantityActive
                                  ? `: ${String(selectedSubItem.quantity).padStart(2, '0')}`
                                  : ''
                              }`}</p>
                            </React.Fragment>
                          );
                        }
                      })}

                      <div className={styles.line} />
                    </React.Fragment>
                  );
              })
            }
          </div>

          <StyledButton
            loading={loading}
            onClick={handleOrder}
            // disabled={reservationLoading || !!reservationError}
            className={styles.button}
          >
            {t('Confirm')}
          </StyledButton>
        </div>
      </div>
    </>
  );
};

import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import styles from './HousekeepingConfirm.module.scss';
import { IHousekeepingConfirmProps } from './HousekeepingConfirm.types';
import { ApolloError, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HMOB_HOUSEKEEPING_ORDER';
import {
  IGetReservationApiResponse,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import { checkinStorage, useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { processError } from 'utils/processError';
import { client } from 'core/graphql/client';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { GET_ONPREM_TOKEN, IOnPremTokenApiRequest } from 'core/graphql/queries/GET_ONPREM_TOKEN';

export const HMobHousekeepingConfirm: React.FC<IHousekeepingConfirmProps> = ({
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

  const handleOrder = useCallback(async () => {
    setLoading(true);
    const tokenPayload: IOnPremTokenApiRequest = {
      roomNo: reservationData?.getReservation?.data?.roomTypes[0]?.roomNumber ?? '0100',
      bookingId: reservationData?.getReservation?.data?.confirmationId ?? '',
      lastName: 'iptvuser',
      deviceType: 'IPTV',
    };
    const tokenData: any = await client.query({
      query: GET_ONPREM_TOKEN,
      context: { clientName: 'onprem' },
      variables: {
        body: tokenPayload,
      },
      fetchPolicy: 'no-cache',
    });
    checkinStorage({
      reservationId: reservationData?.getReservation?.data?.confirmationId as string,
      checkedIn: true,
      token: tokenData.data.getOnPremToken?.data?.access_token ?? '',
    });
    const payload = {
      items: housekeepingInfo.selectedItems.map((el) => ({
        hmobileId: el.code,
        item: el.name + ' X ' + el.quantity,
      })),
      roomNo: roomNo,
      additionalRequest: '',
    };
    try {
      const token = tokenData.data.getOnPremToken?.data?.access_token;
      const response = await client.query({
        query: HOUSEKEEPING_ORDER,
        context: { clientName: 'onprem', headers: { authorization: `Bearer ${token}` } },
        variables: {
          body: payload,
        },
      });
      navigate(availablePaths.HOUSEKEEPING_RESERVATION_CONFIRMATION);
    } catch (e) {
      processError(t, e as ApolloError);
    }

    setLoading(false);
  }, [housekeepingInfo.selectedItems, t]);

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

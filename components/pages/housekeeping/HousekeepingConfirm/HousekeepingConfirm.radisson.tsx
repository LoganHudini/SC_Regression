import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from './HousekeepingConfirm.module.scss';
import { IHousekeepingConfirmProps } from './HousekeepingConfirm.types';
import { ApolloError, useMutation, useReactiveVar } from '@apollo/client';
import { housekeepingStorage } from 'storage/housekeeping.storage';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HOUSEKEEPING_ORDER';
import { useTranslation } from 'react-i18next';
import { processError } from 'utils/processError';
import { HOTEL_ID } from 'core/graphql/endpoints';
import CloseIcon from '@icons/closeIcon.svg';
import { CUSTOM, HOUSEKEEPING, servicesEvent } from 'utils/constants';
import { CheckinDetails } from 'components/shared/CheckinDetailsDrawer/CheckinDetailsDrawer';
import { ThankYouDrawer } from 'components/pages/ThankYouDrawer/ThankYouDrawer';
import dayjs from 'dayjs';
import { analyticsEvent, serviceRequestEvent } from 'utils/gtag';

export const HousekeepingConfirm: React.FC<IHousekeepingConfirmProps> = ({
  opened,
  toggleOpened,
  housekeepingItems,
  conciergeItems,
}) => {
  const housekeepingInfo = useReactiveVar(housekeepingStorage);
  const [thankYouDrawerConfirm, setthankYouDrawerConfirm] = useState(false);

  const { t } = useTranslation(['housekeeping', 'common']);

  const [thankYouDrawer, setThankYouDrawer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);

  const selectedItems = housekeepingInfo?.selectedItems?.filter((el) => el?.quantity > 0);

  const [sendHousekeepingOrder] = useMutation(HOUSEKEEPING_ORDER, {
    context: { clientName: 'host_v4' },
  });

  const toggleConfirmDrawerOpened = useCallback(() => {
    toggleOpened();
    setConfirmOpened((oldState) => !oldState);
  }, [toggleOpened]);

  const handleOrder = useCallback(async () => {
    const roomNo =
      (typeof window !== 'undefined' &&
        localStorage.getItem('guestDetails') &&
        JSON.parse(localStorage.getItem('guestDetails') ?? '').roomNumber) ??
      '';
    setLoading(true);
    if (!thankYouDrawerConfirm) {
      toggleConfirmDrawerOpened();
    } else {
      try {
        const response = await sendHousekeepingOrder({
          variables: {
            bookingTime: dayjs().format('DD-MM-YYYY HH:mm'),
            guestName:
              (typeof window !== 'undefined' &&
                localStorage.getItem('guestDetails') &&
                JSON.parse(localStorage.getItem('guestDetails') ?? '').name) ??
              '',
            hotelId: HOTEL_ID,
            roomNo: roomNo,
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
          },
        });
        setThankYouDrawer(true);
        serviceRequestEvent(response?.data?.createHouseKeepingOrder);
        toggleOpened();
        setthankYouDrawerConfirm(false);
        housekeepingStorage({ selectedItems: [] });
      } catch (e) {
        processError(t, e as ApolloError);
      }
    }
    setLoading(false);
  }, [
    housekeepingInfo?.selectedItems,
    sendHousekeepingOrder,
    t,
    toggleConfirmDrawerOpened,
    toggleOpened,
    thankYouDrawerConfirm,
  ]);

  const removeSelectedItem = (itemId: string, itemName?: string) => {
    const removedItems = housekeepingInfo.selectedItems.filter(
      (x) => x.itemId !== itemId && x.name !== itemName,
    );
    housekeepingStorage({ ...housekeepingInfo.selectedItems, selectedItems: removedItems });
    if (!removedItems.length) {
      toggleOpened();
    }
  };

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
          <h2 className={styles.title}>{t('Your request')}</h2>
          <div className={styles.totalRequestsWrapper}>
            {
              // We iterate throught the all existing items and sub items and display only
              housekeepingItems?.map((housekeepingItem) => {
                const selectedItem = selectedItems?.find(({ itemId }) => {
                  const itemIsSelected = itemId === housekeepingItem?.id;
                  const subItemIsSelected = housekeepingItem?.items?.find(
                    (housekeepingSubItem) => itemId === housekeepingSubItem?.id,
                  );
                  return itemIsSelected || subItemIsSelected;
                });
                if (selectedItem)
                  return (
                    <React.Fragment key={housekeepingItem?.id}>
                      <div className={styles.itemsWrapper}>
                        <div className={styles.option}>{housekeepingItem?.name}</div>
                        <div className={styles.closeIcon}>
                          <CloseIcon
                            onClick={() =>
                              removeSelectedItem(housekeepingItem?.id, housekeepingItem?.name)
                            }
                          />
                        </div>
                      </div>
                      {!selectedItem?.requested && (
                        <p className={styles.descTitle}>
                          {t('Quantity')} :{' '}
                          <span className={styles.descContent}>{selectedItem?.quantity}</span>
                        </p>
                      )}
                      {housekeepingItem?.items?.map((housekeepingItem) => {
                        const selectedSubItem = selectedItems?.find(
                          ({ itemId }) => itemId === housekeepingItem?.id,
                        );

                        if (selectedSubItem) {
                          return (
                            <React.Fragment key={housekeepingItem?.id}>
                              <>
                                <div className={styles.itemsWrapper}>
                                  <div className={styles.optionDescription}>
                                    {housekeepingItem?.name}
                                    <span className={styles.selectedItems}>
                                      {housekeepingItem?.maxQuantityActive
                                        ? `: ${String(selectedSubItem?.quantity).padStart(2)} ${t(
                                            'Nos',
                                          )}`
                                        : ''}
                                    </span>
                                  </div>
                                  <div className={styles.closeIcon}>
                                    <CloseIcon
                                      onClick={() => removeSelectedItem(housekeepingItem?.id)}
                                    />
                                  </div>
                                </div>
                              </>
                            </React.Fragment>
                          );
                        }
                      })}

                      <div className={styles.line} />
                    </React.Fragment>
                  );
              })
            }
            {
              // We iterate throught the all existing items and sub items and display only
              conciergeItems?.map((conciergeItem) => {
                const selectedItem = selectedItems?.find(({ itemId }) => {
                  const itemIsSelected = itemId === conciergeItem?.id;
                  const subItemIsSelected = conciergeItem?.items?.find(
                    (conciergeSubItem) => itemId === conciergeSubItem?.id,
                  );
                  return itemIsSelected || subItemIsSelected;
                });
                if (selectedItem)
                  return (
                    <React.Fragment key={conciergeItem?.id}>
                      <div className={styles.itemsWrapper}>
                        <div className={styles.option}>{conciergeItem?.name}</div>
                        <div className={styles.closeIcon}>
                          <CloseIcon
                            onClick={() =>
                              removeSelectedItem(conciergeItem?.id, conciergeItem?.name)
                            }
                          />
                        </div>
                      </div>
                      {!selectedItem?.requested && (
                        <p className={styles.descTitle}>
                          {t('Quantity')} :{' '}
                          <span className={styles.descContent}>{selectedItem?.quantity}</span>
                        </p>
                      )}
                      {conciergeItem?.items?.map((conciergeItem) => {
                        const selectedSubItem = selectedItems?.find(
                          ({ itemId }) => itemId === conciergeItem?.id,
                        );

                        if (selectedSubItem) {
                          return (
                            <React.Fragment key={conciergeItem?.id}>
                              <>
                                <div className={styles.itemsWrapper}>
                                  <div className={styles.optionDescription}>
                                    {conciergeItem?.name}
                                    <span className={styles.selectedItems}>
                                      {conciergeItem?.maxQuantityActive
                                        ? `: ${String(selectedSubItem?.quantity).padStart(2)} ${t(
                                            'Nos',
                                          )}`
                                        : ''}
                                    </span>
                                  </div>
                                  <div className={styles.closeIcon}>
                                    <CloseIcon
                                      onClick={() => removeSelectedItem(conciergeItem?.id)}
                                    />
                                  </div>
                                </div>
                              </>
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
          {/* {checkedInData.checkedIn && (
            <div className={styles.container}>
              <div className={styles.roomInfoWrapper}>
                <div className={styles.roomDetails}>ROOM NO - 4032</div>
                <div className={styles.roomDetails}>John Smith</div>
              </div>
              <div className={styles.roomInfoWrapper}>
                <div className={styles.hotel}>Radisson Blu Dubai Waterfront</div>
                <div className={styles.date}>22 May -24 May (3 Days)</div>
              </div>
            </div>
          )} */}
          <div className={styles.buttonWrapper}>
            <StyledButton onClick={toggleOpened} variant='outlined' className={styles.button}>
              {t('CLOSE')}
            </StyledButton>

            <StyledButton loading={loading} onClick={handleOrder} className={styles.button}>
              {t('Confirm')}
            </StyledButton>
          </div>
        </div>
      </div>
      <CheckinDetails
        setthankYouDrawerConfirm={setthankYouDrawerConfirm}
        opened={confirmOpened}
        toggleOpened={toggleConfirmDrawerOpened}
      />
      <ThankYouDrawer
        opened={thankYouDrawer}
        close={setThankYouDrawer}
        title={t('Your order has been confirmed.') as string}
        redirect={HOUSEKEEPING}
      />
    </>
  );
};

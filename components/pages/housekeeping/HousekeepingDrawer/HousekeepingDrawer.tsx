import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './HousekeepingDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { HousekeepingQuantityItem } from 'components/pages/housekeeping-quantity/HousekeepingQuantityItem/HousekeepingQuantityItem';
import { HousekeepingCheckboxItem } from 'components/pages/housekeeping-checkbox/HousekeepingCheckboxItem/HousekeepingCheckboxItem';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { timeFormats } from 'utils/timeFormats';
import { ApolloError, useMutation, useReactiveVar } from '@apollo/client';
import { HOUSEKEEPING_ORDER } from 'core/graphql/queries/HOUSEKEEPING_ORDER';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { processError } from 'utils/processError';
import { housekeepingQuantityStorage } from 'storage/housekeeping-quantity.storage';
import {
  CUSTOM,
  DATE,
  DATETIME,
  HOUSEKEEPING,
  IMMEDIATE,
  TIME,
  TODAY,
  TOMORROW,
} from 'utils/constants';
import { housekeepingCheckboxStorage } from 'storage/housekeeping-checkbox.storage';
import { Drawer } from '@mui/material';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import TimeIcon from '@icons/time-left.svg';
import { Notification } from 'components/shared/Notification/Notification';
import { toggleNotification } from 'storage/home.storage';

export const HousekeepingDrawer = (props: any) => {
  const { opened, toggleOpened, showSchedules } = props;
  const { t } = useTranslation(['housekeeping', 'common']);
  const [showCalendar, setShowCalendar] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
  );

  const [startY, setStartY] = useState(0);

  const housekeepingInfo: any = useReactiveVar(housekeepingQuantityStorage);
  const housekeepingInfo1 = useReactiveVar(housekeepingCheckboxStorage);

  const combinedServiceRequestArray = useMemo(
    () => [...housekeepingInfo.selectedItems, ...housekeepingInfo1.selectedItems],
    [housekeepingInfo.selectedItems, housekeepingInfo1.selectedItems],
  );

  const [sendHousekeepingOrder] = useMutation(HOUSEKEEPING_ORDER, {
    context: { clientName: 'host_v4' },
  });

  const showQuantityLabel = showSchedules?.items?.filter(
    (schedule: any) => schedule?.maxQuantityActive,
  );

  useEffect(() => {
    if (opened && combinedServiceRequestArray?.length > 0) {
      setDisabled(true);
      const value = combinedServiceRequestArray?.find((x: any) => x?.quantity > 0);
      if (showSchedules?.maxQuantityActive && value !== undefined) {
        setDisabled(true);
      } else if (value !== undefined) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
  }, [opened, combinedServiceRequestArray, showSchedules?.maxQuantityActive]);

  const handleSave = () => {
    setShowCalendar(false);
  };

  const handleShowSchedules = () => {
    if (showSchedules?.schedule?.includes(TODAY) && showSchedules?.schedule?.includes(TOMORROW)) {
      setShowCalendar(true);
    } else {
      setShowCalendar(true);
    }
  };

  const handleClose = () => {
    toggleOpened();
    setShowCalendar(false);
    setDisabled(false);
    setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
    housekeepingQuantityStorage({ selectedItems: [] });
    housekeepingCheckboxStorage({ selectedItems: [] });
  };

  const handleOrder = async () => {
    try {
      const response = await sendHousekeepingOrder({
        variables: {
          bookingTime: dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2),
          guestName: 'test test',
          serviceName: showSchedules?.name,
          requestType: showSchedules?.__typename,
          hotelId: HOTEL_ID,
          roomNo: '002',
          items: combinedServiceRequestArray
            ?.filter((item: any) => item?.quantity > 0)
            ?.map((el: any) => ({
              id: el?.itemId,
              name: el?.name + ' X ' + el?.quantity,
              instructions: '',
              scheduledFor: showSchedules?.scheduleActive
                ? showSchedules?.schedule?.includes(CUSTOM)
                  ? showSchedules?.customSchedule === DATE
                    ? dayjs(selectedTime).format(timeFormats.DAY_MONTH)
                    : showSchedules?.customSchedule === TIME
                      ? dayjs(selectedTime).format(timeFormats.HOURS_MINUTES_AM)
                      : showSchedules?.customSchedule === DATETIME
                        ? dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                        : dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                  : dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)
                : '',
            })),
        },
      });
      toggleNotification(true);
      setTimeout(() => {
        setDisabled(false);
        housekeepingQuantityStorage({ selectedItems: [] });
        housekeepingCheckboxStorage({ selectedItems: [] });
        setShowCalendar(false);
        setSelectedTime(dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM));
        toggleOpened();
      }, 4000);
    } catch (e) {
      processError(t, e as ApolloError);
    }
  };

  return (
    <>
      <Drawer
        variant='temporary'
        anchor='bottom'
        open={opened}
        onClose={() => handleClose()}
        PaperProps={{
          elevation: 0,
          style: {
            maxWidth: '768px',
            borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
            borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
            maxHeight: 'var(--primary-drawer-height)',
            margin: 'auto',
          },
        }}
        slotProps={{
          backdrop: {
            style: {
              opacity: opened ? 'var(--primary-drawer-background-opacity)' : '0', // Slide animation
              transition: 'opacity 0.5s ease-in-out', // Customize the animation here
              // opacity: 'var(--primary-drawer-background-opacity)',
              backdropFilter: 'blur(2px)',
            },
          },
        }}
        onTouchStart={(e) => handleTouchStart(e, setStartY)}
        onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, handleClose)}
      >
        <div className={styles.wrapper}>
          <div className={styles.drawerNotch}></div>
          <div className={styles.confirmationWrapper}>
            <h2 className={styles.title}>{showSchedules?.name}</h2>
            <div className={styles.totalRequestsWrapper}>
              <div>
                {showSchedules && showSchedules?.maxQuantityActive ? (
                  <HousekeepingQuantityItem
                    id={showSchedules?.id}
                    title={showSchedules?.name}
                    maxQuantity={showSchedules?.maxQuantity}
                    maxQuantityActive={showSchedules?.maxQuantityActive}
                    changeAlignment={false}
                  />
                ) : (
                  <>
                    {showSchedules?.items?.length > 0 && (
                      <>
                        <div className={styles.itemsWrapper}>
                          <div>Items Required</div>
                          {showQuantityLabel?.length > 0 && <div>{t('Quantity')}</div>}
                        </div>

                        {showSchedules?.items
                          ?.filter((schedule: any) => schedule?.maxQuantityActive)
                          ?.map((schedule: any) => (
                            <React.Fragment key={schedule?.id}>
                              <HousekeepingQuantityItem
                                id={schedule?.id}
                                title={schedule?.name}
                                maxQuantity={schedule?.maxQuantity}
                                maxQuantityActive={schedule?.maxQuantityActive}
                                changeAlignment={true}
                              />
                            </React.Fragment>
                          ))}

                        {showSchedules?.items
                          ?.filter((schedule: any) => !schedule?.maxQuantityActive)
                          ?.map((schedule: any) => (
                            <React.Fragment key={schedule?.id}>
                              <HousekeepingCheckboxItem id={schedule?.id} title={schedule?.name} />
                            </React.Fragment>
                          ))}
                      </>
                    )}
                  </>
                )}

                {showSchedules?.scheduleActive && showSchedules?.schedule?.includes(IMMEDIATE) && (
                  <>
                    <div className={styles.calendarDateWrapper}>
                      <div className={styles.calendarDateLabel}>
                        <span className={styles.icon}>
                          <TimeIcon />
                        </span>
                        Scheduled Time
                      </div>

                      <div className={styles.calendarDateText}>
                        {dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)}
                      </div>
                    </div>
                  </>
                )}

                {showSchedules?.scheduleActive && !showSchedules?.schedule?.includes(IMMEDIATE) && (
                  <>
                    {!showCalendar && (
                      <div className={styles.calendarDateWrapper}>
                        <div
                          className={styles.calendarDateLabel}
                          onClick={() => handleShowSchedules()}
                        >
                          <span className={styles.icon}>
                            <TimeIcon />
                          </span>
                          Schedule Time
                        </div>
                        {!showCalendar &&
                          !dayjs().isAfter(
                            dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM),
                          ) && (
                            <div className={styles.calendarDateText}>
                              {dayjs(selectedTime).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2)}
                            </div>
                          )}
                      </div>
                    )}

                    {showCalendar && (
                      <>
                        <DateTimeSelect
                          setSelectedTime={setSelectedTime}
                          selectedTime={selectedTime}
                          handleSave={handleSave}
                          showSchedules={showSchedules}
                          buttonTitle={t('Save')}
                        />
                      </>
                    )}
                  </>
                )}

                {!showCalendar && (
                  <StyledButton disabled={!disabled} onClick={() => handleOrder()}>
                    {t('PLACE ORDER')}
                  </StyledButton>
                )}
              </div>
            </div>
          </div>
        </div>
        <Notification
          title={t('Thank You!') as string}
          description={t('Your request has been confirmed') as string}
          redirect={HOUSEKEEPING}
          type='success'
        />
      </Drawer>
    </>
  );
};

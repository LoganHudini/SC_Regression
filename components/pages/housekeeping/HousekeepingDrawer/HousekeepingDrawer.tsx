import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import styles from './HousekeepingDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { HousekeepingQuantityItem } from 'components/pages/housekeeping-quantity/HousekeepingQuantityItem/HousekeepingQuantityItem';
import { HousekeepingCheckboxItem } from 'components/pages/housekeeping-checkbox/HousekeepingCheckboxItem/HousekeepingCheckboxItem';
import DateTimeSelect from 'components/shared/DateTimeSelect/DateTimeSelect';
import { timeFormats } from 'utils/timeFormats';

export const HousekeepingDrawer = (props: any) => {
  const { opened, toggleOpened, showSchedules } = props;
  const { t } = useTranslation(['housekeeping', 'common']);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showImmediateTime, setShowImmediateTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM),
  );

  useEffect(() => {
    let newSelectedTime = selectedTime;

    if (showSchedules?.schedule?.includes('TOMORROW')) {
      const originalDate = dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM);
      const newDate = originalDate?.add(1, 'day');
      newSelectedTime = newDate?.format(timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM);
    } else if (showSchedules?.schedule.includes('IMMEDIATE')) {
      setShowImmediateTime(true);
    } else if (showSchedules?.schedule.includes('TODAY')) {
      // Handle 'TODAY' case
      // Update newSelectedTime accordingly
    }

    setSelectedTime(newSelectedTime);
  }, [showSchedules.schedule, setSelectedTime]);

  const handleSave = () => {
    setShowCalendar(false);
  };

  const handleShowSchedules = () => {
    setShowCalendar(true);
  };

  return (
    <>
      <div
        onClick={() => {
          toggleOpened();
          setShowCalendar(false);
          setSelectedTime(dayjs().format(timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM));
        }}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      />

      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
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
                      {showSchedules?.items
                        .filter((schedule: any) => schedule?.maxQuantityActive)
                        .map((schedule: any) => (
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
                        .filter((schedule: any) => !schedule?.maxQuantityActive)
                        .map((schedule: any) => (
                          <React.Fragment key={schedule?.id}>
                            <HousekeepingCheckboxItem id={schedule?.id} title={schedule?.name} />
                          </React.Fragment>
                        ))}
                    </>
                  )}
                </>
              )}

              {showSchedules?.scheduleActive && showImmediateTime && (
                <>
                  {!showCalendar && (
                    <div className={styles.calendarDateWrapper}>
                      <div
                        className={styles.calendarDateLabel}
                        onClick={() => handleShowSchedules()}
                      >
                        Scheduled Time
                      </div>
                      {!showCalendar &&
                        !dayjs().isAfter(
                          dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM),
                        ) && (
                          <div className={styles.calendarDateText}>
                            {dayjs(selectedTime).format(timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM_2)}
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}

              {showSchedules?.scheduleActive && (
                <>
                  {!showCalendar && (
                    <div className={styles.calendarDateWrapper}>
                      <div
                        className={styles.calendarDateLabel}
                        onClick={() => handleShowSchedules()}
                      >
                        Scheduled Time
                      </div>
                      {!showCalendar &&
                        !dayjs().isAfter(
                          dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM),
                        ) && (
                          <div className={styles.calendarDateText}>
                            {dayjs(selectedTime).format(timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM_2)}
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
                        // schedules={showSchedules?.schedule}
                        // showImmediateTime={showImmediateTime}
                        // setShowImmediateTime={setShowImmediateTime}
                        disableDay={
                          showSchedules?.schedule[0] === 'TODAY' ||
                          showSchedules?.schedule[0] === 'TOMORROW'
                            ? true
                            : false
                        }
                      />
                    </>
                  )}
                </>
              )}

              {!showCalendar && <StyledButton>PLACE ORDER</StyledButton>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

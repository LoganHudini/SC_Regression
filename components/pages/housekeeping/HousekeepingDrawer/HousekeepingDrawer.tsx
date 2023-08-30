import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import styles from './HousekeepingDrawer.module.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';

const dayMonthArray: any = [];
for (let month = 0; month < 12; month++) {
  const daysInMonth = dayjs().month(month).daysInMonth();
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = dayjs().month(month).date(day).format('DD MMM');
    dayMonthArray.push(formattedDate);
  }
}
const hoursArray = new Array(13).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const minutesArray = new Array(60).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const timeFormat = ['AM', 'PM'];

export const HousekeepingDrawer = (props: any) => {
  const { opened, toggleOpened, showSchedules } = props;
  const { t } = useTranslation(['housekeeping', 'common']);
  const [showCalendar, setShowCalendar] = useState(true);
  const [disable, setDisable] = useState(false);
  const [selectedTime, setSelectedTime] = useState(dayjs().format('DD MMM:hh:mm:A'));

  useEffect(() => {
    if (selectedTime) {
      if (dayjs().isAfter(dayjs(selectedTime, 'DD MMM hh:mm A'))) {
        setDisable(true);
      } else {
        setDisable(false);
      }
    }
  }, [selectedTime]);

  const onChange = useCallback(
    (value: [string, string, string, string]) => {
      setSelectedTime(value.join(':'));
    },
    [setSelectedTime],
  );

  const handleSave = () => {
    setShowCalendar(false);
  };

  return (
    <>
      <div
        onClick={() => {
          toggleOpened();
          setShowCalendar(true);
          setSelectedTime(dayjs().format('DD MMM:hh:mm:A'));
        }}
        className={cx(styles.background, { [styles.backgroundOpened]: opened })}
      />

      <div className={cx(styles.wrapper, { [styles.wrapperOpened]: opened })}>
        <div className={styles.confirmationWrapper}>
          <h2 className={styles.title}>{showSchedules?.name}</h2>
          <div className={styles.totalRequestsWrapper}>
            {showCalendar && showSchedules?.customSchedule === 'Time' && (
              <>
                <div className={styles.timePickerWrapper}>
                  <MultiPicker onValueChange={onChange} selectedValue={selectedTime?.split(':')}>
                    <Picker indicatorClassName='my-picker-indicator'>
                      {dayMonthArray?.map((day: any) => (
                        <Picker.Item className='my-picker-view-item day' key={day} value={day}>
                          {day === dayjs().format('DD MMM') ? 'Today' : day}
                        </Picker.Item>
                      ))}
                    </Picker>
                    <Picker indicatorClassName='my-picker-indicator'>
                      {hoursArray.map((hour) => (
                        <Picker.Item className='my-picker-view-item hour' key={hour} value={hour}>
                          {hour}
                        </Picker.Item>
                      ))}
                    </Picker>
                    <Picker indicatorClassName='my-picker-indicator'>
                      {minutesArray?.map((minute) => (
                        <Picker.Item
                          className='my-picker-view-item minute'
                          key={minute}
                          value={minute}
                        >
                          {minute}
                        </Picker.Item>
                      ))}
                    </Picker>
                    <Picker indicatorClassName='my-picker-indicator'>
                      {timeFormat?.map((format) => (
                        <Picker.Item
                          className='my-picker-view-item format'
                          key={format}
                          value={format}
                        >
                          {format}
                        </Picker.Item>
                      ))}
                    </Picker>
                  </MultiPicker>
                </div>

                <StyledButton disabled={disable} onClick={() => handleSave()}>
                  Save
                </StyledButton>
              </>
            )}
            {!showCalendar && (
              <div className={styles.calendarDateWrapper}>
                <div className={styles.calendarDateLabel}>Scheduled Time</div>
                <div className={styles.calendarDateText}>
                  {dayjs(selectedTime).format('DD MMM hh:mm A')}
                </div>

                <StyledButton>PLACE ORDER</StyledButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

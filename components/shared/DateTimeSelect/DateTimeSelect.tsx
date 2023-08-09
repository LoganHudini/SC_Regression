import { CalendarPicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import styles from './DateTimeSelect.module.scss';
import ArrowBottomIcon from '@icons/arrowBottom.svg';
import cx from 'classnames';
import { IDateTimeSelectProps } from './DateTimeSelect.types';
import { TimeSelect } from '../TimeSelectModal/TimeSelectModal';

const DateTimeSelect: React.FC<IDateTimeSelectProps> = ({
  setSelectedDate,
  selectedDate,
  setSelectedTime,
  selectedTime,
  minutesArray,
  disable,
  setDisable,
}) => {
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [timeSelectOpened, setTimeSelectOpened] = useState(false);
  const handleOpenDatePicker = useCallback(() => {
    setDatePickerOpened((oldState) => !oldState);
  }, []);

  const handleDateChange = useCallback(
    (value: dayjs.Dayjs | null) => {
      setSelectedDate(dayjs(value).format('YYYY-MM-DD'));
    },
    [setSelectedDate],
  );

  const toggleTimeSelectOpened = useCallback(() => {
    setTimeSelectOpened((oldState) => !oldState);
  }, []);

  return (
    <div>
      <div className={styles.dateTimeHeading}>Add Delivery Date & Time</div>
      <div className={styles.dateTimeWrapper}>
        <>
          <>
            <div className={styles.chooseAnotherDateRow}>
              <p className={styles.chooseAnotherDateText}>{'Date'}</p>
              <div onClick={handleOpenDatePicker}>
                {dayjs(selectedDate).format('YYYY-MM-DD')}
                {'   '}
                <ArrowBottomIcon
                  className={cx(styles.chooseAnotherDateArrow, {
                    [styles.chooseAnotherDateArrowOpened]: datePickerOpened,
                  })}
                />
              </div>
            </div>

            <div
              className={cx(styles.datePickerWrapper, {
                [styles.datePickerWrapperOpened]: datePickerOpened,
              })}
            >
              <CalendarPicker
                className={styles.styledDateInput}
                onChange={handleDateChange}
                minDate={dayjs(new Date())}
                date={selectedDate ? dayjs(selectedDate) : null}
              />
            </div>
          </>

          <div className={styles.chooseTimeRow}>
            <p className={styles.chooseTimeTitle}>{'Preferred Time'}</p>
            <div className={styles.timeBox} onClick={toggleTimeSelectOpened}>
              {disable ? dayjs().format('HH:mm') : selectedTime}
              <ArrowBottomIcon className={styles.timeBoxArrow} />
            </div>
          </div>
        </>
      </div>
      {timeSelectOpened && (
        <TimeSelect
          opened={timeSelectOpened}
          disable={disable}
          setDisable={setDisable}
          toggleOpened={toggleTimeSelectOpened}
          setSelectedTime={setSelectedTime}
          selectedTime={selectedTime}
          minutesArrayProps={minutesArray}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};
export default DateTimeSelect;

import dayjs from 'dayjs';
import React, { useCallback, useState, useEffect } from 'react';
import styles from './DateTimeSelect.module.scss';
import { IDateTimeSelectProps } from './DateTimeSelect.types';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import { StyledButton } from '../StyledButton/StyledButton';
import { timeFormats } from 'utils/timeFormats';

const dayMonthArray: any = [];
for (let month = 0; month < 12; month++) {
  const daysInMonth = dayjs().month(month).daysInMonth();
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = dayjs().month(month).date(day).format(timeFormats.DAY_MONTH);
    dayMonthArray.push(formattedDate);
  }
}
const hoursArray = new Array(13).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const minutesArray = new Array(60).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const timeFormat = ['AM', 'PM'];

const DateTimeSelect: React.FC<IDateTimeSelectProps> = ({
  setSelectedTime,
  selectedTime,
  handleSave,
  disableDay,
  // schedules,
  // setShowImmediateTime,
  // showImmediateTime,
}) => {
  const [disable, setDisable] = useState(false);

  // useEffect(() => {
  //   if (selectedTime) {
  //     const selectedDateTime = dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM_2);

  //     if (schedules[0] === 'TOMORROW') {
  //       if (selectedDateTime.isSame(newDate, 'day')) {
  //         // console.log('yes TOMORROW');
  //         setDisable(true);
  //       } else if (selectedDateTime.isAfter(newDate, 'day')) {
  //         // console.log('Done');
  //         setDisable(false);
  //       } else {
  //         // console.log('yes');
  //         setDisable(false);
  //       }
  //     } else {
  //       if (!dayjs().isAfter(dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM_2))) {
  //         // console.log('Past time');
  //         setDisable(true);
  //       } else {
  //         // console.log('Future time');
  //         setDisable(false);
  //       }
  //     }
  //   }
  // }, [schedules, selectedTime]);

  useEffect(() => {
    if (selectedTime) {
      if (dayjs().isAfter(dayjs(selectedTime, timeFormats.DAY_MOUNTH_HOUR_MINUTE_AM_2))) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  }, [selectedTime]);

  const onChange = useCallback(
    (value: [string, string, string, string]) => {
      setSelectedTime(value.join(':'));
    },
    [setSelectedTime],
  );

  return (
    <div>
      <>
        <div className={styles.timePickerWrapper}>
          <MultiPicker onValueChange={onChange} selectedValue={selectedTime?.split(':')}>
            <Picker indicatorClassName='my-picker-indicator' disabled={disableDay}>
              {dayMonthArray?.map((day: any) => (
                <Picker.Item
                  className={
                    disableDay ? 'my-picker-view-item dayDisabled' : 'my-picker-view-item day'
                  }
                  key={day}
                  value={day}
                >
                  {day === dayjs().format(timeFormats.DAY_MONTH) ? 'Today' : day}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              // disabled={showCalendar && showSchedules?.customSchedule === 'Date ' ? true : false}
            >
              {hoursArray.map((hour) => (
                <Picker.Item className='my-picker-view-item hour' key={hour} value={hour}>
                  {hour}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              // disabled={showCalendar && showSchedules?.customSchedule === 'Date ' ? true : false}
            >
              {minutesArray?.map((minute) => (
                <Picker.Item className='my-picker-view-item minute' key={minute} value={minute}>
                  {minute}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              // disabled={showCalendar && showSchedules?.customSchedule === 'Date ' ? true : false}
            >
              {timeFormat?.map((format) => (
                <Picker.Item className='my-picker-view-item format' key={format} value={format}>
                  {format}
                </Picker.Item>
              ))}
            </Picker>
          </MultiPicker>
        </div>

        <StyledButton disabled={!disable} onClick={() => handleSave()}>
          Save
        </StyledButton>
      </>
    </div>
  );
};
export default DateTimeSelect;

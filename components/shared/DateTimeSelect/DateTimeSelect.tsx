import dayjs from 'dayjs';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styles from './DateTimeSelect.module.scss';
import { IDateTimeSelectProps } from './DateTimeSelect.types';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import { StyledButton } from '../StyledButton/StyledButton';
import { timeFormats } from 'utils/timeFormats';
import 'rmc-picker/assets/index.css';
import {
  CUSTOM,
  DATE,
  DAY,
  IMMEDIATE,
  TIME,
  TODAY,
  TOMORROW,
  TimeFormatArray,
} from 'utils/constants';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';

const fullDayMonthArray: string[] = [];
for (let month = 0; month < 12; month++) {
  const daysInMonth = dayjs().month(month).daysInMonth();
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = dayjs().month(month).date(day).format(timeFormats.DAY_MONTH);
    fullDayMonthArray.push(formattedDate);
  }
}
const tomorrow = dayjs()?.add(1, DAY).format(timeFormats.DAY_MONTH);
const hoursArray = new Array(13).fill(0).map((_el, index) => String(index).padStart(2, '0'));
const minutesArray = new Array(4).fill(0).map((_el, index) => String(index * 15).padStart(2, '0'));

const DateTimeSelect: React.FC<IDateTimeSelectProps> = ({
  loading,
  setSelectedTime,
  selectedTime,
  handleSave,
  showSchedules,
  buttonTitle,
  buttonStyle,
  module,
  disableTimepiCketConfirmBtn,
}) => {
  const { t } = useTranslation(['common']);
  const [disable, setDisable] = useState(false);
  const scheduledToday = showSchedules?.schedule?.includes(TODAY);
  const scheduledTomorrow = showSchedules?.schedule?.includes(TOMORROW);
  const scheduledCustom = showSchedules?.schedule?.includes(CUSTOM);
  const scheduledImmediate = showSchedules?.schedule?.includes(IMMEDIATE);
  const dayMonthArray = useMemo(() => {
    if (module === 'housekeeping' && scheduledToday && scheduledTomorrow && !scheduledCustom) {
      return [
        dayjs().format(timeFormats.DAY_MONTH),
        dayjs().add(1, DAY).format(timeFormats.DAY_MONTH),
      ];
    }
    return fullDayMonthArray;
  }, [module, scheduledToday, scheduledTomorrow, scheduledCustom]);

  useEffect(() => {
    if (selectedTime) {
      const current = dayjs();
      const selected = dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2);

      if (scheduledToday && scheduledTomorrow) {
        if (selected.isAfter(current.add(1, DAY), DAY)) {
          setDisable(false);
        } else if (current.isAfter(selected)) {
          setDisable(current.format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM) === selectedTime);
        } else {
          setDisable(true);
        }
      } else {
        if (current.isAfter(selected)) {
          setDisable(current.format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM) === selectedTime);
        } else {
          setDisable(true);
        }
      }
    }
  }, [selectedTime, showSchedules?.schedule]);

  useEffect(() => {
    if (
      scheduledTomorrow &&
      !scheduledToday &&
      !scheduledCustom &&
      !scheduledImmediate &&
      module === 'housekeeping'
    ) {
      const newDate = dayjs().add(1, DAY).format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM);
      setSelectedTime(newDate);
    }
  }, [setSelectedTime, showSchedules?.schedule, module]);

  const onChange = useCallback(
    (value: [string, string, string, string]) => {
      setSelectedTime(value.join(':'));
    },
    [setSelectedTime],
  );

  return (
    <div>
      <>
        <div
          className={styles.timePickerWrapper}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <MultiPicker onValueChange={onChange} selectedValue={selectedTime?.split(':')}>
            <Picker
              indicatorClassName='my-picker-indicator'
              className={
                ((scheduledToday && !scheduledImmediate && !scheduledTomorrow) ||
                  (scheduledCustom && showSchedules?.customSchedule === TIME)) &&
                styles.disabled
              }
            >
              {!scheduledToday && !scheduledImmediate && scheduledTomorrow ? (
                <Picker.Item className='my-picker-view-item day' key={tomorrow} value={tomorrow}>
                  {tomorrow}
                </Picker.Item>
              ) : (
                dayMonthArray?.map((day: any) => (
                  <Picker.Item className='my-picker-view-item day' key={day} value={day}>
                    {day === dayjs().format(timeFormats.DAY_MONTH) ? TODAY : day}
                  </Picker.Item>
                ))
              )}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              className={
                scheduledCustom && showSchedules?.customSchedule === DATE && styles.disabled
              }
            >
              {hoursArray.map((hour) => (
                <Picker.Item className='my-picker-view-item hour' key={hour} value={hour}>
                  {hour}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              className={
                scheduledCustom && showSchedules?.customSchedule === DATE && styles.disabled
              }
            >
              {minutesArray?.map((minute) => (
                <Picker.Item className='my-picker-view-item minute' key={minute} value={minute}>
                  {minute}
                </Picker.Item>
              ))}
            </Picker>

            <Picker
              indicatorClassName='my-picker-indicator'
              className={
                scheduledCustom && showSchedules?.customSchedule === DATE && styles.disabled
              }
            >
              {TimeFormatArray?.map((format) => (
                <Picker.Item className='my-picker-view-item format' key={format} value={format}>
                  {format}
                </Picker.Item>
              ))}
            </Picker>
          </MultiPicker>
        </div>

        <StyledButton
          disabled={(module === 'restaurants_bars' && !disableTimepiCketConfirmBtn) || !disable}
          loading={loading}
          onClick={() => handleSave()}
          className={cx(buttonStyle)}
        >
          {buttonTitle || t('Save')}
        </StyledButton>
      </>
    </div>
  );
};
export default DateTimeSelect;

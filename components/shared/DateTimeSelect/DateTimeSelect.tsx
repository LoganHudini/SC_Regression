import dayjs from 'dayjs';
import React, { useCallback, useState, useEffect } from 'react';
import styles from './DateTimeSelect.module.scss';
import { IDateTimeSelectProps } from './DateTimeSelect.types';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import { StyledButton } from '../StyledButton/StyledButton';
import { timeFormats } from 'utils/timeFormats';
import { CUSTOM, DATE, DAY, IMMEDIATE, TODAY, TOMORROW, TimeFormatArray } from 'utils/constants';
import { useTranslation } from 'react-i18next';

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

const DateTimeSelect: React.FC<IDateTimeSelectProps> = ({
  setSelectedTime,
  selectedTime,
  handleSave,
  showSchedules,
}) => {
  const { t } = useTranslation(['common']);
  const [disable, setDisable] = useState(false);
  const scheduledToday = showSchedules?.schedule?.includes(TODAY);
  const scheduledTomorrow = showSchedules?.schedule?.includes(TOMORROW);
  const scheduledCustom = showSchedules?.schedule?.includes(CUSTOM);
  const scheduledImmediate = showSchedules?.schedule?.includes(IMMEDIATE);

  useEffect(() => {
    if (selectedTime) {
      if (scheduledToday && scheduledTomorrow) {
        if (
          dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2).isAfter(
            dayjs().add(1, DAY),
            DAY,
          )
        ) {
          setDisable(false);
        } else if (dayjs().isAfter(dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2))) {
          setDisable(false);
        } else {
          setDisable(true);
        }
      } else {
        if (dayjs().isAfter(dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2))) {
          setDisable(false);
        } else {
          setDisable(true);
        }
      }
    }
  }, [selectedTime, showSchedules?.schedule]);

  useEffect(() => {
    let newSelectedTime = selectedTime;
    if (scheduledTomorrow && !scheduledToday && !scheduledCustom && !scheduledImmediate) {
      const originalDate = dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM);
      const newDate = originalDate?.add(1, DAY);
      newSelectedTime = newDate?.format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM);
      setSelectedTime(newSelectedTime);
    }
  }, [setSelectedTime, showSchedules?.schedule]);

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
            <Picker
              indicatorClassName='my-picker-indicator'
              disabled={
                (!scheduledToday && !scheduledImmediate && scheduledTomorrow) ||
                (scheduledToday && !scheduledImmediate && !scheduledTomorrow)
                  ? true
                  : false
              }
            >
              {dayMonthArray?.map((day: any) => (
                <Picker.Item
                  className={
                    (!scheduledToday && !scheduledImmediate && scheduledTomorrow) ||
                    (scheduledToday && !scheduledImmediate && !scheduledTomorrow)
                      ? 'my-picker-view-item dayDisabled'
                      : 'my-picker-view-item day'
                  }
                  key={day}
                  value={day}
                >
                  {day === dayjs().format(timeFormats.DAY_MONTH) ? TODAY : day}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              disabled={scheduledCustom && showSchedules?.customSchedule === DATE ? true : false}
            >
              {hoursArray.map((hour) => (
                <Picker.Item
                  className={
                    scheduledCustom && showSchedules?.customSchedule === DATE
                      ? 'my-picker-view-item hourDisabled'
                      : 'my-picker-view-item hour'
                  }
                  key={hour}
                  value={hour}
                >
                  {hour}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              disabled={scheduledCustom && showSchedules?.customSchedule === DATE ? true : false}
            >
              {minutesArray?.map((minute) => (
                <Picker.Item
                  className={
                    scheduledCustom && showSchedules?.customSchedule === DATE
                      ? 'my-picker-view-item minuteDisabled'
                      : 'my-picker-view-item minute'
                  }
                  key={minute}
                  value={minute}
                >
                  {minute}
                </Picker.Item>
              ))}
            </Picker>
            <Picker
              indicatorClassName='my-picker-indicator'
              disabled={scheduledCustom && showSchedules?.customSchedule === DATE ? true : false}
            >
              {TimeFormatArray?.map((format) => (
                <Picker.Item
                  className={
                    scheduledCustom && showSchedules?.customSchedule === DATE
                      ? 'my-picker-view-item formatDisabled'
                      : 'my-picker-view-item format'
                  }
                  key={format}
                  value={format}
                >
                  {format}
                </Picker.Item>
              ))}
            </Picker>
          </MultiPicker>
        </div>

        <StyledButton disabled={!disable} onClick={() => handleSave()}>
          {t('Save')}
        </StyledButton>
      </>
    </div>
  );
};
export default DateTimeSelect;

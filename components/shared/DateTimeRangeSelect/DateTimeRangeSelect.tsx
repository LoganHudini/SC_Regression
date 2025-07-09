import React, { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import 'rmc-picker/assets/index.css';

import styles from './DateTimeRangeSelect.module.scss';
import { StyledButton } from '../StyledButton/StyledButton';
import cx from 'classnames';

// Extend dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Define possible schedule types
type ScheduleType = 'ALWAYS_ACTIVE' | 'RECURRING';

interface IDateTimeRangeSelectProps {
  loading?: boolean;
  setSelectedTime: (time: string) => void;
  selectedTime?: string; // Format: "YYYY-MM-DD hh:mm A"
  handleSave: (formattedValue: string) => void;
  dateRange?: string; // Format: "YYYY-MM-DD - YYYY-MM-DD"
  startTime?: string; // Format: "HH:mm"
  endTime?: string; // Format: "HH:mm"
  buttonTitle?: string;
  buttonStyle?: string;
  hideTime?: boolean;
  scheduleType: ScheduleType;
}

export const DateTimeRangeSelect: React.FC<IDateTimeRangeSelectProps> = ({
  loading,
  setSelectedTime,
  selectedTime,
  handleSave,
  dateRange,
  startTime = '00:00',
  endTime = '23:45',
  buttonTitle,
  buttonStyle,
  hideTime,
  scheduleType,
}) => {
  const [selected, setSelected] = useState<{
    date: string;
    hour: string;
    minute: string;
    period: string;
  }>({
    date: '',
    hour: '12',
    minute: '00',
    period: 'AM',
  });

  // Parse date range
  const parsedDateRange = useMemo(() => {
    if (!dateRange) return null;

    const [startStr, endStr] = dateRange.split(' - ').map((d) => dayjs(d.trim()));
    if (!startStr.isValid() || !endStr.isValid()) return null;

    return { start: startStr.startOf('day'), end: endStr.endOf('day') };
  }, [dateRange]);

  const dateOptions = useMemo(() => {
    if (!parsedDateRange) return [];

    const options = [];
    let currentDate = parsedDateRange.start;

    while (currentDate.isSameOrBefore(parsedDateRange.end, 'day')) {
      options.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    return options;
  }, [parsedDateRange]);

  const timeOptions = useMemo(() => {
    const hours: string[] = [];
    const minutes: string[] = [];

    const selectedDate = selected.date ? dayjs(selected.date) : dayjs();
    let effectiveStartTime = '00:00';

    if (selectedDate.isSame(dayjs(), 'day')) {
      effectiveStartTime = dayjs().format('HH:mm');
    }

    const effectiveStart = dayjs(effectiveStartTime, 'HH:mm');
    const effectiveEnd = dayjs(endTime, 'HH:mm');

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const time = dayjs(timeStr, 'HH:mm');
        const isInRange = time.isSameOrAfter(effectiveStart) && time.isSameOrBefore(effectiveEnd);

        if (isInRange) {
          const hour12 = h % 12 === 0 ? '12' : (h % 12).toString().padStart(2, '0');
          if (!hours.includes(hour12)) hours.push(hour12);
          const formattedMinute = m.toString().padStart(2, '0');
          if (!minutes.includes(formattedMinute)) minutes.push(formattedMinute);
        }
      }
    }

    return { hours, minutes };
  }, [selected.date, endTime]);

  // Initialize selection from selectedTime prop
  useEffect(() => {
    if (selectedTime) {
      const parsed = dayjs(selectedTime, 'YYYY-MM-DD hh:mm A');
      if (parsed.isValid()) {
        setSelected({
          date: parsed.format('YYYY-MM-DD'),
          hour: parsed.format('hh'),
          minute: parsed.format('mm'),
          period: parsed.format('A'),
        });
      }
    } else {
      const now = dayjs();
      const initialDate = parsedDateRange ? parsedDateRange.start : now;
      const initialTime = dayjs(startTime, 'HH:mm');
      const hour24 = initialTime.hour();
      const hour12 = hour24 % 12 === 0 ? '12' : (hour24 % 12).toString().padStart(2, '0');
      const period = initialTime.format('A');

      setSelected({
        date: initialDate?.format('YYYY-MM-DD'),
        hour: hour12,
        minute: initialTime?.format('mm'),
        period,
      });
    }
  }, [selectedTime, parsedDateRange, startTime]);

  // Update selectedTime whenever selection changes
  useEffect(() => {
    const { date, hour, minute, period } = selected;
    const combined = dayjs(`${date} ${hour}:${minute} ${period}`, 'YYYY-MM-DD hh:mm A');

    if (combined.isValid()) {
      setSelectedTime(combined.format('YYYY-MM-DD hh:mm A'));
    }
  }, [selected, setSelectedTime]);

  const handleChange = useCallback((field: 'date' | 'time', value: string[]) => {
    if (field === 'date') {
      setSelected((prev) => ({ ...prev, date: value[0] }));
    } else {
      setSelected((prev) => ({
        ...prev,
        hour: value[0],
        minute: value[1],
        period: value[2],
      }));
    }
  }, []);

  const onSave = () => {
    const { date, hour, minute, period } = selected;

    let hour24 = parseInt(hour, 10);
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 < 12) {
      hour24 += 12;
    }

    const formattedHour24 = hour24.toString().padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');

    if (scheduleType === 'ALWAYS_ACTIVE') {
      const fullTime = dayjs(`${date} ${formattedHour24}:${formattedMinute}`, 'YYYY-MM-DD HH:mm');
      if (fullTime.isValid()) {
        handleSave(fullTime.format('YYYY-MM-DD hh:mm A'));
      }
    } else if (scheduleType === 'RECURRING') {
      handleSave(date); // Just the date
    }
  };

  return (
    <div>
      <div className={styles.horizontalLine}></div>
      {/* Date Picker */}
      <div className={styles.timePickerWrapper}>
        <p className={styles.subtitle}>Date</p>
        <MultiPicker
          selectedValue={[selected?.date]}
          onValueChange={(value) => handleChange('date', value)}
        >
          <Picker indicatorClassName='my-picker-indicator' className={styles.day}>
            {dateOptions.map((date) => (
              <Picker.Item key={date} value={date}>
                {dayjs(date).format('DD MMM YYYY')}
              </Picker.Item>
            ))}
          </Picker>
        </MultiPicker>
      </div>

      {/* Time Pickers */}
      {!hideTime && scheduleType === 'ALWAYS_ACTIVE' && (
        <>
          <div className={styles.horizontalLine}></div>
          <p className={styles.subtitle}>Start Time</p>
          <div className={styles.timePickerWrapper}>
            <MultiPicker
              selectedValue={[selected?.hour, selected?.minute, selected?.period]}
              onValueChange={(value) => handleChange('time', value)}
            >
              {/* Hour Picker */}
              <Picker indicatorClassName='my-picker-indicator' className={styles.hour}>
                {timeOptions?.hours?.map((hour) => (
                  <Picker.Item key={hour} value={hour}>
                    {hour}
                  </Picker.Item>
                ))}
              </Picker>

              {/* Minute Picker */}
              <Picker indicatorClassName='my-picker-indicator' className={styles.minute}>
                {timeOptions?.minutes?.map((minute) => (
                  <Picker.Item key={minute} value={minute}>
                    {minute}
                  </Picker.Item>
                ))}
              </Picker>

              {/* AM/PM Picker */}
              <Picker indicatorClassName='my-picker-indicator' className={styles.format}>
                <Picker.Item value='AM'>AM</Picker.Item>
                <Picker.Item value='PM'>PM</Picker.Item>
              </Picker>
            </MultiPicker>
          </div>
        </>
      )}

      <StyledButton className={cx(buttonStyle)} onClick={onSave} disabled={loading}>
        {buttonTitle || 'Save'}
      </StyledButton>
    </div>
  );
};

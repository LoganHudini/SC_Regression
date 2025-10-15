import dayjs from 'dayjs';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styles from './DateTimeSelect.module.scss';
import { IDateTimeSelectProps } from './DateTimeSelect.types';
import Picker from 'rmc-picker/lib/Picker';
import MultiPicker from 'rmc-picker/lib/MultiPicker';
import { StyledButton } from '../StyledButton/StyledButton';
import { timeFormats } from 'utils/timeFormats';
import 'rmc-picker/assets/index.css';
import { CUSTOM, DAY, IMMEDIATE, TODAY, TOMORROW } from 'utils/constants';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);

const reservationData = client.readQuery<IGetReservationApiResponse>({
  query: GET_RESERVATION,
});
const reservationInfo = reservationData?.getReservation?.data;
const checkOutDate = dayjs(reservationInfo?.details?.checkOutDate as string);

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

const DateTimeSelectRestaurant: React.FC<IDateTimeSelectProps> = ({
  loading,
  setSelectedTime,
  selectedTime,
  handleSave,
  showSchedules,
  buttonTitle,
  buttonStyle,
  module,
  disableTimepiCketConfirmBtn,
  initialSelectedTime,
  queryResultEntity,
}) => {
  const { t } = useTranslation(['common']);
  const [disable, setDisable] = useState(false);
  const [internalSelectedTime, setInternalSelectedTime] = useState<string | undefined>(
    selectedTime || '',
  );

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
    if (!selectedTime) return;

    const parsedSelectedTime = dayjs(selectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2);
    if (!parsedSelectedTime.isValid()) {
      setDisable(true);
      return;
    }

    if (module === 'dining' && initialSelectedTime) {
      const parsedInitial = dayjs(initialSelectedTime, timeFormats.DAY_MONTH_HOUR_MINUTE_AM_2);
      setDisable(
        parsedSelectedTime.isAfter(parsedInitial) ||
          parsedSelectedTime.isSame(parsedInitial, 'minute'),
      );
    } else {
      const now = dayjs();
      setDisable(parsedSelectedTime.isAfter(now));
    }
  }, [selectedTime, module, initialSelectedTime]);

  useEffect(() => {
    if (selectedTime && selectedTime !== internalSelectedTime) {
      setInternalSelectedTime(selectedTime);
    }
  }, [selectedTime]);

  const onChange = useCallback(
    ([day, hour, minute, format]: any) => {
      setSelectedDay(day);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedFormat(format);
      const timeString = `${day}:${hour}:${minute}:${format}`;
      setInternalSelectedTime(timeString);
      setSelectedTime(timeString);
    },
    [setSelectedTime],
  );

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  function expandEverydayAndKeepAll(hours: any) {
    const expanded = hours.flatMap((entry: any) => {
      if (entry.day.toUpperCase() === 'EVERYDAY') {
        return daysOfWeek.map((day) => ({
          day,
          open: entry.open,
          close: entry.close,
        }));
      }
      return entry;
    });

    return expanded;
  }

  const restaurantHours = expandEverydayAndKeepAll(queryResultEntity?.hours || []);

  const mergeAndGenerateSlots = (hours: any) => {
    const result: any = {};

    // Expand EVERYDAY
    const expanded = [];
    for (const h of hours) {
      if (h.day === 'EVERYDAY') {
        for (const day of daysOfWeek) {
          expanded.push({ ...h, day });
        }
      } else {
        expanded.push(h);
      }
    }

    // Group by day
    const grouped: any = {};
    for (const { day, open, close } of expanded) {
      const o = open === 'all day' ? '00:00' : open;
      const c = close === 'all day' ? '23:59' : close;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push([
        dayjs(`2024-01-01 ${o}`, 'YYYY-MM-DD HH:mm'),
        dayjs(`2024-01-01 ${c}`, 'YYYY-MM-DD HH:mm'),
      ]);
    }

    // Merge overlapping ranges
    for (const day in grouped) {
      const intervals = grouped[day].sort((a: any, b: any) => a[0].valueOf() - b[0].valueOf());

      const merged = [];
      let [start, end] = intervals[0];

      for (let i = 1; i < intervals.length; i++) {
        const [currStart, currEnd] = intervals[i];
        if (currStart.isBefore(end) || currStart.isSame(end)) {
          end = dayjs.max(end, currEnd);
        } else {
          merged.push([start, end]);
          [start, end] = [currStart, currEnd];
        }
      }
      merged.push([start, end]);

      // Create 15-minute intervals
      result[day] = [];
      for (const [mStart, mEnd] of merged) {
        let time = mStart;
        while (time.isBefore(mEnd)) {
          result[day].push({
            hour: time.format('hh'),
            minute: time.format('mm'),
            format: time.format('A'),
          });
          time = time.add(15, 'minute');
        }
      }
    }

    return result;
  };

  const availableSlots = useMemo(() => {
    return mergeAndGenerateSlots(restaurantHours);
  }, [restaurantHours]);

  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  return (
    <div>
      <>
        <div
          className={styles.timePickerWrapper}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <MultiPicker
            onValueChange={onChange}
            selectedValue={[selectedDay, selectedHour, selectedMinute, selectedFormat]}
          >
            <Picker
              onValueChange={(day) => {
                setSelectedDay(day);
                setSelectedHour('');
                setSelectedMinute('');
                setSelectedFormat('');
              }}
            >
              {Object.keys(availableSlots).map((day) => (
                <Picker.Item key={day} value={day}>
                  {day?.slice(0, 3)}
                </Picker.Item>
              ))}
            </Picker>

            <Picker
              onValueChange={(hour) => {
                setSelectedHour(hour);
                setSelectedMinute('');
                setSelectedFormat('');
              }}
            >
              {[...new Set(availableSlots[selectedDay]?.map((s: any) => s.hour))].map(
                (hour: any) => (
                  <Picker.Item key={hour} value={hour}>
                    {hour}
                  </Picker.Item>
                ),
              )}
            </Picker>

            <Picker
              onValueChange={(minute) => {
                setSelectedMinute(minute);
                setSelectedFormat('');
              }}
            >
              {[
                ...new Set(
                  availableSlots[selectedDay]
                    ?.filter((s: any) => s.hour === selectedHour)
                    .map((s: any) => s.minute),
                ),
              ].map((minute: any) => (
                <Picker.Item key={minute} value={minute}>
                  {minute}
                </Picker.Item>
              ))}
            </Picker>

            <Picker onValueChange={(format) => setSelectedFormat(format)}>
              {[
                ...new Set(
                  availableSlots[selectedDay]
                    ?.filter((s: any) => s.hour === selectedHour && s.minute === selectedMinute)
                    .map((s: any) => s.format),
                ),
              ].map((format: any) => (
                <Picker.Item key={format} value={format}>
                  {format}
                </Picker.Item>
              ))}
            </Picker>
          </MultiPicker>
        </div>

        <StyledButton
          // disabled={(module === 'restaurants_bars' && false) || !disable}
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
export default DateTimeSelectRestaurant;

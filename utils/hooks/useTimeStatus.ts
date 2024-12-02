import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getFormattedTime, getTimeStatus, isDayFound } from 'utils/functions';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import { SPA } from 'utils/constants';

interface HotelLocation {
  timezone: string;
}

interface HotelInformation {
  getPropertyDetailsByHotelId: {
    hotel: {
      location: HotelLocation;
    };
  };
}

interface UseSpaStatusProps {
  module: string;
  slide: any;
  hotelInformation: HotelInformation;
  t: any;
}

const useSpaStatus = ({ module, slide, hotelInformation, t }: UseSpaStatusProps) => {
  dayjs.extend(timezone);
  dayjs.extend(duration);
  dayjs.extend(utc);
  dayjs.extend(isBetween);

  const timings = module === SPA ? slide?.hours?.timings : slide?.hours;

  const getTimeValues = (key: string) => timings?.map((time: any) => time?.[key]);

  const openTime = getTimeValues(module === SPA ? 'from' : 'open');
  const closeTime = getTimeValues(module === SPA ? 'to' : 'close');
  const openDays = getTimeValues('day');

  const toDay = dayjs()
    .tz(hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone)
    .locale('en')
    .format('dddd')
    .toUpperCase();

  const [status, setStatus] = useState<string>('');

  const nowTimeIs = getFormattedTime(
    dayjs()
      .tz(hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone)
      .format('HH:mm'),
  );

  useEffect(() => {
    const statusdisplayMessage = getTimeStatus(
      nowTimeIs,
      t,
      isDayFound(openDays, toDay),
      getFormattedTime(openTime),
      getFormattedTime(closeTime),
    );
    setStatus(statusdisplayMessage);
  }, [nowTimeIs, openTime, closeTime, openDays, t, toDay]);

  return { status };
};

export default useSpaStatus;

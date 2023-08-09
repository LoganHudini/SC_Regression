import dayjs from 'dayjs';
import { scrollState } from 'storage/dining-menu.storage';

export const guestNameFandB = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('FandB_guestDetails') &&
    JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.name) ??
  '';

export const guestRoomNoFandB = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('FandB_guestDetails') &&
    JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.roomNumber) ??
  '';

export const guestPhoneNoFandB = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('FandB_guestDetails') &&
    JSON.parse(localStorage.getItem('FandB_guestDetails') ?? '')?.phoneNumber) ??
  '';

export const restaurantId = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('restaurantId') &&
    JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
  '';

export const FandBOrders = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('FandBOrders') &&
    JSON.parse(localStorage.getItem('FandBOrders') ?? '')) ??
  '';

export const filterMenuWrtTimings = (hours: any) => {
  if (!hours || hours?.length === 0) {
    return false;
  }
  const currentDay = dayjs().format('dddd').toUpperCase();
  const currentTime = dayjs().format('HH:mm');
  for (const hour of hours) {
    const closingTime = hour?.close === '00:00' ? '24:00' : hour?.close;

    if (hour.day === 'EVERYDAY' || hour.day === currentDay) {
      if (
        (hour.open === 'all day' && closingTime === 'all day') ||
        (currentTime >= hour.open && currentTime <= closingTime)
      ) {
        return true;
      }
    }
  }
  return false;
};

export const convertTo12HourFormat = (time24: string) => {
  const [hours, minutes] = time24.split(':');

  let hoursNum = parseInt(hours, 10);
  const meridiem = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12 || 12;

  return `${hoursNum}:${minutes} ${meridiem}`;
};

export const irdActiveMenuList = (data: any) => {
  let filteredMenuList = data?.getIRDMenuOutputDetails?.filter(
    (item: any) => item?.isActive && filterMenuWrtTimings(item?.hours),
  );

  filteredMenuList?.length === 0
    ? (filteredMenuList = data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive))
    : filteredMenuList;
  return filteredMenuList && filteredMenuList;
};

export const setScrollPosition = (x: number, y: number) => {
  scrollState({ scrollX: x, scrollY: y });
};

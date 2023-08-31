import dayjs from 'dayjs';
import { scrollState } from 'storage/dining-menu.storage';
import { PhoneRegex } from './constants';
import * as yup from 'yup';

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

export const generateValidationSchema = (sections: any) => {
  return yup.object().shape(
    sections.reduce((schema: any, field: any) => {
      const isActive = field?.isActive;
      const isRequired = field?.required;

      if (isActive) {
        schema[field?.name] = yup.string();

        const validationRules: any = {
          email: {
            validation: yup.string().email('Invalid email format'),
            requiredMessage: 'Email is required',
          },
          phone: {
            validation: yup.string().matches(PhoneRegex, 'Invalid phone number'),
            requiredMessage: 'Phone is required',
          },
          // Add more validation
        };

        if (validationRules[field?.name]) {
          schema[field?.name] = validationRules[field?.name].validation.when([`${isRequired}`], {
            is: true,
            then: schema[field?.name].required(validationRules[field?.name].requiredMessage),
          });
        }

        if (isRequired) {
          schema[field?.name] = schema[field?.name].required(`${field?.label} is required`);
        }

        return schema;
      }

      return schema;
    }, {}),
  );
};

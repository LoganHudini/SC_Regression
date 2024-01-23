import dayjs from 'dayjs';
import { scrollState } from 'storage/dining-menu.storage';
import {
  BAR,
  BARS_CAPS,
  DOCTYPE,
  EXTERNAL_URL,
  PHONE_REGEX,
  RESTAURANT,
  RESTAURANTS,
  RESTAURANT_BOOKING_FLOW,
  TIMINGS,
} from './constants';
import * as yup from 'yup';
import { tableReservationStorage } from 'storage/table-reservation.storage';

// Extract data from local storage
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

export const getWelcomeDrawer = () =>
  (typeof window !== 'undefined' &&
    localStorage.getItem('welcomeDrawer') &&
    JSON.parse(localStorage.getItem('welcomeDrawer') ?? '')) ??
  true;

// Convert time format from 24H to 12H
export const convertTo12HourFormat = (time24: string) => {
  const [hours, minutes] = time24.split(':');

  let hoursNum = parseInt(hours, 10);
  const meridiem = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12 || 12;

  return `${hoursNum}:${minutes} ${meridiem}`;
};

// Filter items based on the time of the day
export const filterLiveMenu = (hours: any) => {
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

// Return menu based on the time of the day
export const irdActiveMenuList = (data: any) => {
  let filteredMenuList = data?.getIRDMenuOutputDetails?.filter(
    (item: any) => item?.isActive && filterLiveMenu(item?.hours),
  );

  filteredMenuList?.length === 0
    ? (filteredMenuList = data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive))
    : filteredMenuList;
  return filteredMenuList && filteredMenuList;
};

// Set global scroll position
export const setScrollPosition = (x: number, y: number) => {
  scrollState({ scrollX: x, scrollY: y });
};

// Generate dynamic formik schema validation
export const generateValidationSchema = (sections: any) => {
  return yup.object().shape(
    sections.reduce((schema: any, field: any) => {
      const isActive = field?.isActive;
      const isRequired = field?.required;

      if (isActive) {
        schema[field?.name] = yup.string();

        const validationRules: any = {
          emails: {
            validation: yup.string().email('Invalid email format'),
            requiredMessage: 'Email is required',
          },
          phone: {
            validation: yup.string().matches(PHONE_REGEX, 'Invalid phone number'),
            requiredMessage: 'Phone Number is required',
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

// Generate dynamic formik field values
export const generateInitialFieldValues = (field: any, selectedField: any) => {
  return field?.reduce((values: any, field: any) => {
    values[field?.name] = selectedField[field?.name] ? selectedField[field?.name] : '';
    return values;
  }, {});
};

// Filter restaurants list based on type
export const filterRestaurantList = (queryResultsData: any, diningOptionSelected: any) => {
  return queryResultsData?.filter((restaurant: any) => {
    return restaurant?.isActive && restaurant?.type === diningOptionSelected?.type;
  });
};

// Return active items
export const activeItems = (list: any) => list && list?.filter((item: any) => item?.isActive);

// Timings
export const getTimings = (data: any) => data && data?.find((item: any) => item?.key === TIMINGS);

export const updateDocTypeOptions = (data: any, replaceData: any) => {
  return data?.map((item: any) => {
    if (item?.name === DOCTYPE) {
      return { ...item, options: replaceData };
    }
    return item;
  });
};

export const isOfferActive = (offer: any) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (offer?.isActive) {
    if (offer?.duration?.alwaysActive) {
      return true;
    } else {
      const startDateString = offer.duration.startDate;
      const startTimeString = offer.duration.startTime;
      const endDateString = offer.duration.endDate;
      const endTimeString = offer.duration.endTime;

      const [startDay, startMonth, startYear] = startDateString.split('-');
      const [startHour, startMinute] = startTimeString.split(':');
      const [endDay, endMonth, endYear] = endDateString.split('-');
      const [endHour, endMinute] = endTimeString.split(':');

      const startDateTime = new Date(
        Number(startYear),
        Number(startMonth) - 1,
        Number(startDay),
        Number(startHour),
        Number(startMinute),
      );
      const startTimeStamp = Math.floor(startDateTime.getTime() / 1000);

      const endDateTime = new Date(
        Number(endYear),
        Number(endMonth) - 1,
        Number(endDay),
        Number(endHour),
        Number(endMinute),
      );
      const endTimeStamp = Math.floor(endDateTime.getTime() / 1000);

      return startTimeStamp <= currentTimestamp && endTimeStamp >= currentTimestamp;
    }
  }

  return false;
};

export const activeModule = (moduleList: any, moduleActive: any) =>
  moduleList.find((module: any) => module?.code === moduleActive && module?.isActive)
    ? true
    : false;

export const uniqueDiningOption = (queryResultsData: any) => {
  const value = queryResultsData
    ?.map((option: any) => ({
      type: option?.type,
      isActive: option?.isActive,
    }))
    .filter((obj: any, index: any) => {
      return obj?.type === RESTAURANT;
    });
  return value?.length > 0 ? [value[0]] : [];
};

export const diningOptionList = (type: any) => {
  return type === RESTAURANT || type === BAR ? RESTAURANTS : type;
};

export const moduleType = (config: any, targetType: any) => {
  return config?.find((module: any) => module?.isActive && module?.code === targetType);
};

export const restaurantCtaNavigation = (
  object: any,
  router: any,
  navigate?: any,
  setDetailContent?: any,
  setTimeSelectDrawer?: any,
) => {
  if (object?.cta?.redirectOption === EXTERNAL_URL) {
    router.push(object?.cta?.redirectUrl);
  }
  if (object?.cta?.redirectOption === RESTAURANT_BOOKING_FLOW) {
    tableReservationStorage({
      restaurantName: object?.name,
      id: object?.id,
      venueId: (object?.customAttributes && object?.customAttributes[0]?.value) ?? '',
    });
    navigate;
    setTimeSelectDrawer;
    setDetailContent;
  }
};

export const openLinknewTab = (url: string) => {
  const a = document.createElement('a');
  a.target = '_blank';
  a.referrerPolicy = 'noopener, noreferrer';
  a.href = url;
  a.click();
};

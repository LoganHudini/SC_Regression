import dayjs from 'dayjs';
import { scrollState } from 'storage/dining-menu.storage';
import {
  BAR,
  DOCTYPE,
  EXTERNAL_URL,
  RESTAURANT,
  RESTAURANTS,
  RESTAURANT_BOOKING_FLOW,
  TEXTFIELD_REGEX,
  TIMINGS,
  GENDER,
  ALL_DAY,
  FAILURE,
  reservationStatusMessages,
  EVERYDAY,
  idVerificationFields,
  EMAILS,
  PHONE,
} from './constants';
import { tableReservationStorage } from 'storage/table-reservation.storage';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import {
  toggleRestaurantDetailsDrawer,
  notificationStorage,
  toggleCheckInDetailsDrawer,
  toggleNotification,
} from 'storage/home.storage';
import { analyticsEvent } from './gtag';
import * as yup from 'yup';
import { Countries } from './countryList';
import { availablePaths } from './availablePaths';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
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
    sessionStorage.getItem('welcomeDrawer') &&
    JSON.parse(sessionStorage.getItem('welcomeDrawer') ?? '')) === null
    ? true
    : false;

// Convert time format from 24H to 12H
export const convertTo12HourFormat = (time24: string) => {
  if (!time24) return time24 || '';
  const [hours, minutes] = time24?.split(':');

  let hoursNum = parseInt(hours, 10);
  const meridiem = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12 || 12;

  return `${hoursNum}:${minutes} ${meridiem}`;
};

// Filter items based on the time of the day

export const filterLiveMenu = (hours: any[], hotelInformation: any) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  if (!hours || hours.length === 0) return false;
  const now = dayjs().tz(hotelInformation);

  const currentDay = now.format('dddd').toUpperCase();

  for (const hour of hours) {
    if (hour.day !== 'EVERYDAY' && hour.day !== currentDay) continue;

    if (hour.open === 'all day' && hour.close === 'all day') {
      return true;
    }

    const openTime = dayjs(hour.open, 'HH:mm');
    const closeTimeRaw = hour.close === '00:00' ? '24:00' : hour.close;
    const closeTime = dayjs(closeTimeRaw, 'HH:mm');

    const openDateTime = now.set('hour', openTime.hour()).set('minute', openTime.minute());
    let closeDateTime = now.set('hour', closeTime.hour()).set('minute', closeTime.minute());

    if (closeDateTime.isBefore(openDateTime)) {
      closeDateTime = closeDateTime.add(1, 'day');

      const openYesterday = openDateTime.subtract(1, 'day');
      const closeYesterday = closeDateTime.subtract(1, 'day');

      const isInYesterdayRange = now.isAfter(openYesterday) && now.isBefore(closeYesterday);
      const isInTodayRange = now.isAfter(openDateTime) && now.isBefore(closeDateTime);

      if (isInYesterdayRange || isInTodayRange) {
        return true;
      }
    } else {
      if (now.isAfter(openDateTime) && now.isBefore(closeDateTime)) {
        return true;
      }
    }
  }

  return false;
};

// Return menu based on the time of the day
export const irdActiveMenuList = (data: any, hotelInformation: any) => {
  let filteredMenuList = data?.getIRDMenuOutputDetails?.filter(
    (item: any) => item?.isActive && filterLiveMenu(item?.hours, hotelInformation),
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
export const activeItems = (list: any) =>
  list && list?.length > 0 ? list?.filter((item: any) => item?.isActive) : [];

// Timings
export const getTimings = (data: any) => data && data?.find((item: any) => item?.key === TIMINGS);

// Payment Message
export const getPaymentMessage = (data: any) =>
  data && data?.find((item: any) => item?.key === 'paymentMessage')?.value;

export const updateDocTypeOptionsOptionConfig = (
  data: any,
  replaceDataDoc: any,
  replaceDataGender?: any,
) => {
  return data?.map((item: any) => {
    if (item?.name === DOCTYPE && replaceDataDoc?.length > 0) {
      return { ...item, options: replaceDataDoc };
    }
    if (item?.name === GENDER && replaceDataGender?.length > 0) {
      return { ...item, options: replaceDataGender };
    }
    return item;
  });
};

export const filterChildDetails = (data: any) => {
  return data?.map((item: any) => {
    if (item?.name === EMAILS) {
      return { ...item, isActive: false, required: false };
    }
    if (item?.name === PHONE) {
      return { ...item, isActive: false, required: false };
    }
    return item;
  });
};

export const updateDocTypeForNewGuestOptions = (
  data: any,
  replaceDataDoc: any,
  replaceDataGender: any,
) => {
  if (!data || !data?.details) {
    return data;
  }
  const updatedDetails = data?.details.map((item: any) => {
    if (item?.name === DOCTYPE && replaceDataDoc?.length > 0) {
      return { ...item, options: replaceDataDoc };
    }
    if (item?.name === GENDER && replaceDataGender?.length > 0) {
      return { ...item, options: replaceDataGender };
    }
    return item;
  });
  return {
    ...data,
    details: updatedDetails,
  };
};

export const isOfferActive = (offer: any) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const currentDate = new Date();
  const currentDayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

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

      const isWithinTimeRange =
        startTimeStamp <= currentTimestamp && endTimeStamp >= currentTimestamp;

      if (isWithinTimeRange) {
        if (!offer?.duration?.alwaysActive && offer?.duration?.timings?.length > 0) {
          return offer?.duration?.timings?.some(
            (customDay: any) => customDay?.day === currentDayOfWeek,
          );
        } else {
          return true;
        }
      }
    }
  }

  return false;
};

export const activeModule = (moduleList: any, moduleActive: any) =>
  moduleList?.find((module: any) => module?.code === moduleActive && module?.isActive)
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
  setDetailContent?: any,
  setTimeSelectDrawer?: any,
  setIframeComponent?: any,
  navigate?: any,
) => {
  if (object?.cta?.redirectOption === EXTERNAL_URL) {
    object?.cta?.redirectUrl &&
      (setIframeComponent(true),
      analyticsEvent({
        action: 'restaurant_redirect',
        category: 'Restaurant',
        title: object?.name,
      }));
  }
  if (object?.cta?.redirectOption === RESTAURANT_BOOKING_FLOW) {
    tableReservationStorage({
      restaurantName: object?.name,
      id: object?.id,
      venueId: (object?.customAttributes && object?.customAttributes[0]?.value) ?? '',
    });
    navigate;
    toggleRestaurantDetailsDrawer(true);
    setTimeSelectDrawer(true);
    setDetailContent && setDetailContent(false);
    setIframeComponent && setIframeComponent(false);
  }
};

export const openLinknewTab = (url: string) => {
  const a = document.createElement('a');
  a.target = '_blank';
  a.referrerPolicy = 'noopener, noreferrer';
  a.href = url;
  a.click();
};

export const filterIRDMenuItems = (activeMenu: any) => {
  const irdMenu: any = [];
  activeMenu?.forEach((menu: any) => {
    menu?.categories?.forEach((category: any) => {
      const itemExists = category?.items?.find((item: any) => item?.isActive);
      if (itemExists) {
        irdMenu.push(menu);
      }
    });
  });

  return [...new Set(irdMenu)];
};

export const filterHotelCompendiumSections = (data: any) => {
  return data?.getHotelAmenityDetails?.section?.filter((section: any) => {
    const relatedCategories = data?.getHotelAmenityDetails?.categories?.filter((category: any) =>
      category?.sectionIds?.includes(section?.id),
    );
    return relatedCategories?.some((category: any) => {
      return data?.getHotelAmenityDetails?.amenities?.some(
        (amenity: any) => amenity?.categoryIds?.includes(category?.id) && amenity?.isActive,
      );
    });
  });
};

export const filterHotelCompendiumCategories = (data: any) => {
  return data?.getHotelAmenityDetails?.categories?.filter((category: any) => {
    return data?.getHotelAmenityDetails?.amenities?.find(
      (amenity: any) => amenity?.categoryIds?.includes(category?.id) && amenity?.isActive,
    );
  });
};

export const findModule = (moduleList: any, moduleActive: any) =>
  moduleList.find((module: any) => module?.code === moduleActive);

export const groupBy = (arrayToBeGrouped: any, property: string) => {
  return (
    arrayToBeGrouped?.length > 0 &&
    arrayToBeGrouped?.reduce(function (memo: any, x: any) {
      if (!memo[x[property]]) {
        memo[x[property]] = [];
      }
      memo[x[property]].push(x);
      return memo;
    }, {})
  );
};

export const serviceRequestArray = (
  selectedServiceRequests: any,
  houseKeepingOptionSelected?: any,
) => {
  const houseKeeping = activeItems(selectedServiceRequests?.houseKeeping);
  const concierge = activeItems(selectedServiceRequests?.concierge);
  const serviceArray: any = [
    {
      id: 'services',
      title: 'Housekeeping',
      carouselLabel: 'HouseKeeping',
      label: 'houseKeeping',
      isActive: houseKeeping?.length > 0 && true,
    },
    {
      id: 'concierge',
      title: 'Concierge',
      carouselLabel: 'Concierge',
      label: 'concierge',
      isActive: concierge?.length > 0 && true,
    },
  ].filter((item) => item?.isActive);

  serviceRequestOptionsArray(serviceArray);
  if (!houseKeepingOptionSelected) {
    housekeepingOptions(serviceArray[0]);
  }
};

export const timeExtract = (time: any) => {
  const data =
    time?.length > 0 &&
    time.map(function (appointment: any, index: any) {
      const totalMinutes = appointment?.startTime;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const formattedTime = hours + ':' + (minutes < 10 ? '0' : '') + minutes;
      appointment.displayTime = formattedTime;
      appointment.index = index;
      return appointment;
    });
  return data;
};

export const getHamburgerIcons = () => {
  const hamburgerMenuForPreCheckin: any = [
    {
      category: 'both',
      externalLink: '',
      flow: '',
      menuIconUrl: '',
      isActive: true,
      name: 'Language',
      pages: [''],
      redirectOptions: 'FLOW',
    },
  ];

  return hamburgerMenuForPreCheckin;
};

export const formatPrice = (value: any) =>
  Number(value)?.toLocaleString('en-US', { minimumFractionDigits: 2 });

export const formatPriceIRD = (price: number): string => {
  return Number(price) % 1 === 0
    ? price?.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : Number(price)?.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const emptyFunction = () => {};

export const fetchCharges = (reservationInfo: any) =>
  (reservationInfo?.details?.nightCount && reservationInfo?.details?.nightCount > 0
    ? reservationInfo?.details?.nightCount
    : 1) *
    1 +
  (reservationInfo?.roomTypes[0]?.totalCharge &&
    reservationInfo?.roomTypes[0]?.balance &&
    (Math.floor(
      Number(reservationInfo?.roomTypes[0]?.totalCharge) +
        Number(reservationInfo?.roomTypes[0]?.balance),
    ) > 0
      ? Math.floor(
          Number(reservationInfo?.roomTypes[0]?.totalCharge) +
            Number(reservationInfo?.roomTypes[0]?.balance),
        )
      : 0));

export const textFieldValidation = () => {
  return yup.string().matches(TEXTFIELD_REGEX, 'Please enter valid characters');
};

export const getCountryCode = (CountryName: string) =>
  Countries?.find((item: any) => item?.name?.toLowerCase() === CountryName?.toLowerCase())?.value ||
  '';
// Formats time from 24-hour format to minutes
export const getFormattedTime = (timeInMinutes: any) => {
  if (!timeInMinutes.includes(ALL_DAY)) {
    const timeArray = Array.isArray(timeInMinutes) ? timeInMinutes : [timeInMinutes];
    return timeArray.map((time) => {
      const [hours, minutes] = time && time.split(':').map(Number);
      return hours * 60 + minutes;
    });
  } else {
    return timeInMinutes;
  }
};

export const errorStateHandler = (
  reservationStatus: any,
  setLoading: (value: boolean) => void,
  t: (key: string) => string,
) => {
  const { title, description } = reservationStatusMessages[reservationStatus];

  notificationStorage({
    type: FAILURE,
    title: t(`${title}`),
    description: t(`${description}`),
    redirect: availablePaths?.HOME,
  });

  toggleNotification(true);
  toggleCheckInDetailsDrawer(false);
  setLoading(false);
};

// Returns opening and closing hour status
export const getTimeStatus = (
  currentTime: number,
  t: any,
  isDayFound: boolean,
  isOpen: number[],
  isClose: number[],
) => {
  let displayMessage = t('Closed');
  if (!currentTime || isNaN(currentTime)) return displayMessage;

  const isOpenSlot = isOpen.findIndex((openingTime: number, i: number) => {
    const closingTime = isClose[i];
    // Case 1: Normal opening/closing (same day)
    if (openingTime <= closingTime) {
      return openingTime <= currentTime && currentTime < closingTime;
    }
    // Case 2: Overnight opening (closing is on next day)
    return currentTime >= openingTime || currentTime < closingTime;
  });

  if (isOpenSlot !== -1 && isDayFound) {
    const closingTime = isClose[isOpenSlot];
    let remainingTime;

    // Handle overnight closing time
    if (closingTime < isOpen[isOpenSlot]) {
      remainingTime = (closingTime + 1440 - currentTime) % 1440;
    } else {
      remainingTime = closingTime - currentTime;
    }

    if (remainingTime <= 60 && remainingTime > 0) {
      displayMessage = t('Closes in', { value: remainingTime });
    } else {
      displayMessage = t('Open');
    }
    return displayMessage;
  }

  const nextOpeningSlot = isOpen.findIndex((openingTime: number, i: number) => {
    const timeUntilOpen = (openingTime - currentTime + 1440) % 1440;
    return timeUntilOpen > 0 && timeUntilOpen <= 60;
  });

  if (nextOpeningSlot !== -1 && isDayFound) {
    const minutesUntilOpen = (isOpen[nextOpeningSlot] - currentTime + 1440) % 1440;
    displayMessage = t('Opens in', { value: minutesUntilOpen });
  }

  return displayMessage;
};

// Return is day found
export const isDayFound = (openDays: any, today: any) =>
  openDays?.includes(EVERYDAY) || openDays?.includes(today);

export const updateFieldStatus = (data: any) => {
  if (!data || !data?.details) {
    return data;
  }
  const updatedDetails = data?.details.map((item: any) => {
    if (idVerificationFields?.includes(item?.name)) {
      return { ...item, isDisabled: true };
    }
    return item;
  });
  return {
    ...data,
    details: updatedDetails,
  };
};

export const getCurrentOpenPeriod = (hours: any) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const period of hours) {
    const [openHour, openMinute] = period.open.split(':').map(Number);
    const [closeHour, closeMinute] = period.close.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    const isOvernight = closeMinutes < openMinutes;

    const isOpenNow = !isOvernight
      ? currentMinutes >= openMinutes && currentMinutes < closeMinutes
      : currentMinutes >= openMinutes || currentMinutes < closeMinutes;

    if (isOpenNow) {
      return period;
    }
  }

  return null;
};

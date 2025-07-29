import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import styles from '@styles/activities/activity-details.module.scss';

import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { EMAILCAPS, ERRORMSG, FAILURE, PHONECAPS, SUCCESS, URL } from 'utils/constants';
import CustomCarousel from '../CustomCarousel/CustomCarousel';
import { PlusMinusInput } from '../PlusMinusInput/PlusMinusInput';
import { client } from 'core/graphql/client';
import { CREATE_ACTIVITY_BOOKING } from 'core/graphql/queries/CREATE_ACTIVITY_BOOKING';
import {
  notificationStorage,
  toggleNotification,
  bookingDate,
  toggleCheckInDetailsDrawer,
  toggleDetailsDrawer,
  isGetStarted,
  hotelLocation,
} from 'storage/home.storage';
import { PhoneEmail } from '../PhoneEmail/PhoneEmail';
import { CANCEL_ACTIVITY_BOOKING } from 'core/graphql/queries/CANCEL_ACTIVITY_BOOKING';
import { UPDATE_ACTIVITY_BOOKING } from 'core/graphql/queries/UPDATE_ACTIVITY_BOOKING';
import { useConfig } from 'utils/hooks/useConfiguration';
import dayjs from 'dayjs';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { timeFormats } from 'utils/timeFormats';
import { DateTimeRangeSelect } from '../DateTimeRangeSelect/DateTimeRangeSelect';
import {
  calculateDuration,
  convertTo12HourFormatSmallCase,
  getValidActivityDateRange,
  safeDateFormat,
} from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';
import { CustomDrawer } from '../CustomDrawer/CustomDrawer';
import { getTrips } from 'storage/trips.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import ClockIcon from '@icons/clockIcon.svg';
import Calender from '@icons/calendar.svg';
import User from '@icons/user.svg';
import Location from '@icons/location.svg';
import Pin from '@icons/pinLocation.svg';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import URLIcon from '@icons/url.svg';

export const ActivityDetailDrawer: React.FC<any> = ({
  closeDrawer,
  showSelectedActivity,
  modifyBookingFlow,
  setDrawerState,
  drawerstate,
  guestDetails,
  modifyActivityData,
  handleFetchActivities,
}) => {
  const { t } = useTranslation(['common']);
  const currentDate = dayjs().format('YYYY-MM-DD');
  const currentTime = dayjs().format('HH:mm');
  const [selectedTime, setSelectedTime] = useState(
    dayjs().format(timeFormats.DAY_MONTH_HOUR_MINUTE_AM_3),
  );
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;

  // const currency = useCurrency();

  const [selectedDate, setSelectedDate] = useState('');
  // const scheduleType = activitiesData?.getActivities[0]?.schedule?.scheduleType;
  const [selectedActivitySlots, setSelectedActivitySlots] = useState<any>(
    modifyActivityData?.slotId?.[1] && modifyActivityData?.slotId?.[2]
      ? {
          startTime: modifyActivityData?.slotId?.[1],
          endTime: modifyActivityData?.slotId?.[2],
          __typename: 'RecurringTimeSlots',
        }
      : null,
  );

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation?.data;
  const guestCount = modifyActivityData?.seats;

  const [duration, setDuration] = useState(30);
  const [activityBookingLoading, setActivityBookingLoading] = useState(false);
  const [cancelClick, setCancelClick] = useState(false);
  const [peopleCount, setPeopleCount] = useState(showSelectedActivity?.guests || 1);
  const [isNotificationActive, setIsNotificationActive] = useState(false);
  const checkInDrawerStatus = useReactiveVar(toggleDetailsDrawer);
  const scheduleType = showSelectedActivity?.schedule?.scheduleType;
  const config = useConfig();

  const checkedInData = getTrips();

  const location = useReactiveVar(hotelLocation);

  const handleIncrement = () => {
    const maxCapacity = showSelectedActivity?.capacity;

    if (maxCapacity === null || maxCapacity === undefined) {
      setPeopleCount((prev: number) => prev + 1);
      return;
    }

    if (peopleCount + 1 > maxCapacity) {
      notificationStorage({
        type: 'info',
        title: t('Guest Limit Reached'),
        description: t('The guest capacity for this activity has been reached.'),
      });
      toggleNotification(true);
    }

    if (peopleCount < maxCapacity) {
      setPeopleCount((prev: number) => prev + 1);
    }
  };

  const handleDecrement = () => {
    setPeopleCount((prev: number) => {
      const newCount = prev > 1 ? prev - 1 : prev;
      return newCount;
    });
  };

  useEffect(() => {
    setPeopleCount(showSelectedActivity?.guests || 1);
  }, [showSelectedActivity]);

  const formik = {
    isValid: true,
    dirty: true,
    handleSubmit: () => {
      setActivityBookingLoading(true);
      setTimeout(() => {
        alert('Slot booked!');
        setActivityBookingLoading(false);
      }, 1500);
    },
  };
  const handleSave = (date: string) => {
    scheduleType === 'RECURRING' ? setSelectedDate(date) : setSelectedTime(date);
  };

  const dummyTimeExtractedArray = showSelectedActivity?.schedule?.recurring?.recurringTimeSlots;

  const isTimeValid = () => {
    if (!selectedTime) return false;
    const now = dayjs();
    const selectedDateTime = dayjs(selectedTime, 'YYYY-MM-DD hh:mm A');
    return selectedDateTime.isSameOrAfter(now);
  };
  // Prefill form fields when in modify mode
  useEffect(() => {
    if (modifyBookingFlow && showSelectedActivity) {
      setPeopleCount(modifyActivityData?.seats);
      const scheduleType = showSelectedActivity?.schedule?.scheduleType;

      if (scheduleType === 'RECURRING') {
        // Format date correctly before setting
        const formattedDate = dayjs(modifyActivityData?.startDate).format('YYYY-MM-DD');
        setSelectedDate(formattedDate);

        const fromTime = modifyActivityData?.startTime;
        if (fromTime && dummyTimeExtractedArray?.length > 0) {
          const matchingSlot = dummyTimeExtractedArray.find(
            (slot: any) => slot.displayTime === fromTime,
          );
          if (matchingSlot) {
            setSelectedActivitySlots(matchingSlot);
          }
        }
      } else if (scheduleType === 'ALWAYS_ACTIVE') {
        setPeopleCount(modifyActivityData?.seats);
        setSelectedDate(modifyActivityData?.startDate);
        const combinedTime = `${
          modifyActivityData?.startDate
        } ${modifyActivityData?.startTime?.toUpperCase()}`;
        setSelectedTime(combinedTime);
        setDuration(calculateDuration(modifyActivityData?.startTime, modifyActivityData?.endTime));
      } else if (scheduleType === 'ONE_TIME') {
        setPeopleCount(modifyActivityData?.seats);
      }
    }
  }, [
    modifyBookingFlow,
    showSelectedActivity,
    dummyTimeExtractedArray,
    modifyActivityData?.seats,
    modifyActivityData?.startDate,
    modifyActivityData?.startTime,
    modifyActivityData?.endTime,
  ]);

  useEffect(() => {
    const checkNotificationState = () => {
      try {
        const currentNotification = notificationStorage();
        setIsNotificationActive(!!currentNotification);
      } catch (error) {
        setIsNotificationActive(false);
      }
    };

    checkNotificationState();

    const interval = setInterval(checkNotificationState, 100);

    return () => clearInterval(interval);
  }, []);

  const activityBookingId = modifyActivityData?.activityBookingId;
  const slotId = modifyActivityData?.slotIdData;

  const handleActivityBooking = useCallback(async () => {
    const activityPayload = {
      hotelId: config.hotelId,
      activityId: showSelectedActivity?.id,
      categoryId: showSelectedActivity?.categoryId,
      confirmationId: checkedInData?.reservationId || reservationInfo?.reservationId,
      room: checkedInData?.roomNumber || reservationInfo?.roomTypes?.[0]?.roomNumber,
      firstName: checkedInData?.firstName || reservationInfo?.details?.contactPerson?.firstName,
      lastName: checkedInData?.lastName || reservationInfo?.details?.contactPerson?.lastName,
      seats: peopleCount,
      date:
        scheduleType === 'RECURRING'
          ? dayjs(selectedDate, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD')
          : scheduleType === 'ONE_TIME'
          ? dayjs(showSelectedActivity?.schedule?.oneTime?.date, 'DD-MM-YYYY').format('YYYY-MM-DD')
          : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD'),
      fromTime:
        scheduleType === 'RECURRING'
          ? selectedActivitySlots?.startTime
          : scheduleType === 'ONE_TIME'
          ? showSelectedActivity?.schedule?.startTime
          : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').format('HH:mm'),
      toTime:
        scheduleType === 'RECURRING'
          ? selectedActivitySlots?.endTime
          : scheduleType === 'ONE_TIME'
          ? showSelectedActivity?.schedule?.endTime
          : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').add(duration, 'minutes').format('HH:mm'),
      arrivalDate: checkedInData?.checkInDate,
      departureDate: checkedInData?.checkOutDate,
    };

    setActivityBookingLoading(true);
    bookingDate(activityPayload?.date);

    try {
      const { data } = await client.mutate({
        mutation: CREATE_ACTIVITY_BOOKING,
        context: { clientName: 'integration_k' },
        fetchPolicy: 'network-only',
        variables: activityPayload,
      });

      const message =
        data?.createActivityBooking?.message === 'the booking is now on the waitinglist'
          ? true
          : false;

      notificationStorage({
        type: SUCCESS,
        title: message ? (t('You are on the waitlist') as string) : (t('Thank You!') as string),
        description: message
          ? (t('We will let you know if a spot becomes available for this activity') as string)
          : (t('Your booking has been confirmed.') as string),
        redirect: availablePaths.ITINERARY,
      });

      setIsNotificationActive(true);
      toggleNotification(true);
      setTimeout(() => {
        closeDrawer();
      }, 4000);
    } catch (err) {
      let errorMessage = t('Your booking was not received.') as string;
      let errorTitle = ERRORMSG as string;

      if (err instanceof ApolloError) {
        const graphQLErrors = err.graphQLErrors || [];
        const errorMessageRaw = err.message.toLowerCase();

        const slotFilled = graphQLErrors.some((e) =>
          e.message.toLowerCase().includes('slot is filled'),
        );

        const seatLimitError = graphQLErrors.some((e) =>
          e.message.toLowerCase().includes('select fewer seats'),
        );

        const inHouseGuestOnlyError =
          graphQLErrors.some((e) =>
            e.message.toLowerCase().includes('limited to in-house guests'),
          ) || errorMessageRaw.includes('limited to in-house guests');
        const waitlistFullError =
          graphQLErrors.some((e) =>
            e.message.toLowerCase().includes('unable to complete the activity booking.'),
          ) || errorMessageRaw.includes('unable to complete the activity booking.');
        if (slotFilled) {
          errorTitle =
            scheduleType === 'ONE_TIME' ? (t('Sorry!') as string) : (t('Slot is Filled') as string);
          errorMessage =
            scheduleType === 'ONE_TIME'
              ? (t(
                  'This activity is currently unavailable. Feel free to explore other activities.',
                ) as string)
              : (t(
                  'The selected time slot is already booked. Please choose another slot.',
                ) as string);
        } else if (seatLimitError) {
          const match = errorMessageRaw.match(/remaining:\s*(\d+)/);
          const remainingSeats = match ? parseInt(match[1], 10) : 1;

          errorTitle = t('Limited Seats Remaining in Waitlist') as string;
          errorMessage = t(
            `Only ${remainingSeats} seat${
              remainingSeats === 1 ? '' : 's'
            } are available. Please lower the guest count to continue.`,
          ) as string;
        } else if (inHouseGuestOnlyError) {
          errorTitle = t('Available to Staying Guests Only') as string;
          errorMessage = t(
            'This activity is exclusively available to guests currently staying with us.',
          ) as string;
        } else if (waitlistFullError) {
          errorTitle = t('Waitlist is currently full') as string;
          errorMessage = t(
            'This activity and its waitlist are currently at full capacity. Please check back later for availability.',
          ) as string;
        }
      }

      notificationStorage({
        type: FAILURE,
        title: errorTitle,
        description: errorMessage,
        // redirect: availablePaths.ITINERARY,
      });
    } finally {
      setActivityBookingLoading(false);
    }
    setIsNotificationActive(true);
    toggleNotification(true);
  }, [
    config?.hotelId,
    showSelectedActivity?.id,
    showSelectedActivity?.categoryId,
    showSelectedActivity?.schedule?.oneTime?.date,
    showSelectedActivity?.schedule?.startTime,
    showSelectedActivity?.schedule?.endTime,
    checkedInData?.reservationId,
    checkedInData?.roomNumber,
    checkedInData?.firstName,
    checkedInData?.lastName,
    checkedInData?.checkInDate,
    checkedInData?.checkOutDate,
    reservationInfo?.reservationId,
    reservationInfo?.roomTypes,
    reservationInfo?.details?.contactPerson?.firstName,
    reservationInfo?.details?.contactPerson?.lastName,
    peopleCount,
    scheduleType,
    selectedDate,
    selectedTime,
    selectedActivitySlots,
    duration,
    t,
    closeDrawer,
  ]);

  const handleUpdateActivityBooking = async () => {
    const formattedDate =
      scheduleType === 'RECURRING'
        ? safeDateFormat(selectedDate, 'YYYY-MM-DD') // assuming selectedDate is ISO
        : scheduleType === 'ONE_TIME'
        ? safeDateFormat(showSelectedActivity?.schedule?.oneTime?.date, 'DD-MM-YYYY')
        : safeDateFormat(selectedTime, 'YYYY-MM-DD HH:mm');

    const fromTime =
      scheduleType === 'RECURRING'
        ? selectedActivitySlots?.startTime
        : scheduleType === 'ONE_TIME'
        ? showSelectedActivity?.schedule?.startTime
        : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').format('HH:mm');
    const toTime =
      scheduleType === 'RECURRING'
        ? selectedActivitySlots?.endTime
        : scheduleType === 'ONE_TIME'
        ? showSelectedActivity?.schedule?.endTime
        : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').add(duration, 'minutes').format('HH:mm');

    const slotIdData = `${formattedDate}#${fromTime}#${toTime}`;

    const activityPayload = {
      hotelId: config?.hotelId,
      activityId: showSelectedActivity?.id,
      slotId: slotIdData,
      activityBookingId: activityBookingId,
      confirmationId:
        guestDetails?.reservationId ||
        checkedInData?.reservationId ||
        reservationInfo?.reservationId,
      room:
        guestDetails?.roomNo ||
        checkedInData?.roomNumber ||
        reservationInfo?.roomTypes?.[0]?.roomNumber,
      firstName:
        guestDetails?.firstName ||
        checkedInData?.firstName ||
        reservationInfo?.details?.contactPerson?.firstName,
      lastName:
        guestDetails?.lastName ||
        checkedInData?.lastName ||
        reservationInfo?.details?.contactPerson?.lastName,
      seats: peopleCount,
    };
    setActivityBookingLoading(true);

    try {
      const { data } = await client.mutate({
        mutation: UPDATE_ACTIVITY_BOOKING,
        context: { clientName: 'integration_k' },
        fetchPolicy: 'no-cache',
        variables: activityPayload,
      });

      const message =
        data?.createActivityBooking?.message === 'the booking is now on the waitinglist'
          ? true
          : false;

      notificationStorage({
        type: SUCCESS,
        title: message ? (t('You are on the waitlist') as string) : (t('Thank You!') as string),
        description: message
          ? (t('We will let you know if a spot becomes available for this activity') as string)
          : (t('Your booking has been updated.') as string),
        redirect: availablePaths.ITINERARY,
      });

      setIsNotificationActive(true);
      toggleNotification(true);

      setTimeout(() => {
        closeDrawer();
        handleFetchActivities && handleFetchActivities();
        setIsNotificationActive(false);
      }, 4000);
      // bookingDate(dayjs(formattedDate, 'YYYYMMDD').format('YYYY-MM-DD'));
    } catch (err) {
      let errorMessage = t('Your booking was not received.') as string;
      let errorTitle = ERRORMSG as string;

      if (err instanceof ApolloError) {
        const graphQLErrors = err.graphQLErrors || [];
        const errorMessageRaw = err.message.toLowerCase();

        const slotFilled = graphQLErrors.some((e) =>
          e.message.toLowerCase().includes('slot is filled'),
        );
        const seatLimitError = graphQLErrors.some(
          (e) =>
            e.message.toLowerCase().includes('select fewer seats') ||
            e.message.toLowerCase().includes('you can update seat upto'),
        );
        const inHouseGuestOnlyError =
          graphQLErrors.some((e) =>
            e.message.toLowerCase().includes('limited to in-house guests'),
          ) || errorMessageRaw.includes('limited to in-house guests');

        const waitlistFullError =
          graphQLErrors.some((e) =>
            e.message.toLowerCase().includes('unable to complete the activity booking.'),
          ) || errorMessageRaw.includes('unable to complete the activity booking.');

        if (slotFilled) {
          errorTitle =
            scheduleType === 'ONE_TIME' ? (t('Sorry!') as string) : (t('Slot is Filled') as string);
          errorMessage =
            scheduleType === 'ONE_TIME'
              ? (t(
                  'This activity is currently unavailable. Feel free to explore other activities.',
                ) as string)
              : (t(
                  'The selected time slot is already booked. Please choose another slot.',
                ) as string);
        } else if (seatLimitError) {
          const match = errorMessageRaw.match(/remaining:\s*(\d+)/);
          const remainingSeats = match ? parseInt(match[1], 10) : 1;
          errorTitle = t('Limited Seats Remaining') as string;
          errorMessage = t(
            `Only ${remainingSeats} seat${
              remainingSeats === 1 ? '' : 's'
            } are available. Please lower the guest count to continue.`,
          ) as string;
        } else if (inHouseGuestOnlyError) {
          errorTitle = t('Available to Staying Guests Only') as string;
          errorMessage = t(
            'This activity is exclusively available to guests currently staying with us.',
          ) as string;
        } else if (waitlistFullError) {
          errorTitle = t('Waitlist is currently full') as string;
          errorMessage = t(
            'This activity and its waitlist are currently at full capacity. Please check back later for availability.',
          ) as string;
        }
      }

      notificationStorage({
        type: FAILURE,
        title: errorTitle,
        description: errorMessage,
        // redirect: availablePaths.ITINERARY,
      });
    }
    setIsNotificationActive(true);
    toggleNotification(true);
    setActivityBookingLoading(false);
  };

  const handleActivityCancelBooking = useCallback(async () => {
    const formattedDate =
      scheduleType === 'RECURRING'
        ? safeDateFormat(selectedDate, 'YYYY-MM-DD') // assuming selectedDate is ISO
        : scheduleType === 'ONE_TIME'
        ? safeDateFormat(showSelectedActivity?.schedule?.oneTime?.date, 'DD-MM-YYYY')
        : safeDateFormat(selectedTime, 'YYYY-MM-DD HH:mm');

    bookingDate(dayjs(formattedDate, 'YYYYMMDD').format('YYYY-MM-DD'));

    const fromTime =
      scheduleType === 'RECURRING'
        ? selectedActivitySlots?.startTime
        : scheduleType === 'ONE_TIME'
        ? showSelectedActivity?.schedule?.startTime
        : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').format('HH:mm');
    const toTime =
      scheduleType === 'RECURRING'
        ? selectedActivitySlots?.endTime
        : scheduleType === 'ONE_TIME'
        ? showSelectedActivity?.schedule?.endTime
        : dayjs(selectedTime, 'YYYY-MM-DD hh:mm A').add(duration, 'minutes').format('HH:mm');

    const slotIdData = `${formattedDate}#${fromTime}#${toTime}`;

    const activityPayload = {
      hotelId: config.hotelId,
      activityBookingId: activityBookingId,
      slotId: slotIdData,
      lastName:
        guestDetails?.lastName ||
        checkedInData?.lastName ||
        reservationInfo?.details?.contactPerson?.lastName,
      confirmationId:
        guestDetails?.reservationId ||
        checkedInData?.reservationId ||
        reservationInfo?.reservationId,
      room:
        guestDetails?.roomNo ||
        checkedInData?.roomNumber ||
        reservationInfo?.roomTypes?.[0]?.roomNumber,
    };
    setActivityBookingLoading(true);

    try {
      await client.mutate({
        mutation: CANCEL_ACTIVITY_BOOKING,
        context: { clientName: 'integration_k' },
        fetchPolicy: 'network-only',
        variables: activityPayload,
      });

      notificationStorage({
        type: SUCCESS,
        title: t('Thank You!') as string,
        description: t('Your booking has been cancelled.') as string,
        redirect: availablePaths.ITINERARY,
      });

      setIsNotificationActive(true);
      setTimeout(() => {
        closeDrawer();
        handleFetchActivities && handleFetchActivities();
        setIsNotificationActive(false);
      }, 4000);
    } catch (err) {
      notificationStorage({
        type: FAILURE,
        title: ERRORMSG as string,
        description: t('Your booking was not received.') as string,
        redirect: availablePaths.ITINERARY,
      });
    }

    setIsNotificationActive(true);
    toggleNotification(true);
    setActivityBookingLoading(false);
  }, [
    scheduleType,
    selectedDate,
    showSelectedActivity?.schedule?.oneTime?.date,
    showSelectedActivity?.schedule?.startTime,
    showSelectedActivity?.schedule?.endTime,
    selectedTime,
    selectedActivitySlots?.startTime,
    selectedActivitySlots?.endTime,
    duration,
    config.hotelId,
    activityBookingId,
    guestDetails?.lastName,
    guestDetails?.reservationId,
    guestDetails?.roomNo,
    checkedInData?.lastName,
    checkedInData?.reservationId,
    checkedInData?.roomNumber,
    reservationInfo?.details?.contactPerson?.lastName,
    reservationInfo?.reservationId,
    reservationInfo?.roomTypes,
    t,
    closeDrawer,
    handleFetchActivities,
  ]);

  const handleDrawerState = () => {
    setDrawerState('Booking');
  };

  const validDateRange = getValidActivityDateRange(
    checkedInData?.checkInDate,
    checkedInData?.checkOutDate,
    showSelectedActivity?.schedule?.recurring?.startDate,
    showSelectedActivity?.schedule?.recurring?.endDate,
  );

  const isInvalidSelectedSlot = useMemo(() => {
    if (!selectedActivitySlots) return true;

    const selectedDateDayjs = dayjs(selectedDate, 'YYYY-MM-DD hh:mm A');
    const isToday = selectedDateDayjs.isSame(dayjs(), 'day');

    const startTime = dayjs(selectedActivitySlots.startTime, 'HH:mm');
    const currentTimeDayjs = dayjs();

    // Check if it's today and the time has already passed
    return isToday && startTime.isBefore(currentTimeDayjs);
  }, [selectedActivitySlots, selectedDate]);

  const isValidRecurringDate = (recurring: any, selectedDateStr: string): boolean => {
    // Helper to safely parse DD-MM-YYYY → Date
    const parseDate = (dateStr: string | undefined): Date | null => {
      if (!dateStr) return null;

      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;

      const [day, month, year] = parts.map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    };

    // Parse recurring dates like ["18,10"] → [18, 10]
    const dates =
      recurring?.dates?.reduce((acc: number[], str: string) => {
        return [...acc, ...str.split(',').map((d) => parseInt(d.trim(), 10))];
      }, []) ?? [];

    // Parse start/end dates
    const startDate = parseDate(recurring?.startDate);
    const endDate = parseDate(recurring?.endDate);

    // Parse selected date and ignore time
    const selectedDate = dayjs(selectedDateStr, 'YYYY-MM-DD hh:mm A').toDate();
    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    // Validate required dates
    if (!startDate || !endDate) {
      console.warn('Start or end date is invalid or missing');
      return false;
    }

    // Check if selected date is out of range
    if (selectedDateOnly < startDate || selectedDateOnly > endDate) {
      return false;
    }

    // Get day of month
    const selectedDay = selectedDateOnly.getDate();

    // Return true only if selected day is NOT in excluded dates
    return !dates.includes(selectedDay);
  };

  return (
    <div className={cx({ [styles.blurred]: isNotificationActive })}>
      {drawerstate === 'Booking'
        ? showSelectedActivity && (
            <>
              {showSelectedActivity?.images?.length > 0 && (
                <CustomCarousel imageData={showSelectedActivity} />
              )}
              <div className={styles.wrapper}>
                {showSelectedActivity?.name && (
                  <p className={styles.title}>{showSelectedActivity.name}</p>
                )}

                {scheduleType === 'ALWAYS_ACTIVE' && (
                  <>
                    <div className={styles.plusMinusWrapper}>
                      <p className={styles.subtitle}>{t('No. of people')}</p>
                      <PlusMinusInput
                        value={peopleCount}
                        onClickMinus={handleDecrement}
                        onClickPlus={handleIncrement}
                        minQuantity={1}
                        maxQuantity={showSelectedActivity?.capacity}
                        className={styles.plusMinus}
                      />
                    </div>
                    <DateTimeRangeSelect
                      loading={false}
                      setSelectedTime={setSelectedTime}
                      selectedTime={selectedTime}
                      handleSave={handleSave}
                      dateRange={`${
                        checkedInData?.checkInDate > currentDate
                          ? checkedInData?.checkInDate
                          : currentDate
                      } - ${checkedInData?.checkOutDate}`}
                      startTime={`${currentTime}`}
                      buttonStyle={styles.recurringWrapper}
                      hideTime={false}
                      scheduleType={scheduleType}
                    />
                    <div className={styles.horizontalLine}></div>
                    <div className={styles.plusMinusWrapper}>
                      <p className={styles.subtitle}>{t('Duration')}</p>
                      <PlusMinusInput
                        value={duration}
                        onClickMinus={() => setDuration((prev) => Math.max(15, prev - 15))}
                        onClickPlus={() => setDuration((prev) => Math.min(180, prev + 15))}
                        minQuantity={15}
                        maxQuantity={180}
                        className={styles.plusMinus}
                      />
                    </div>
                    <StyledButton
                      className={styles.slotBookingButton}
                      disabled={
                        !(formik.isValid && formik.dirty) ||
                        !selectedTime ||
                        activityBookingLoading ||
                        !isTimeValid()
                      }
                      onClick={
                        !modifyBookingFlow ? handleActivityBooking : handleUpdateActivityBooking
                      }
                      loading={activityBookingLoading}
                    >
                      {t('Confirm Booking')}
                    </StyledButton>
                  </>
                )}

                {scheduleType === 'RECURRING' && (
                  <>
                    <div className={styles.plusMinusWrapper}>
                      <p className={styles.subtitle}>No. of people</p>
                      <PlusMinusInput
                        value={peopleCount}
                        onClickMinus={handleDecrement}
                        onClickPlus={handleIncrement}
                        minQuantity={1}
                        maxQuantity={showSelectedActivity?.capacity}
                        className={styles.plusMinus}
                      />
                    </div>

                    {/* DateTimeRangeSelect */}
                    <DateTimeRangeSelect
                      loading={false}
                      setSelectedTime={setSelectedDate}
                      selectedTime={
                        selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD hh:mm A') : undefined
                      }
                      handleSave={(dateString) => {
                        setSelectedDate(dayjs(dateString).format('YYYY-MM-DD'));
                      }}
                      dateRange={validDateRange}
                      buttonTitle='Confirm Booking'
                      buttonStyle={styles.recurringWrapper}
                      hideTime={true}
                      scheduleType={scheduleType}
                    />

                    <div className={styles.horizontalLine}></div>

                    {/* Time Slots */}
                    <div className={styles.slotsButtonwrapper}>
                      <p className={styles.subtitle}>{t('Available Time Slots')}</p>
                      {dummyTimeExtractedArray.map((timeExt: any, index: any) => {
                        const selectedDateDayjs = dayjs(selectedDate, 'YYYY-MM-DD hh:mm A');
                        const isToday = selectedDateDayjs.isSame(dayjs(), 'day');

                        const startTime = dayjs(timeExt.startTime, 'HH:mm');
                        const currentTimeDayjs = dayjs();

                        const formattedStart = startTime.format('hh:mm A');
                        const formattedEnd = dayjs(timeExt.endTime, 'HH:mm').format('hh:mm A');

                        const isSelected =
                          selectedActivitySlots?.startTime === timeExt.startTime &&
                          selectedActivitySlots?.endTime === timeExt.endTime;

                        return (
                          <StyledButton
                            key={index}
                            className={styles.sloteButton}
                            onClick={() => setSelectedActivitySlots(timeExt)}
                            variant={isSelected ? 'contained' : 'outlined'}
                            disabled={isToday && startTime.isBefore(currentTimeDayjs)}
                          >
                            {`${formattedStart} - ${formattedEnd}`}
                          </StyledButton>
                        );
                      })}
                    </div>

                    {/* Confirm Booking Button */}
                    <StyledButton
                      className={styles.slotBookingButton}
                      disabled={
                        !(formik.isValid && formik.dirty) ||
                        !selectedActivitySlots ||
                        activityBookingLoading ||
                        (showSelectedActivity?.schedule?.recurring?.recursWeek?.filter(
                          (item: any) => item.trim() !== '',
                        ).length > 0 &&
                          !showSelectedActivity?.schedule?.recurring?.recursWeek?.includes(
                            dayjs(selectedDate, 'YYYY-MM-DD hh:mm A').format('dddd').toUpperCase(),
                          )) ||
                        (showSelectedActivity?.schedule?.recurring?.dates?.filter(
                          (item: any) => item.trim() !== '',
                        ).length > 0 &&
                          isValidRecurringDate(
                            showSelectedActivity?.schedule?.recurring,
                            selectedDate,
                          )) ||
                        isInvalidSelectedSlot
                      }
                      onClick={
                        !modifyBookingFlow ? handleActivityBooking : handleUpdateActivityBooking
                      }
                      loading={activityBookingLoading}
                    >
                      {t('Confirm Booking')}
                    </StyledButton>
                  </>
                )}

                {scheduleType === 'ONE_TIME' && (
                  <div className={styles.plusMinusWrapper}>
                    <p className={styles.subtitle}>{t('No. of people')}</p>
                    <PlusMinusInput
                      value={peopleCount}
                      onClickMinus={handleDecrement}
                      onClickPlus={handleIncrement}
                      minQuantity={1}
                      maxQuantity={showSelectedActivity?.capacity}
                      className={styles.plusMinus}
                    />
                    <StyledButton
                      className={styles.slotBookingButton}
                      disabled={
                        !(formik.isValid && formik.dirty) || !peopleCount || activityBookingLoading
                      }
                      onClick={
                        !modifyBookingFlow ? handleActivityBooking : handleUpdateActivityBooking
                      }
                      loading={activityBookingLoading}
                    >
                      {t('Confirm Booking')}
                    </StyledButton>
                  </div>
                )}
              </div>
            </>
          )
        : showSelectedActivity && (
            <>
              {showSelectedActivity?.images?.length > 0 && (
                <CustomCarousel imageData={showSelectedActivity} />
              )}
              <div className={styles.wrapper}>
                {showSelectedActivity?.name && (
                  <p className={styles.title}>{showSelectedActivity?.name}</p>
                )}
                {modifyActivityData?.status === 'WaitingList' && modifyBookingFlow && (
                  <p className={styles.waitlistDesc}>
                    {'You are currently on the waitlist for this activity.'}
                    <br />
                    {'We will reach out if a slot becomes available'} <br />
                    {'before your scheduled time.'}
                  </p>
                )}
                {showSelectedActivity?.activityLocation && (
                  <>
                    {showSelectedActivity.activityLocation.locationType === 'EXTERNAL' && (
                      <div className={styles.location}>
                        <Location />
                        <p className={styles.locationDescription}>
                          {showSelectedActivity.activityLocation.addressLine1}{' '}
                          {showSelectedActivity.activityLocation.addressLine2 && (
                            <>
                              {showSelectedActivity.activityLocation.addressLine2}
                              <br />
                            </>
                          )}
                          {showSelectedActivity.activityLocation.city}
                        </p>
                      </div>
                    )}

                    {showSelectedActivity.activityLocation.locationType === 'URL' && (
                      <div className={styles.location}>
                        <a
                          aria-label={`${t('URL')}`}
                          href={showSelectedActivity.activityLocation.url}
                          className={styles.urlRow}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <URLIcon className={styles.check} />
                          <span className={styles.icon_contact}>
                            {showSelectedActivity.activityLocation.urlTitle || 'URL'}
                          </span>
                        </a>
                      </div>
                    )}

                    {showSelectedActivity.activityLocation.locationType === 'HOTEL' &&
                      showSelectedActivity.activityLocation.hotelLocation &&
                      location.find(
                        (loc: any) =>
                          loc?.id === showSelectedActivity.activityLocation.hotelLocation,
                      ) && (
                        <div className={styles.location}>
                          <Pin />
                          <p className={styles.locationDescription}>
                            {
                              location.find(
                                (loc: any) =>
                                  loc?.id === showSelectedActivity.activityLocation.hotelLocation,
                              )?.name
                            }
                          </p>
                        </div>
                      )}
                  </>
                )}
                {guestCount && modifyBookingFlow && (
                  <p className={styles.guestCount}>
                    <User />
                    <span className={styles.userIcon}>{guestCount}.nos</span>
                  </p>
                )}
                <div className={styles.dateAndTime}>
                  {modifyBookingFlow && (
                    <p className={styles.descriptiontext}>
                      <Calender />
                      <span className={styles.icons}>
                        {dayjs(modifyActivityData?.startDate).format('D MMMM YYYY')}
                      </span>
                    </p>
                  )}
                  {modifyBookingFlow && (
                    <p className={styles.descriptiontext}>
                      <ClockIcon />
                      <span className={styles.icons}>
                        {convertTo12HourFormatSmallCase(modifyActivityData?.startTime)} to{' '}
                        {convertTo12HourFormatSmallCase(modifyActivityData?.endTime)}
                      </span>
                    </p>
                  )}
                </div>
                <div className={styles.dateAndTime}>
                  {showSelectedActivity?.schedule?.scheduleType === 'ONE_TIME' &&
                    showSelectedActivity?.schedule?.oneTime?.date &&
                    !modifyBookingFlow && (
                      <p className={styles.descriptiontext}>
                        <Calender />
                        <span className={styles.icons}>
                          {dayjs(
                            showSelectedActivity?.schedule?.oneTime?.date,
                            'DD-MM-YYYY',
                          ).format('D MMMM YYYY')}
                        </span>
                      </p>
                    )}
                  {showSelectedActivity?.schedule?.startTime &&
                    showSelectedActivity?.schedule?.endTime &&
                    !modifyBookingFlow && (
                      <p className={styles.descriptiontext}>
                        <ClockIcon />
                        <span className={styles.icons}>
                          {convertTo12HourFormatSmallCase(showSelectedActivity.schedule.startTime)}{' '}
                          to {convertTo12HourFormatSmallCase(showSelectedActivity.schedule.endTime)}
                        </span>
                      </p>
                    )}
                </div>
                <PhoneEmail
                  phone={
                    showSelectedActivity?.information?.find((e: any) => e?.type === PHONECAPS)
                      ?.phone
                  }
                  phoneDisplayTitle={
                    showSelectedActivity?.information?.find((e: any) => e?.type === PHONECAPS)
                      ?.displayTitle
                  }
                  email={
                    showSelectedActivity?.information?.find((e: any) => e?.type === EMAILCAPS)
                      ?.email
                  }
                  emailDisplayTitle={
                    showSelectedActivity?.information?.find((e: any) => e?.type === EMAILCAPS)
                      ?.displayTitle
                  }
                  url={showSelectedActivity?.information?.find((e: any) => e?.type === URL)?.URL}
                  urlDisplayTitle={
                    showSelectedActivity?.information?.find((e: any) => e?.type === URL)
                      ?.displayTitle
                  }
                />
                {showSelectedActivity?.location && (
                  <p className={styles.description}>{showSelectedActivity?.location}</p>
                )}
                {showSelectedActivity?.description && (
                  <p className={styles.description}>{showSelectedActivity?.description}</p>
                )}
                {showSelectedActivity?.highlights && (
                  <p className={styles.highlights}>{showSelectedActivity?.highlights}</p>
                )}
                {showSelectedActivity?.isActive && !modifyBookingFlow && (
                  <StyledButton
                    variant='contained'
                    className={cx(styles.buttonCTA, 'globals-actionCtaWrapper')}
                    color='primary'
                    onClick={() => {
                      if (checkedInData?.reservationId || checkedInData?.roomNumber) {
                        handleDrawerState();
                      } else {
                        toggleDetailsDrawer(false);
                        toggleCheckInDetailsDrawer(true);
                        isGetStarted(true);
                      }
                    }}
                    disabled={
                      showSelectedActivity?.schedule?.scheduleType === 'ONE_TIME' &&
                      dayjs().isAfter(
                        dayjs(showSelectedActivity.schedule.oneTime.date, 'DD-MM-YYYY')
                          .hour(dayjs(showSelectedActivity.schedule.endTime, 'HH:mm').hour())
                          .minute(dayjs(showSelectedActivity.schedule.endTime, 'HH:mm').minute()),
                      )
                    }
                  >
                    {t('Book Now')}
                  </StyledButton>
                )}
                {modifyBookingFlow && (
                  <div className={cx({ [styles.blurred]: isNotificationActive })}>
                    <div className={cx(styles.buttonWrapper, 'globals-actionCtaWrapper')}>
                      <StyledButton
                        variant='outlined'
                        className={cx(styles.button, 'globals-actionCtaWrapper')}
                        color='primary'
                        onClick={() => setCancelClick(true)}
                        loading={activityBookingLoading}
                      >
                        {t('CANCEL')}
                      </StyledButton>

                      <StyledButton
                        variant='outlined'
                        className={cx(styles.button, 'globals-actionCtaWrapper')}
                        color='primary'
                        onClick={handleDrawerState}
                        loading={activityBookingLoading}
                      >
                        {t('MODIFY')}
                      </StyledButton>
                    </div>

                    {cancelClick && (
                      <CustomDrawer
                        open={cancelClick}
                        content={
                          <div className={cx({ [styles.blurred]: isNotificationActive })}>
                            <div className={styles.cancelWrapper}>
                              <p className={styles.title}>Cancel Activity ?</p>
                              <p className={styles.description}>
                                Your activity will be removed from your itinerary.
                                <br />
                                {t('Do you want to continue?')}
                              </p>
                              <div
                                className={cx(
                                  styles.buttonCancelWrapper,
                                  'globals-actionCtaWrapper',
                                )}
                              >
                                <StyledButton
                                  variant='outlined'
                                  className={cx(styles.cancelButton, 'globals-actionCtaWrapper')}
                                  color='primary'
                                  onClick={() => setCancelClick(false)}
                                  disabled={activityBookingLoading}
                                >
                                  {t('NO')}
                                </StyledButton>
                                <StyledButton
                                  variant='outlined'
                                  className={cx(styles.cancelButton, 'globals-actionCtaWrapper')}
                                  color='primary'
                                  onClick={handleActivityCancelBooking}
                                  loading={activityBookingLoading}
                                >
                                  {t('YES')}
                                </StyledButton>
                              </div>
                            </div>
                          </div>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
    </div>
  );
};

import { makeVar, useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { getTrips } from './trips.storage';
import { STEPPER_CHECK_IN, STEPPER_PAYMENT, STEPPER_REVIEW } from 'utils/constants';
import { useConfig } from 'utils/hooks/useConfiguration';

export interface ICheckinStorageData {
  reservationId?: any;
  preCheckedIn?: boolean;
  checkedIn: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  roomNumber?: string;
  invoiceId?: string;
  currency?: string;
  hotelId?: string;
  checkOutDate?: string;
  checkInDate?: string;
}

export const checkinStorage = makeVar<ICheckinStorageData>({
  checkedIn: false,
  preCheckedIn: false,
});

export const useCheckedIn = () => {
  const config = useConfig();
  const hotelId = config?.hotelId;
  const checkinData = useReactiveVar(checkinStorage);

  useEffect(() => {
    const reservations = getTrips();

    if (reservations && reservations?.checkedIn && reservations?.hotelId === hotelId) {
      checkinStorage({
        reservationId: reservations?.reservationId, // confirmationId or uniqueBookingId
        preCheckedIn: reservations?.preCheckedIn,
        checkedIn: reservations?.checkedIn ?? false,
        firstName: reservations?.firstName,
        lastName: reservations?.lastName,
        email: reservations?.email,
        phoneNumber: reservations?.phoneNumber,
        roomNumber: reservations?.roomNumber,
        invoiceId: reservations?.invoiceId, // reservationId
        hotelId: hotelId,
        checkInDate: reservations?.checkInDate,
        checkOutDate: reservations?.checkOutDate,
      });
    }
  }, [hotelId]);

  return checkinData;
};

export const StepperInformationStorage = makeVar<any>([
  { value: 60, label: 1, title: STEPPER_REVIEW },
  { value: 0, label: 2, title: STEPPER_PAYMENT },
  { value: 0, label: 3, title: STEPPER_CHECK_IN },
]);

export const profileIDStorage = makeVar<any>({ id: '', guestType: '' });

export const activeCheckInFlow = makeVar<boolean>(true); // true for check-in flow, false for Connect to Room flow

export const activeCheckOutFlow = makeVar<boolean>(false);

export const reviewSignAndCheckBox = makeVar<any>({ checkBox: false, sign: null });

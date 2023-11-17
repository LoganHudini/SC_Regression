import { makeVar, useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { getTrips } from './trips.storage';
import { STEPPER_CHECK_IN, STEPPER_PAYMENT, STEPPER_REVIEW } from 'utils/constants';

interface ICheckinStorageData {
  reservationId?: any;
  preCheckedIn?: boolean;
  checkedIn: boolean;
  name?: string;
  email?: string;
  roomNumber?: string;
  invoiceId?: string;
  currency?: string;
}

export const checkinStorage = makeVar<ICheckinStorageData>({
  checkedIn: false,
  preCheckedIn: false,
});

export const useCheckedIn = () => {
  const checkinData = useReactiveVar(checkinStorage);

  useEffect(() => {
    const reservations = getTrips();

    const checkedInReservation = reservations.find((el) => el.checkedIn);

    if (checkedInReservation) {
      checkinStorage({
        reservationId: checkedInReservation?.reservationId,
        preCheckedIn: checkedInReservation?.preCheckedIn,
        checkedIn: checkedInReservation?.checkedIn ?? false,
        name: checkedInReservation?.name,
        email: checkedInReservation?.email,
        roomNumber: checkedInReservation?.roomNumber,
        invoiceId: checkedInReservation?.invoiceId,
      });
    }
  }, []);

  return checkinData;
};

export const StepperInformationStorage = makeVar<any>([
  { value: 60, label: 1, title: STEPPER_REVIEW },
  { value: 0, label: 2, title: STEPPER_PAYMENT },
  { value: 0, label: 3, title: STEPPER_CHECK_IN },
]);

export const youverseProfileIDStorage = makeVar<any>({ id: '', guestType: '' });

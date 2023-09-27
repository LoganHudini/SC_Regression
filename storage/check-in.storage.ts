import { makeVar, useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { getTrips } from './trips.storage';

interface ICheckinStorageData {
  reservationId?: any;
  checkedIn: boolean;
  token?: string;
  name?: string;
  preCheckedIn?: boolean;
  bookingId?: string;
  roomNumber?: string;
  invoiceId?: string;
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
        reservationId: checkedInReservation.reservationId,
        checkedIn: true,
        name: checkedInReservation.name,
        roomNumber: checkedInReservation?.roomNumber,
        invoiceId: checkedInReservation?.invoiceId,
      });
    }
  }, []);

  return checkinData;
};

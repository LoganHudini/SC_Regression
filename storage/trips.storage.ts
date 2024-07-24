import { checkinStorage } from './check-in.storage';

const TRIPS_KEY = 'hudini_pwa:TRIPS';

export interface ISavedTrip {
  reservationId: string | string[] | undefined;
  preCheckedIn?: boolean;
  checkedIn?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  roomNumber?: string;
  invoiceId?: string;
  bookingId?: any;
  hotelId?: any;
}

export const saveTrip = (payload: ISavedTrip) => {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(payload));
};

export const checkoutTrip = () => {
  localStorage.setItem(TRIPS_KEY, JSON.stringify({}));
  checkinStorage({
    reservationId: '',
    preCheckedIn: false,
    checkedIn: false,
    firstName: '',
    lastName: '',
    email: '',
    roomNumber: '',
    invoiceId: '',
  });
};

export const getTrips = (): ISavedTrip => {
  const existingTrips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '{}');
  return existingTrips;
};

import { checkinStorage } from './check-in.storage';
import { IGuestStorageData } from './guest-information.storage';
import { IPersonalizeYourRoomStorageData } from './personalize-your-room.storage';

const TRIPS_KEY = 'hudini_pwa:TRIPS';

export interface ISavedTrip {
  reservationId: string;

  checkedIn?: boolean;
  specialRequests?: string;
  personalizationEntities?: IPersonalizeYourRoomStorageData;
  guests?: IGuestStorageData | null;
}

export const saveTrip = (payload: ISavedTrip) => {
  const existingTrips: ISavedTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');

  const savedTrip = existingTrips.find(
    (el: ISavedTrip) => el.reservationId === payload.reservationId,
  );

  if (payload.checkedIn) {
    existingTrips.forEach((el) => {
      el.checkedIn = false;
    });

    if (savedTrip) {
      delete savedTrip.guests;
      delete savedTrip.personalizationEntities;
      delete savedTrip.specialRequests;

      savedTrip.checkedIn = payload.checkedIn;
    }
  }

  if (!savedTrip) {
    existingTrips.push(payload);
  }

  localStorage.setItem(TRIPS_KEY, JSON.stringify(existingTrips));
};

export const ckeckoutTrip = (payload: ISavedTrip) => {
  const existingTrips: ISavedTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');

  const savedTrip = existingTrips.find(
    (el: ISavedTrip) => el.reservationId === payload.reservationId,
  );

  if (savedTrip) {
    savedTrip.checkedIn = false;
  }

  localStorage.setItem(TRIPS_KEY, JSON.stringify(existingTrips));
  checkinStorage({
    reservationId: '',
    preCheckedIn: false,
    checkedIn: false,
    bookingId: '',
  });
};

export const getTrips = (): ISavedTrip[] => {
  const existingTrips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');

  return existingTrips;
};

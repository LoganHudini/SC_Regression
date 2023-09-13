import { makeVar } from '@apollo/client';

export type ITableReservationStorageData = {
  restaurantName?: string;
  guestCount?: number;
  date?: string;
  time?: string;
  reservationId?: string;
  id?: string;
  venueId?: string;
};

export const tableReservationStorage = makeVar<ITableReservationStorageData | null>(null);

export type IRestaurantListData = {
  name: string;
  id: string;
}[];

export const restaurantListStorage = makeVar<IRestaurantListData | null>(null);

export type ITableReservationInfoStorage = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
};
export const TablereservationInfoStorage = makeVar<ITableReservationInfoStorage | any>(null);

export const drawerStatus = makeVar(false);

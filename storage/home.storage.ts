import { makeVar } from '@apollo/client';

export type IdiningOptionsProps = {
  id: string;
  title: string;
  path: string;
};

export type INotificationDetailsProps = {
  title?: string;
  description?: string;
  redirect?: string | null;
  type?: string;
  apolloError?: string | any;
};

export const diningOptions = makeVar<any>({});

export const toggleModuleOptionsDrawer = makeVar(false);

export const toggleHamburgerMenuDrawer = makeVar(false);

export const toggleHotelInfoDrawer = makeVar(false);

export const toggleMapState = makeVar(true);

export const toggleNotification = makeVar(false);

export const notificationDetails = makeVar<INotificationDetailsProps>({});

export const toggleLoader = makeVar(false);

export const toggleDetailsDrawer = makeVar(false);

export const toggleRestaurantDetailsDrawer = makeVar(false);

export const toggleCheckInDetailsDrawer = makeVar(false);

export const getHotelCompendium = makeVar([]);

export const selectedCompendiumCategory = makeVar([]);

export const hotelInformation = makeVar<any>({});

export const hotelInfoStorage = makeVar<any>([]);

export const diningHeaders = makeVar<any>([]);

export const toggleMessageBirdChat = makeVar(false);

export const setDayjsLocale = makeVar(false);

export const hotelImage = makeVar<any>({});

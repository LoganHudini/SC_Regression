import { makeVar } from '@apollo/client';

export type IdiningOptionsProps = {
  id: string;
  title: string;
  path: string;
};

export type INotificationDetailsProps = null | {
  title: string;
  description?: string | null;
  redirect?: string | null;
  type: string;
  apolloError?: string | any;
  delay?: number;
};

export const diningOptions = makeVar<any>({});

export const toggleModuleOptionsDrawer = makeVar(false);

export const toggleHamburgerMenuDrawer = makeVar(false);

export const toggleHotelInfoDrawer = makeVar(false);

export const toggleMapState = makeVar(true);

export const toggleNotification = makeVar(false);

export const notificationStorage = makeVar<INotificationDetailsProps>(null);

export const toggleLoader = makeVar(false);

export const toggleDetailsDrawer = makeVar(false);

export const toggleRestaurantDetailsDrawer = makeVar(false);

export const toggleCheckInDetailsDrawer = makeVar(false);

export const isGetStarted = makeVar(false);

export const bookingDate = makeVar('');

export const getHotelCompendium = makeVar([]);

export const selectedCompendiumCategory = makeVar([]);

export const selectActivityCategory = makeVar([]);

export const selectActivityDetails = makeVar([]);

export const selectedActivityName = makeVar([]);

export const hotelInformation = makeVar<any>({});

export const hotelInfoStorage = makeVar<any>([]);

export const diningHeaders = makeVar<any>([]);

export const toggleMessageBirdChat = makeVar(false);

export const setDayjsLocale = makeVar(false);

export const hotelImage = makeVar<any>({});

export const hotelLocation = makeVar<any>([]);

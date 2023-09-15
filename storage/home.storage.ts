import { makeVar } from '@apollo/client';
import { DINING_OPTIONS } from 'utils/constants';

export type IdiningOptionsProps = {
  id: string;
  title: string;
  path: string;
};

export const diningOptions = makeVar<IdiningOptionsProps>(DINING_OPTIONS[0]);

export const toggleModuleOptionsDrawer = makeVar(false);
export const toggleHamburgerMenuDrawer = makeVar(false);

export const toggleHotelInfoDrawer = makeVar(false);

export const toggleCheckInDrawer = makeVar(false);

export const toggleNotification = makeVar(false);

export const toggleLoader = makeVar(false);

export const toggleDetailsDrawer = makeVar(false);

export const getHotelCompendium = makeVar([]);
export const selectedCompendiumCategory = makeVar([]);

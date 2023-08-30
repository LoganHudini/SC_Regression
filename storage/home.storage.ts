import { makeVar } from '@apollo/client';
import { DINING_OPTIONS } from 'utils/constants';

export const toggleModuleOptionsDrawer = makeVar(false);
export const toggleHamburgerMenuDrawer = makeVar(false);

export type IdiningOptionsProps = {
  id: string;
  title: string;
  path: string;
};

export const diningOptions = makeVar<IdiningOptionsProps>(DINING_OPTIONS[0]);

export const toggleNotification = makeVar(false);

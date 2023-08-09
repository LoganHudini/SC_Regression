import { Dispatch, SetStateAction } from 'react';
export interface TableReservationDrawerProps {
  customisationDrawer: boolean;
  closeCustomisationDrawer: () => void;
  setSelectedRestaurantName: Dispatch<SetStateAction<string | undefined>>;
}

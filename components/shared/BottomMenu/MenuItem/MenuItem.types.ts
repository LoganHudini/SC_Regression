import React from 'react';

export interface IMenuItemProps {
  title: string;
  Icon: any;
  externalLink: string;
  flow: string;
  pages: string[];
  redirectOptions: string;
  paths?: {
    path: string;
    id: string;
  }[];
  status: any;
  toggleOption: () => void;
  hotelName?: string;
  iconStyle?: any;
  afterCheckinBottomArray?: any;
}

export interface IModuleOptionsDrawerProps {
  homeActive: boolean | undefined;
  irdActive: boolean;
  housekeepingActive: boolean;
  hotelCompendiumActive: boolean;
  spaActive: boolean;
  offersActive: boolean;
  restaurantAndBarsActive: boolean;
  diningCategoryOptions?: any;
  hamburger?: any;
  path?: {
    path: string;
    id: string;
  }[];
}

export interface IHamburgerMenuDrawerProps {
  hamburger: any;
}

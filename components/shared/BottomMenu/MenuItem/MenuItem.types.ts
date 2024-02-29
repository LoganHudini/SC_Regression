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
  status: string;
  toggleOption: () => void;
  hotelName?: string;
}

export interface IModuleOptionsDrawerProps {
  homeActive: boolean | undefined;
  irdActive: boolean;
  housekeepingActive: boolean;
  hotelCompendiumActive: boolean;
  spaActive: boolean;
  offersActive: boolean;
}

export interface IHamburgerMenuDrawerProps {
  hamburger: any;
}

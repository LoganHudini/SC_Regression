import React from 'react';

export interface IMenuItemProps {
  title: string;
  Icon: React.FC;

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
}

export interface IModuleOptionsDrawerProps {
  homeActive: boolean;
  irdActive: boolean;
  housekeepingActive: boolean;
  hotelCompendiumActive: boolean;
  spaActive: boolean;
  offersActive: boolean;
}

export interface IHamburgerMenuDrawerProps {
  hamburger: any;
}

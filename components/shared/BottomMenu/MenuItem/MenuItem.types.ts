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
  setErrorToggle?: any;
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
  filteredhotelCompendiumInfo: any;
  spaCategories: any;
  serviceRequestOptions: any;
  offersList: any;
  hamburger?: any;
  path?: {
    path: string;
    id: string;
  }[];
}

export interface IHamburgerMenuDrawerProps {
  hamburger: any;
}

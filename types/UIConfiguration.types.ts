export enum ComponentType {
  HERO_BANNER_W_TITLE = 'HERO_BANNER_W_TITLE',
  HERO_BANNER_W_CTA = 'HERO_BANNER_W_CTA',
  HERO_BANNER_W_SUBTITLE_CTA = 'HERO_BANNER_W_SUBTITLE_CTA',
  SMALL_BANNER_W_TITLE = 'SMALL_BANNER_W_TITLE',
  CAROUSEL_LANDSCAPE_W_BG = 'CAROUSEL_LANDSCAPE_W_BG',
  CAROUSEL_LANDSCAPE_W_BODY_CTA = 'CAROUSEL_LANDSCAPE_W_BODY_CTA',
  CAROUSEL_LARGE_IMG_W_BG = 'CAROUSEL_LARGE_IMG_W_BG',
  CAROUSEL_PORTRAIT_W_BG = 'CAROUSEL_PORTRAIT_W_BG',
  CAROUSEL_SOCIAL = 'CAROUSEL_SOCIAL',
  CAROUSEL_WO_BG = 'CAROUSEL_WO_BG',
  BUTTON_W_CTA = 'BUTTON_W_CTA',
  IMAGE_LARGE = 'IMAGE_LARGE',
  IMAGE_LARGE_W_BG = 'IMAGE_LARGE_W_BG',
  IMAGE_LARGE_W_TITLE_BODY = 'IMAGE_LARGE_W_TITLE_BODY',
  IMAGE_LARGE_W_TITLE_SUBTITLE_BODY = 'IMAGE_LARGE_W_TITLE_SUBTITLE_BODY',
  IMAGE_W_TITLE_BODY = 'IMAGE_W_TITLE_BODY',
  SERVICE_DETAIL_COMPONENT = 'SERVICE_DETAIL_COMPONENT',
  ACCORDION_W_ICON = 'ACCORDION_W_ICON',
  ACCORDION_WO_ICON = 'ACCORDION_WO_ICON',
  LIST_COMPONENT = 'LIST_COMPONENT',
  DETAIL_PAGE = 'DETAIL_PAGE',
}

export interface ICta {
  isActive: boolean;
  title: string;
}

export interface IRedirectLink {
  connection: 'IN_APP' | 'EXTERNAL' | 'FLOW';
  linkId: string;
  isActive: boolean;
  flowSubSelection: string;
}

export enum ContactType {
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  BOOKING_URL = 'BOOKING_URL',
  REVIEWER_INFORMATION = 'REVIEWER_INFORMATION',
}

export interface IQueryResultEntity {
  CTA: {
    URL: string;
    cardPlacement: string[];
    contact: string;
    emailId: string;
    phoneCode: string;
    phoneNumber: string;
    redirectTo: string;
    type: string;
  };
  duration: {
    alwaysActive: boolean;
    endDate: string;
    endTime: string;
    startDate: string;
    startTime: string;
  };
  ctaTitle: string;
  additionalInformation: string;
  awards: string;
  code: string;
  contact: {
    URL: string;
    reviewerTitle?: string;
    type: ContactType;
  }[];
  contactNumber: string;
  createdAt: number;
  createdBy: string;
  cuisine: string;
  customAttributes: {
    key: string;
    value: string;
  }[];
  primaryCuisine: string;
  description: string;
  email: string;
  hotelId: string;
  hours: [
    {
      close: string;
      day: string;
      open: string;
    },
  ];
  id: string;
  images: {
    ratio1to1: string;
    ratio21to9: string;
    ratio16to9: string;
    fileName: string;
    index: number;
    master: string;
  }[];
  isActive: boolean;
  location: {
    addressLine1: string;
    addressLine2: string;
    area: string;
    city: string;
    country: string;
    latitude: string;
    longitude: string;
    postalCode: string;
    state: string;
    timeZone: string;
  };
  cta: {
    ctaTitle: string;
    redirectOption: string;
    redirectUrl: string;
    status: string;
  };
  menu: string;
  menuType: string;
  menuUrl: string;
  menuStatus: string;
  name: string;
  type: string;
  updatedAt: number;
  updatedBy: string;
  venueGroupId: string;
  version: number;
}

export interface IConfig {
  imgURL?: string;
  titleH1?: string;
  titleH2?: string;
  titleH3?: string;
  moduleQuery?: string;
  moduleUrl?: string;
  moduleQueryResult?: { [key: string]: IQueryResultEntity[] };
  hotelModule: string;
  hotelModuleId?: string;
  backgroundColor?: string;
  isTitleActive?: boolean;
  shadowOverlay?: boolean;
  redirectLink?: IRedirectLink;
  redirectLinkUri?: string;
  body?: string;
  cta?: ICta;
  customAttributes?: {
    key: string;
    value: string;
  }[];
  images?: {
    imgURL: string;
    shadowOverlay: boolean;
  }[];
  phone?: {
    isActive: boolean;
    number: string;
  };
  email?: {
    isActive: boolean;
    address: string;
  };
  accordions?: {
    imgURL?: string;
    body?: string;
    titleH3?: string;
  }[];
  highLights?: {
    isActive: boolean;

    highLightList: {
      highLight: string;
    }[];
  };
  listItems?: {
    hotelModuleId: string;
    linkId: string;
  }[];
  viewAll?: {
    isActive: boolean;
    linkId: string;
  };

  imgMain?: IConfig;
  slides?: IConfig[];
}

export interface ISlide {
  title: string;
  id: ComponentType;
  config: Partial<IConfig>;
}

export type UIConfiguration = ISlide[];

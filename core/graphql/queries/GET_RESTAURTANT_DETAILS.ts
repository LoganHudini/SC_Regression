import { gql } from '@apollo/client';

export interface IHours {
  close: string;
  day: string;
  open: string;
}

export interface IContact {
  URL: string;
  reviewerTitle: string;
  type: string;
}

export interface ILocation {
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
}

export interface IImage {
  fileName: string;
  index: number;
  master: string;
  ratio16to9: string;
  ratio1to1: string;
  ratio21to9: string;
}
export interface ICustomAttributes {
  key: string;
  value: string;
}

export interface IRestaurant {
  additionalInformation: string;
  awards: string;
  code: string;
  contact: IContact[];
  contactNumber: string;
  createdAt: number;
  createdBy: string;
  cuisine: string;
  customAttributes: ICustomAttributes[];
  description: string;
  email: string;
  hotelId: string;
  hours: IHours[];
  id: string;
  images: IImage[];
  isActive: boolean;
  location: ILocation;
  menu: string;
  menuType: string;
  menuUrl: string;
  name: string;
  pk: string;
  primaryCuisine: string;
  secondaryCuisine: string[];
  sk: string;
  type: string;
  updatedAt: number;
  updatedBy: string;
  venueGroupId: string;
  version: number;
}

export interface IChef {
  id: string;
}

export interface IRestaurantDetails {
  chef: IChef[];
  restaurant: IRestaurant[];
}

export interface IGetRestaurantDetailsResponse {
  getRestaurantDetails: IRestaurantDetails;
}

export const GET_RESTAURANT_DETAILS = gql`
  query getRestaurantDetails($hotelId: String!, $lang: String) {
    getRestaurantDetails(input: { hotelId: $hotelId, lang: $lang }) {
      chef {
        id
      }
      restaurant {
        additionalInformation
        awards
        code
        contact {
          URL
          reviewerTitle
          type
        }
        contactNumber
        createdAt
        createdBy
        cuisine
        customAttributes {
          key
          value
        }
        cta {
          ctaTitle
          redirectOption
          redirectUrl
          status
        }
        description
        email
        hotelId
        hours {
          close
          day
          open
        }
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
        }
        isActive
        location {
          addressLine1
          addressLine2
          area
          city
          country
          latitude
          longitude
          postalCode
          state
          timeZone
        }
        menu
        menuType
        menuUrl
        menuStatus
        ctaTitle
        name
        pk
        primaryCuisine
        secondaryCuisine
        sk
        type
        updatedAt
        updatedBy
        venueGroupId
        version
      }
    }
  }
`;

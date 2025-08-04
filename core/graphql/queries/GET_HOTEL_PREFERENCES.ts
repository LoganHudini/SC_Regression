import { gql } from '@apollo/client';

export interface IGetHotelPreferencesResponse {
  getHotelAccommodationDetails: {
    preferences: {
      code: string;
      createdAt: string;
      createdBy: string;
      customAttributes: {
        key: string;
        value: string;
      }[];
      description: string;
      hotelId: string;
      id: string;
      isActive: boolean;
      allowMultipleSelection: boolean;
      name: string;
      preferenceItems: {
        code: string;
        description: string;
        isActive: boolean;
        name: string;
      }[];
      updatedAt: string;
      updatedBy: string;
      version: number;
    }[];
  };
}

export const GET_HOTEL_PREFERENCES = gql`
  query GetHotelPreferences($hotelId: String!, $lang: String) {
    getHotelAccommodationDetails(input: { hotelId: $hotelId, lang: $lang }) {
      preferences {
        code
        createdAt
        createdBy
        customAttributes {
          key
          value
        }
        description
        hotelId
        id
        isActive
        allowMultipleSelection
        name
        preferenceItems {
          code
          description
          isActive
          name
        }
        updatedAt
        updatedBy
        version
      }
    }
  }
`;

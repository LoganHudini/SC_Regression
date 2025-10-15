import { gql } from '@apollo/client';

export interface IGetRoomDetailsApiResponse {
  getHotelAccommodationDetails: {
    categories: {
      code: string;
      createdBy: string;
      hotelId: string;
      id: string;
      name: string;
    }[];
    floors: [];
    roomTypes: [
      {
        categoryId: string;
        code: string;
        createdBy: string;
        description: string;
        displayDescription: string;
        displayName: string;
        features: string[];
        hotelId: string;
        id: string;
        images: {
          fileName: string;
          index: number;
          master: string;
        }[];
        maxAdults: number;
        maxBeddingPerRoomType: number;
        maxChildren: number;
        maxInfants: number;
        maxOccupants: number;
        name: string;
        ratePerNight: number;
      },
    ];
    packages: {
      name: string;
      id: string;
      hotelId: string;
      description: string;
      code: string;
      isActive: boolean;
      costPerNight: string;
      createdBy: string;
    }[];
    rooms: [];
    upgrades: [
      {
        createdBy: string;
        hotelId: string;
        id: string;
        roomTypeId: string;
        upgradeType: {
          rate: number;
          upgradeType: string;
        }[];
      },
    ];
    personalisations: null;
  };
}

export const GET_ROOM_DETAILS = gql`
  query MyQuery($hotelId: String) {
    getHotelAccommodationDetails(input: { hotelId: $hotelId }) {
      roomTypes {
        categoryId
        code
        createdBy
        description
        displayDescription
        displayName
        features
        hotelId
        id
        images {
          fileName
          index
          master
        }
        maxAdults
        maxBeddingPerRoomType
        maxChildren
        maxInfants
        maxOccupants
        name
        ratePerNight
      }

      upgrades {
        createdBy
        hotelId
        id
        roomTypeId
        upgradeType {
          rate
          upgradeType
        }
      }
    }
  }
`;

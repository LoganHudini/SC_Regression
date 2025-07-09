import { gql } from '@apollo/client';

export interface IGetLocationsApiResponse {
  getLocations: {
    id: string;
    name: string;
    createdAt: string;
    createdBy: string;
    description: string;
    hotelId: string;
    type: string;
    updatedAt: string;
    updatedBy: string;
    version: number;
  }[];
}

export const GET_LOCATIONS = gql`
  query GetLocations($hotelId: String!) {
    getLocations(input: { hotelId: $hotelId }) {
      id
      name
      createdAt
      createdBy
      description
      hotelId
      type
      updatedAt
      updatedBy
      version
    }
  }
`;

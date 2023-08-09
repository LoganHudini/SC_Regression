import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IPersonalizeYourRoomEntity {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  type: string;
  description: string;
  cost: string;
  unit: string;
  isActive: boolean;
  currency: string;
}

export interface IPersonalizeYourRoomApiResponse {
  getAvailablePersonalizations: {
    status: string;
    data: IPersonalizeYourRoomEntity[];
  };
}

export const GET_AVAILABLE_PERSONALIZATIONS = gql`
  query GetAvailablePersonalizations($startDate: String, $endDate: String) {
    getAvailablePersonalizations(startDate: $startDate, endDate: $endDate) @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/personalisations?startDate={args.startDate}&endDate={args.endDate}"
      ) {
      errors
      data
      status
    }
  }
`;

export const GET_AVAILABLE_PERSONALIZATIONS_CMS = gql`
  query GetAvailablePersonalizations($startDate: String) {
    getAvailablePersonalizations(startDate: $startDate) @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/${ENVIRONMENT}//hotels/${HOTEL_ID}/personalisations?startDate={args.startDate}&lang=en"
      ) {
      errors
      data
      status
    }
  }
`;

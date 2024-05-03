import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IPersonalizeYourRoomEntity {
  maxQuantity: any;
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

export const GET_AVAILABLE_PERSONALIZATIONS_PMS = gql`
  query GetAvailablePersonalizations($confirmationId: String, $startDate: String, $endDate: String) {
    getAvailablePersonalizations(confirmationId: $confirmationId, startDate: $startDate, endDate: $endDate) @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/personalisations?confirmationId={args.confirmationId}&endDate={args.endDate}&startDate={args.startDate}"
      ) {
      errors
      data
      status
    }
  }
`;

export const GET_AVAILABLE_PERSONALIZATIONS_CMS = gql`
  query GetAvailablePersonalizations($startDate: String, $confirmationId: String) {
    getAvailablePersonalizations(startDate: $startDate, confirmationId: $confirmationId) @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/${ENVIRONMENT}//hotels/${HOTEL_ID}/personalisations?startDate={args.startDate}&lang=en&confirmationId={args.confirmationId}"
      ) {
      errors
      data
      status
    }
  }
`;

import { gql } from '@apollo/client';

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
  query GetAvailablePersonalizations(
    $confirmationId: String
    $startDate: String
    $endDate: String
    $hotelId: String
  ) {
    getAvailablePersonalizations(
      confirmationId: $confirmationId
      startDate: $startDate
      endDate: $endDate
      hotelId: $hotelId
    )
      @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/booking/hotel/{args.hotelId}/personalisations?confirmationId={args.confirmationId}&endDate={args.endDate}&startDate={args.startDate}"
      ) {
      errors
      data
      status
    }
  }
`;

export const GET_AVAILABLE_PERSONALIZATIONS_CMS = gql`
  query GetAvailablePersonalizations(
    $startDate: String
    $confirmationId: String
    $hotelId: String
  ) {
    getAvailablePersonalizations(
      startDate: $startDate
      confirmationId: $confirmationId
      hotelId: $hotelId
    )
      @rest(
        type: "GetAvailablePersonalizationsPayload"
        path: "/hotels/{args.hotelId}/personalisations?startDate={args.startDate}&lang=en&confirmationId={args.confirmationId}"
      ) {
      errors
      data
      status
    }
  }
`;

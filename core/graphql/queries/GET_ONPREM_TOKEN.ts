import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IOnPremTokenApiRequest {
  roomNo: string;
  bookingId: string;
  lastName: string;
  deviceType: string;
}

export const GET_ONPREM_TOKEN = gql`
  query GetOnPremToken($body: IOnPremTokenApiRequest) {
    getOnPremToken(body: $body)
      @rest(type: "GetOnPremTokenPayload", path: "/login", method: "POST", bodyKey: "body") {
      errors
      data
      status
    }
  }
`;

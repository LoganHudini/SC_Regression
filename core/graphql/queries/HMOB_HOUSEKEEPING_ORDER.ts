import { gql } from '@apollo/client';

export interface IHouseKeepingApiRequest {
  email: string;
  firstName: string;
  lastName: string;
  roomNo: string;
  bookingId: string;
  additionalRequest: string;
  services: string;
  date: string;
  time: string;
  items: [{ item: string; hmobileId: string }];
}

export const HOUSEKEEPING_ORDER = gql`
  query HouseKeepingRequest($body: IHouseKeepingApiRequest) {
    houseKeepingRequest(body: $body)
      @rest(
        type: "HouseKeepingRequestPayload"
        path: "/emailHouseKeepingRequest"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

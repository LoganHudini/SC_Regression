import { gql } from '@apollo/client';

export interface IRDOrderApiResponse {
  data: {
    transactionHK: {
      message: string;
      status: boolean;
    };
  };
}

export const HOUSEKEEPING_ORDER = gql`
  mutation MyMutation(
    $bookingId: String
    $bookingTime: String
    $guestName: String
    $hotelId: String!
    $lang: String
    $requestType: String
    $resolvedTime: String
    $roomNo: String!
    $serviceName: String
    $items: [HouseKeepingItemDetailsInput!]!
  ) {
    createHouseKeepingOrder(
      input: {
        bookingId: $bookingId
        bookingTime: $bookingTime
        guestName: $guestName
        hotelId: $hotelId
        lang: $lang
        requestType: $requestType
        resolvedTime: $resolvedTime
        roomNo: $roomNo
        serviceName: $serviceName
        items: $items
      }
    ) {
      bookingId
      bookingTime
      createdAt
      createdBy
      guestName
      hotelId
      id
      items {
        id
        name
        scheduledFor
        instructions
      }
      lang
      pk
      requestType
      resolvedTime
      roomNo
      serviceName
      sk
      status
      updatedAt
      updatedBy
      version
    }
  }
`;

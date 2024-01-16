import { gql } from '@apollo/client';

export const HOUSEKEEPING_ORDER_TRANSACTION_HK = gql`
  mutation MyMutation(
    $hotelId: String!
    $roomNo: String!
    $guestFirstName: String
    $bookingId: String!
    $guestEmail: String
    $items: [TransactionHKItemInput!]!
  ) {
    transactionHK(
      input: {
        guestFirstName: $guestFirstName
        guestEmail: $guestEmail
        bookingId: $bookingId
        hotelId: $hotelId
        roomNo: $roomNo
        items: $items
      }
    ) {
      message
      status
    }
  }
`;

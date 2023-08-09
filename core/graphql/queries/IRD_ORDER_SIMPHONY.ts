import { gql } from '@apollo/client';

export const IRD_ORDER_SIMPHONY = gql`
  mutation MyMutation(
    $date: String!
    $deliveryLocation: String!
    $guestName: String!
    $guests: Int!
    $paymentMethod: String!
    $roomNo: String!
    $items: [TransactionPOSItemInput!]!
    $hotelId: String!
    $additionalNote: String
  ) {
    transactionPOS(
      input: {
        date: $date
        deliveryLocation: $deliveryLocation
        guestName: $guestName
        guests: $guests
        hotelId: $hotelId
        paymentMethod: $paymentMethod
        roomNo: $roomNo
        items: $items
        additionalNote: $additionalNote
      }
    ) {
      message
      status
    }
  }
`;

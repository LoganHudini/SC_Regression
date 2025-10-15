import { gql } from '@apollo/client';

export interface IRDOrderApiResponse {
  createOrder: {
    additionalNote: string;
    deliveryLocation: string;
    guestName: string;
    hotelId: string;
    id: string;
    items: [
      {
        amount: number;
        code: string;
        cookingInstructions: string;
        count: number;
        name: string;
      },
    ];
    noOfItems: number;
    paymentMethod: string;
    roomNo: string;
    startTime: string;
    status: string;
    totalAmount: number;
    guestSignature: string;
  };
}

export const IRD_ORDER = gql`
  mutation IrdOrder(
    $additionalNote: String!
    $bookingId: String!
    $deliveryLocation: String!
    $guestEmail: String!
    $guestName: String!
    $noOfItems: Int!
    $noOfGuests: Int!
    $totalAmount: Float!
    $paymentMethod: String!
    $roomNo: String!
    $startTime: String!
    $guestSignature: String!
    $items: [ItemDetailsInput]!
    $hotelId: String
  ) {
    createOrder(
      input: {
        additionalNote: $additionalNote
        bookingId: $bookingId
        deliveryLocation: $deliveryLocation
        guestEmail: $guestEmail
        guestName: $guestName
        items: $items
        noOfItems: $noOfItems
        paymentMethod: $paymentMethod
        roomNo: $roomNo
        startTime: $startTime
        totalAmount: $totalAmount
        hotelId: $hotelId
        noOfGuests: $noOfGuests
        guestSignature: $guestSignature
        channel: "PWA"
      }
    ) {
      additionalNote
      deliveryLocation
      guestName
      hotelId
      id
      items {
        amount
        code
        cookingInstructions
        count
        name
      }
      noOfItems
      paymentMethod
      roomNo
      startTime
      status
      totalAmount
    }
  }
`;

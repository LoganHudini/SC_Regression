import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface ICheckoutApiRequest {
  reservationType: string;
  reservationId: string;
  bookingId: string;
  paymentType: string;
}

export const CHECKOUT = gql`
query Checkout($body: ICheckoutApiRequest, $roomNumber: roomNumber) {
    checkout(body: $body, roomNumber: $roomNumber)
    @rest(
      type: "CheckoutPayload"
      path: "/${ENVIRONMENT}/hotel/${HOTEL_ID}/booking/checkout?roomNumber={args.roomNumber}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const MAKE_CHECKOUT_PAYMENT = gql`
  mutation MyMutation(
    $amount: String
    $bookingId: String
    $cardNumber: String
    $cardHolderName: String
    $cardType: String
    $comment: String
    $expiry: String
    $reference: String
    $token: String
  ) {
    postPMSPayment(
      input: {
        amount: $amount
        bookingId: $bookingId
        cardNumber: $cardNumber
        cardHolderName: $cardHolderName
        cardType: $cardType
        comment: $comment
        expiry: $expiry
        hotelId: "${HOTEL_ID}"
        reference: $reference
        token: $token
      }
    ) {
      status
      message
    }
  }
`;

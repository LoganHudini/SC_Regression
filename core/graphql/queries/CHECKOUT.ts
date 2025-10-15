import { gql } from '@apollo/client';

export interface ICheckoutApiRequest {
  reservationType: string;
  reservationId: string;
  bookingId: string;
  paymentType: string;
  roomNo: string;
}

export const CHECKOUT = gql`
  query Checkout($body: ICheckoutApiRequest, $confirmationId: confirmationId, $hotelId: String) {
    checkout(body: $body, confirmationId: $confirmationId, hotelId: $hotelId)
      @rest(
        type: "CheckoutPayload"
        path: "/hotel/{args.hotelId}/booking/checkout?confirmationId={args.confirmationId}"
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
    $hotelId: String
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
        hotelId: $hotelId
        reference: $reference
        token: $token
      }
    ) {
      status
      message
    }
  }
`;

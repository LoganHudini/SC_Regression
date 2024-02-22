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

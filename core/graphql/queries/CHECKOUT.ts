import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface ICheckoutApiRequest {
  reservationType: string;
  reservationId: string;
  bookingId: string;
  paymentType: string;
}

export const CHECKOUT = gql`
query Checkout($body: ICheckoutApiRequest) {
    checkout(body: $body)
    @rest(
      type: "CheckoutPayload"
      path: "/${ENVIRONMENT}/hotel/${HOTEL_ID}/booking/checkout"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

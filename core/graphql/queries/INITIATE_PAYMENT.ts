import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IInitiatePaymentApiRequest {
  currency: string;
  amount: number;
  bookingId: string;
  txnType?: string;
  timeZone?: string;
}

export interface IInitiatePaymentApiResponse {
  initiatePayment: {
    status: string;
    data: {
      original_message: string;
      answer: {
        operation_status: string;
        transaction_id: string;
        payment_zone_data: string;
        reference_id: string;
        intent: string;
      };
    };
  };
}

export const INITIATE_PAYMENT = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/${ENVIRONMENT}/loadpaymentzone/fiserv/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_FISERV = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/loadpaymentzone2/fiserv/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

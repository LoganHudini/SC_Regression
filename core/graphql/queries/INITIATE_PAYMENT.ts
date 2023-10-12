import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IInitiatePaymentApiRequest {
  currency: string;
  amount: number;
  bookingId: string;
  txnType?: string;
  timeZone?: string;
  orderId?: string;
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

export const INITIATE_PAYMENT_SHIFT4 = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/${ENVIRONMENT}/v3/loadpaymentzone/shift4/hotel/${HOTEL_ID}"
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

export const INITIATE_PAYMENT_CYBERSOURCE = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/${ENVIRONMENT}/payment/cybersource/hotel/${HOTEL_ID}/loadPaymentZone"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

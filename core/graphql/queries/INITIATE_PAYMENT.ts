import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

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
query InitiatePayment( $body: InitiatePaymentPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/v3/loadpaymentzone/shift4/hotel/${HOTEL_ID}"
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
query InitiatePayment( $body: InitiatePaymentPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/loadpaymentzone2/fiserv/hotel/${HOTEL_ID}?confirmationId={args.body.bookingId}"
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
query InitiatePayment( $body: InitiatePaymentPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/payment/cybersource/hotel/${HOTEL_ID}/loadPaymentZone"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_CCAVENUE = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/payment/ccAvenue/hotel/${HOTEL_ID}/loadPaymentZone?confirmationId={args.body.bookingId}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_OGONE = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/v3/initiatepayment/ogone/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_FREEDOMPAY = gql`
query InitiatePayment( $body: InitiatePaymentPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/v3/loadpaymentzone/freedompay/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_DSP = gql`
query InitiatePayment( $body: InitiatePaymentPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/loadpaymentzone2/dsp/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_PLANET = gql`
query InitiatePayment($body: InitiatePaymentPayload) {
  InitiatePaymentPayload(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/web2pay/getToken/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const INITIATE_PAYMENT_GLOBAL_BLUE = gql`
query InitiatePayment( $body: UpdateGuestDetailsPayload) {
    initiatePayment(body: $body)
    @rest(
      type: "InitiatePaymentPayload"
      path: "/hotel-payments/${HOTEL_ID}/getToken"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const VALIDATE_PAYBYLINK_URL = gql`
  query GetReservation($confirmationNumber: String, $paylinkUniqueId: String) {
    getReservation(confirmationNumber: $confirmationNumber, paylinkUniqueId: $paylinkUniqueId)
      @rest(
        type: "GetReservationPayload"
        path: "/paylink/hotel/${HOTEL_ID}/paylinkStatus?confirmationId={args.confirmationNumber}&paylinkUniqueId={args.paylinkUniqueId}"
      ) {
      errors
      data
      status
    }
  }
`;

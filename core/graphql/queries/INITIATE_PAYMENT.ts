import { gql } from '@apollo/client';

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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/v3/loadpaymentzone/shift4/hotel/{args.hotelId}"
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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/loadpaymentzone2/fiserv/hotel/{args.hotelId}?confirmationId={args.body.bookingId}"
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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/payment/cybersource/hotel/{args.hotelId}/loadPaymentZone"
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
  query InitiatePayment($body: UpdateGuestDetailsPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/payment/ccAvenue/hotel/{args.hotelId}/loadPaymentZone?confirmationId={args.body.bookingId}"
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
  query InitiatePayment($body: UpdateGuestDetailsPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/v3/initiatepayment/ogone/hotel/{args.hotelId}"
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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/v3/loadpaymentzone/freedompay/hotel/{args.hotelId}"
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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/loadpaymentzone2/dsp/hotel/{args.hotelId}"
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
  query InitiatePayment($body: InitiatePaymentPayload, $hotelId: String) {
    InitiatePaymentPayload(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/web2pay/getToken/hotel/{args.hotelId}"
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
  query InitiatePayment($body: UpdateGuestDetailsPayload, $hotelId: String) {
    initiatePayment(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiatePaymentPayload"
        path: "/hotel-payments/{args.hotelId}/getToken"
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
  query GetReservation($confirmationNumber: String, $paylinkUniqueId: String, $hotelId: String) {
    getReservation(
      confirmationNumber: $confirmationNumber
      paylinkUniqueId: $paylinkUniqueId
      hotelId: $hotelId
    )
      @rest(
        type: "GetReservationPayload"
        path: "/paylink/hotel/{args.hotelId}/paylinkStatus?confirmationId={args.confirmationNumber}&paylinkUniqueId={args.paylinkUniqueId}"
      ) {
      errors
      data
      status
    }
  }
`;

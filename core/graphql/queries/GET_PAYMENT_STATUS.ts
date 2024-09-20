import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IGetPaymentStatusApiResponse {
  getPaymentStatus: {
    status: 'ok';
    data: {
      pk: string;
      sk: string;
      hotelId: string;
      'PaymentClient ': string;
      'amount ': number;
      floatAmount: number;
      'currency ': string;
      'status ': string;
      status: string;
      'checksum ': string;
      'orderId ': string;
      'transactionId ': string;
      'type ': string;
      'additionalParam ': string;
      'paymentMethod ': string;
      payment_method: string;
      'merchantOrderId ': string;
      'paymentDate ': string;
      encryptedPayment: string;
      reference: any;
      'cardNumber ': string;
      cardNumber: string;
      'cardType ': string;
      cardType: string;
      'cardHolderName ': string;
      cardHolderName: string;
      cardExpiry: string;
      token: any;
      createdAt: number;
      updatedBy: string;
      updatedAt: number;
      version: number;
    };
  };
}

export const GET_PAYMENT_STATUS = gql`
query GetPaymentStatus($paymentId: String, $confirmationId: String) {
    getPaymentStatus(paymentId: $paymentId, confirmationId: $confirmationId)
    @rest(
      type: "GetPaymentStatusPayload"
      path: "/payment/{args.paymentId}/hotel/${HOTEL_ID}/info?confirmationId={args.confirmationId}"
    ) {
    errors
    data
    status
  }
}
`;

export const GET_PAYMENT_STATUS_WITHOUT_CONFIRMATIONID = gql`
query GetPaymentStatus($paymentId: String, $confirmationId: String) {
    getPaymentStatus(paymentId: $paymentId, confirmationId: $confirmationId)
    @rest(
      type: "GetPaymentStatusPayload"
      path: "/payment/{args.paymentId}/hotel/${HOTEL_ID}/info?confirmationId={args.confirmationId}"
    ) {
    errors
    data
    status
  }
}
`;

export const GET_FREEDOMPAY_STATUS = gql`
query GetPaymentStatus($body: GetPaymentStatusPayload) {
    getPaymentStatus(body: $body)
    @rest(
      type: "GetPaymentStatusPayload"
      path: "/v3/getpaymentstatus/freedompay/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const GET_DSP_PAYMENT_STATUS = gql`
query GetPaymentStatus($transactionId: String) {
    getPaymentStatus(transactionId: $transactionId)
    @rest(
      type: "GetPaymentStatusPayload"
      path: "/getpaymentstatus/dsp/hotel/${HOTEL_ID}"
    ) {
    errors
    data
    status
  }
}
`;

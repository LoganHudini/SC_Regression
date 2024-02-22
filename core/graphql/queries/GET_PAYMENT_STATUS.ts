import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

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
      'checksum ': string;
      'orderId ': string;
      'transactionId ': string;
      'type ': string;
      'additionalParam ': string;
      'paymentMethod ': string;
      'merchantOrderId ': string;
      'paymentDate ': string;
      encryptedPayment: string;
      reference: string;
      'cardNumber ': string;
      'cardType ': string;
      'cardHolderName ': string;
      cardExpiry: string;
      token: string;
      createdBy: string;
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
      path: "/${ENVIRONMENT}/payment/{args.paymentId}/hotel/${HOTEL_ID}/info?confirmationId={args.confirmationId}"
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
      path: "/${ENVIRONMENT}/v3/getpaymentstatus/freedompay/hotel/${HOTEL_ID}"
    ) {
    errors
    data
    status
  }
}
`;

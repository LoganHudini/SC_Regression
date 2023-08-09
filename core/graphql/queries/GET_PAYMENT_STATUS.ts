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
query GetPaymentStatus($paymentId: String) {
    getPaymentStatus(paymentId: $paymentId)
    @rest(
      type: "GetPaymentStatusPayload"
      path: "/${ENVIRONMENT}/payment/{args.paymentId}/hotel/${HOTEL_ID}/info"
    ) {
    errors
    data
    status
  }
}
`;

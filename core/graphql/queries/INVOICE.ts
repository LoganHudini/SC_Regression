import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IInvoiceApiResponse {
  invoice: {
    status: string;
    data: {
      reservationId: string;
      name: string;
      totalBillAmount: string;
      totalPaidAmount: string;
      totalDueAmount: string;
      billItems: {
        name: string;
        amount: string;
        cheque_no: string;
        time_stamp: string;
        vat_code: string;
        quantity: string;
        reference: string;
      }[];
      billNumber: string;
      billTaxes: {
        amount: string;
        description: string;
      }[];
      fromDate: string;
      toDate: string;
      dueDate: string;
      link: string;
      currentBalance: string;
      totalBillAmountWithoutTax: string;
    };
  };
}

export const INVOICE = gql`
  query Invoice($confirmationNumber: String, $roomNumber: roomNumber) {
    invoice(confirmationNumber: $confirmationNumber, roomNumber: $roomNumber)
      @rest(
        type: "InvoicePayload"
        path: "/${ENVIRONMENT}/invoice/booking/{args.confirmationNumber}/hotel/${HOTEL_ID}?roomNumber={args.roomNumber}"
      ) {
      errors
      data
      status
    }
  }
`;

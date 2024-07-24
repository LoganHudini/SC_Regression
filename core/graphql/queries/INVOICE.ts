import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

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
  query Invoice($reservationId: String, $roomNumber: roomNumber) {
    invoice(reservationId: $reservationId, roomNumber: $roomNumber)
      @rest(
        type: "InvoicePayload"
        path: "/invoice/booking/{args.reservationId}/hotel/${HOTEL_ID}?roomNumber={args.roomNumber}"
      ) {
      errors
      data
      status
    }
  }
`;

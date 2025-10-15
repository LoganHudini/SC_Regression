import { gql } from '@apollo/client';

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

export interface IEmailInvoicePayload {
  reservationId: string;
  registeredGuest: string;
  email: string;
}

export const EMAIL_INVOICE = gql`
  query Invoice($confirmationNumber: String, $hotelId: String) {
    invoice(confirmationNumber: $confirmationNumber, body: $body, hotelId: $hotelId)
      @rest(
        type: "EmailInvoicePayload"
        path: "/v2/email/hotel/{args.hotelId}/invoice"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface ICheckInApiRequest {
  skipQueueReservation: boolean;
  reservationType: string;
  reservationId: string;
  bookingId: string;
  checkinDate: string;
  checkoutDate: string;
  roomNo: string;
  roomType: string;
  primaryGuestEmail: string;
  primaryGuestFirstName: string;
  primaryGuestLastName: string;
  firstName: string;
  lastName: string;
  primaryGuestMobileNumber: string;
  guestCount: {
    adult: string;
    children: string;
  };
  paymentType: string;
  expirationDate: string;
  cardHolderName: string;
  creditCardType?: string;
  cardNumber?: string;
  lastFourDigits?: string;
  cardID?: string;
  vaultedCardID?: string;
  settlementType: string;
  documentType: string;
  documentNumber: string;
  issueCountry: string;
  dateOfIssue?: string;
  nights?: string;
  membershipNumber?: string;
  company?: string;
  channel: string;
  upsell: any;
  guestSignature: string;
  comment: any;
  isDoNotMove: boolean;
  depositAmount?: string;
  specialInstructions: string;
  arrivalFlight: string;
  primaryGuestAddress: string;
  nationality: string;
  profession: string;
  primaryGuestDOB: string;
  guestType: string;
  voucherNumber: string;
  rate: string;
  state: string;
  city: string;
  postalCode: string;
  gender: string;
  currencyCode: string;
  group: string;
  agency: string;
  pushEregToOpera: boolean;
  placeOfStayDeparture: string;
  placeOfStayArrival: string;
  roomRate?: string;
  country?: string;
  captureDocumentUpload: any;
  skipOCR: boolean;
  cashierNotes?: string;
  nightlyRate?: string;
  title?: string;
  guests: [
    {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dob: string;
    },
  ];
  termsAndConditions?: any;
}

export const CHECKIN = gql`
query Checkin($confirmationNumber: String, $body: ICheckInApiRequest) {
    checkin(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "CheckinPayload"
      path: "/booking/hotel/${HOTEL_ID}/bookings/{args.confirmationNumber}/checkin"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const PRECHECKIN = gql`
query Precheckin($confirmationNumber: String, $body: ICheckInApiRequest) {
    precheckin(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "PrecheckinPayload"
      path: "/booking/hotel/${HOTEL_ID}/bookings/{args.confirmationNumber}/precheckin"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

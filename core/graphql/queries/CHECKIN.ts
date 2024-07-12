import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface ICheckInApiRequest {
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
  lastFourDigits?: string;
  cardID?: string;
  vaultedCardID?: string;
  settlementType: string;
  documentType: string;
  documentNumber: string;
  channel: string;
  upsell: any;
  guestSignature: string;
  comment: any;
  isDoNotMove: boolean;
  depositAmount?: string;
  specialInstructions: string;
  arrivalFlight: string;
  primaryGuestAddress: string;
  country: string;
  profession: string;
  guests: [
    {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
  ];
}

export const CHECKIN = gql`
query Checkin($confirmationNumber: String, $body: ICheckInApiRequest) {
    checkin(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "CheckinPayload"
      path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/bookings/{args.confirmationNumber}/checkin"
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
      path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/bookings/{args.confirmationNumber}/precheckin"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

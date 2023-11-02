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
  primaryGuestMobileNumber: string;
  guestCount: any;
  paymentType: string;
  expirationDate: string;
  creditCardType?: string;
  lastFourDigits?: string;
  vaultedCardID?: string;
  settlement: string;
  documentType: string;
  documentNumber: string;
  channel: string;
  upsell: any;
  guestSignature: string;
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

import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IPreCheckInApiRequest {
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
  cardHolderName: string;
  creditCardType?: string;
  lastFourDigits?: string;
  vaultedCardID?: string;
  settlementType: string;
  documentType: string;
  documentNumber: string;
  channel: string;
  upsell: any;
  guestSignature: string;
  comment: string;
}

export const PRECHECKIN = gql`
query Precheckin($confirmationNumber: String, $body: IPreCheckInApiRequest) {
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

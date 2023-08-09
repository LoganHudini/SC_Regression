import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface ICheckInApiRequest {
  reservationType: string;
  reservationId: string;
  bookingId: string;
  roomNo: string;
  paymentType: string;
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

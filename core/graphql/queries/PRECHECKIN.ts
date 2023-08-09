import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export interface IPreCheckInApiRequest {
  reservationType: string;
  reservationId: string;
  bookingId: string;
  uniqueBookingId: string;
  tagEmail: string;
  hotelName: string;
  roomTypeCode: string;
  firstName: string;
  lastName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: string;
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

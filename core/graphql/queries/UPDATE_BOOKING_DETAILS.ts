import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const UPDATE_BOOKING_DETAILS = gql`
query UpdateBookingDetails($confirmationNumber: String, $body: UpdateBookingDetailsPayload) {
  updateBookingDetails(confirmationNumber: $confirmationNumber, body: $body)
    @rest(
      type: "UpdateBookingDetailsPayload"
      path: "/booking/hotel/${HOTEL_ID}/reservation/{args.confirmationNumber}"
      method: "PUT"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

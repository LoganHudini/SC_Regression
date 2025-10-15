import { gql } from '@apollo/client';

export const UPDATE_BOOKING_DETAILS = gql`
  query UpdateBookingDetails(
    $confirmationNumber: String
    $body: UpdateBookingDetailsPayload
    $hotelId: String
  ) {
    updateBookingDetails(confirmationNumber: $confirmationNumber, body: $body, hotelId: $hotelId)
      @rest(
        type: "UpdateBookingDetailsPayload"
        path: "/booking/hotel/{args.hotelId}/reservation/{args.confirmationNumber}"
        method: "PUT"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

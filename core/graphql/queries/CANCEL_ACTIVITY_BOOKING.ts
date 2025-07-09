import { gql } from '@apollo/client';

export const CANCEL_ACTIVITY_BOOKING = gql`
  mutation cancelActivityBooking(
    $hotelId: String!
    $activityBookingId: String!
    $slotId: String!
    $confirmationId: String
    $room: String
    $lastName: String!
    $channel: String
  ) {
    cancelActivityBooking(
      input: {
        hotelId: $hotelId
        activityBookingId: $activityBookingId
        slotId: $slotId
        confirmationId: $confirmationId
        room: $room
        lastName: $lastName
        channel: $channel
      }
    ) {
      message
      status
    }
  }
`;

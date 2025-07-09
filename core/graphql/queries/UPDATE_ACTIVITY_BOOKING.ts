import { gql } from '@apollo/client';

export const UPDATE_ACTIVITY_BOOKING = gql`
  mutation updateActivityBooking(
    $hotelId: String!
    $activityBookingId: String!
    $slotId: String!
    $confirmationId: String!
    $firstName: String!
    $lastName: String!
    $seats: Int!
    $room: String!
    $activityId: String!
  ) {
    updateActivityBooking(
      input: {
        hotelId: $hotelId
        activityBookingId: $activityBookingId
        slotId: $slotId
        confirmationId: $confirmationId
        room: $room
        firstName: $firstName
        lastName: $lastName
        seats: $seats
        activityId: $activityId
      }
    ) {
      message
      status
    }
  }
`;

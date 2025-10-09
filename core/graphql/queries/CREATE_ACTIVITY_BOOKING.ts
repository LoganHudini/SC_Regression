import { gql } from '@apollo/client';

export const CREATE_ACTIVITY_BOOKING = gql`
  mutation CreateActivityBooking(
    $hotelId: String!
    $activityId: String!
    $categoryId: String!
    $confirmationId: String!
    $room: String!
    $firstName: String
    $lastName: String!
    $seats: Int!
    $date: String!
    $fromTime: String!
    $toTime: String!
    $arrivalDate: String
    $departureDate: String
    $notes: String
    $packages: [String]
  ) {
    createActivityBooking(
      input: {
        hotelId: $hotelId
        activityId: $activityId
        categoryId: $categoryId
        confirmationId: $confirmationId
        room: $room
        firstName: $firstName
        lastName: $lastName
        seats: $seats
        date: $date
        fromTime: $fromTime
        toTime: $toTime
        arrivalDate: $arrivalDate
        departureDate: $departureDate
        notes: $notes
        packages: $packages
      }
    ) {
      message
      status
    }
  }
`;

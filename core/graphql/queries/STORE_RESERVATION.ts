import { gql } from '@apollo/client';

export const STORE_RESERVATION = gql`
  mutation MyMutation(
    $profileId: String!
    $reservationId: String!
    $lastName: String
    $checkInDate: String
    $checkOutDate: String
    $hotelId: String
  ) {
    storeReservation(
      input: {
        hotelId: $hotelId
        profileId: $profileId
        reservationId: $reservationId
        lastName: $lastName
        checkInDate: $checkInDate
        checkOutDate: $checkOutDate
      }
    ) {
      message
      status
    }
  }
`;

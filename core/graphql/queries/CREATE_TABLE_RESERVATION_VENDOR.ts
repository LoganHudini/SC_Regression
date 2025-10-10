import { gql } from '@apollo/client';

export const CREATE_TABLE_RESERVATION_VENDOR = gql`
  mutation MyMutation(
    $covers: Int!
    $email: String!
    $hotelId: String!
    $idempotencyToken: String!
    $last_name: String!
    $phone: String!
    $venue_id: String!
    $first_name: String!
    $date: String!
    $time: String!
  ) {
    createRestaurantReservation(
      input: {
        covers: $covers
        email: $email
        hotelId: $hotelId
        idempotencyToken: $idempotencyToken
        last_name: $last_name
        phone: $phone
        venue_id: $venue_id
        first_name: $first_name
        date: $date
        time: $time
      }
    ) {
      included {
        attributes {
          email
          first_name
          last_name
          name
          phone
        }
        id
        type
      }
    }
  }
`;

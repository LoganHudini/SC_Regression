import { gql } from '@apollo/client';

export const RESERVE_TABLE = gql`
  query MyQuery(
    $firstName: String!
    $lastName: String!
    $clientId: String!
    $email: String!
    $phone: String!
    $hotelId: String!
    $partySize: Int!
    $notes: String!
    $date: String!
    $time: String!
    $venueId: String!
  ) {
    SevenroomsMakeReservation(
      input: {
        hotel_id: $hotelId
        query: {
          client_id: $clientId
          date: $date
          duration: 10
          email: $email
          first_name: $firstName
          is_walkin: false
          last_name: $lastName
          loyalty_rank: 10
          notes: $notes
          party_size: $partySize
          phone: $phone
          time: $time
          venue_group_marketing_opt_in: false
          venue_id: $venueId
          venue_marketing_opt_in: false
        }
      }
    ) {
      data {
        details {
          client_id
          client_reference_code
          reservation_id
          reservation_reference_code
        }
        error
        hotel_id
      }
    }
  }
`;

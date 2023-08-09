import { gql } from '@apollo/client';

export const CHECK_AVAILABILITY = gql`
  query MyQuery(
    $end: String!
    $from: String!
    $hotelId: String!
    $partySize: Int!
    $start: String!
    $to: String!
    $venueId: String!
  ) {
    SevenroomsGetAvailability(
      input: {
        end: $end
        from: $from
        hotel_id: $hotelId
        party_size: $partySize
        start: $start
        to: $to
        venue_id: $venueId
      }
    ) {
      date
      times
    }
  }
`;

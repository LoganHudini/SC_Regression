import { gql } from '@apollo/client';

export const GET_SLOT_DETAILS = gql`
  mutation MyMutation(
    $startTime: String!
    $hotelId: String!
    $restaurant_id: String
    $endTime: String
    $noOfSeats: Int
    $only_available: Boolean!
  ) {
    getRestaurantAvailability(
      input: {
        startTime: $startTime
        hotelId: $hotelId
        restaurant_id: $restaurant_id
        endTime: $endTime
        only_available: $only_available
        noOfSeats: $noOfSeats
      }
    ) {
      data {
        attributes {
          available
          covers
          date
          label
          epoch
          remaining_covers
          shift
          time
          wait_list_available
          wait_list_remaining_covers
        }
        hotelId
        id
        type
      }
    }
  }
`;

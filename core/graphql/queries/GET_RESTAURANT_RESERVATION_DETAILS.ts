import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_RESTAURANT_RESERVATION_DETAILS = gql`
  query MyQuery($restaurantId: String!, $lang: String) {
    getRestaurantReservationDetails(input: { restaurantId: $restaurantId, lang: $lang }) {
      reservations {
        bookingDate
        date
        description
        exposure
        firstName
        guestType
        hotelId
        id
        isReservedForGuest
        lastName
        noOfGuests
        reserveFrom
        reserveUntil
        restaurantId
        roomNo
        status
        tableNumbers
      }
      tables {
        capacity
        duration
        exposure
        hotelId
        reservations
        restaurantId
        tableNumber
      }
    }
  }
`;

export const CREATE_RESTAURANT_RESERVATION = gql`

mutation MyMutation(
  $date: String!
  $exposure: String!
  $isReservedForGuest: Boolean!
  $reserveFrom: String!
  $reserveUntil: String!
  $restaurantId: String!
  $description: String!
  $firstName: String!
  $lastName: String!
  $guestType: String!
  $noOfGuests: Int
  $roomNo: String!
  $tableNumbers: [Int!]!
) {
  createRestaurantReservation(
    input: {
      date: $date
      exposure: $exposure
      hotelId: "${HOTEL_ID}"
      isReservedForGuest: $isReservedForGuest
      restaurantId: $restaurantId
      reserveFrom: $reserveFrom
      reserveUntil: $reserveUntil
      description: $description
      firstName: $firstName
      guestType: $guestType
      lastName: $lastName
      noOfGuests: $noOfGuests
      roomNo: $roomNo
      tableNumbers: $tableNumbers
    }
  ) {
    bookingDate
    date
    exposure
    firstName
    hotelId
    id
    isReservedForGuest
    lastName
    noOfGuests
    reserveFrom
    reserveUntil
    restaurantId
    roomNo
    status
    tableNumbers
  }
}
`;

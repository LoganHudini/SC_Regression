import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const STORE_RESERVATION = gql`
mutation MyMutation (
    $profileId: String!,
    $reservationId:String!,
    $lastName:String
    $checkInDate:String
    $checkOutDate:String
    ){
    storeReservation(input: {hotelId: "${HOTEL_ID}", profileId: $profileId, reservationId: $reservationId,lastName:$lastName, checkInDate:$checkInDate, checkOutDate:$checkOutDate}) {
      message
      status
    }
  }`;

import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const STORE_RESERVATION = gql`
mutation MyMutation (
    $profileId: String!,
    $reservationId:String!,
    ){
    storeReservation(input: {hotelId: "${HOTEL_ID}", profileId: $profileId, reservationId: $reservationId}) {
      message
      status
    }
  }`;

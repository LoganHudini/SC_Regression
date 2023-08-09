import { gql } from '@apollo/client';

export const GET_RESERVATION_STATUS = gql`
  query GetReservationStatus($roomId: String) {
    getReservationStatus(roomId: $roomId)
      @rest(type: "GetReservationStatusPayload", path: "/room/{args.roomId}", method: "GET") {
      errors
      data
      status
    }
  }
`;

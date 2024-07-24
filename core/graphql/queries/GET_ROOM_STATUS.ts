import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IGetRoomStatusApiResponse {
  getRoomStatus: {
    status: string;
    data: {
      roomStatus: string;
      frontOfficeStatus: string;
      houseKeepingStatus: string;
      isHouseKeepingInspection: boolean;
      isTurnDownYn: boolean;
      roomNumber: string;
      roomType: string;
      roomDescription: string;
    };
  };
}

export const GET_ROOM_STATUS = gql`
  query GetReservationRoomStatus($roomNumber: String, $confirmationId: String) {
    getRoomStatus(roomNumber: $roomNumber, confirmationId: $confirmationId)
      @rest(
        type: "GetReservationPayload"
        path: "/booking/hotel/${HOTEL_ID}/rooms/{args.roomNumber}/status?confirmationId={args.confirmationId}"
      ) {
      errors
      data
      status
    }
  }
`;

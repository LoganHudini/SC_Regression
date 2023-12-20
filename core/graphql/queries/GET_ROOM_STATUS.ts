import { gql } from '@apollo/client';
import { ENVIRONMENT } from '../endpoints';

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
  query GetReservationRoomStatus($roomNumber: String, $hotelId: String) {
    getRoomStatus(roomNumber: $roomNumber, hotelId: $hotelId)
      @rest(
        type: "GetReservationPayload"
        path: "/${ENVIRONMENT}/booking/hotel/{args.hotelId}/rooms/{args.roomNumber}/status"
      ) {
      errors
      data
      status
    }
  }
`;

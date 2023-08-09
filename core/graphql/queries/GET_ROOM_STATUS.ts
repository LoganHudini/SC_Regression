import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

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
query GetRoomStatus($roomId: String) {
    getRoomStatus(roomId: $roomId)
    @rest(
      type: "GetRoomStatusPayload"
      path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/rooms/{args.roomId}/status"
    ) {
    errors
    data
    status
  }
}
`;

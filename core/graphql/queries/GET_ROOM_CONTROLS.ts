import { gql } from '@apollo/client';

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

export const GET_ROOM_CONTROLS = gql`
  query GetRoomControls($roomId: String, $hotelId: String) {
    getRoomControls(roomId: $roomId, hotelId: $hotelId)
      @rest(
        type: "GetRoomStatusPayload"
        path: "/booking/hotel/{args.hotelId}/rooms/{args.roomId}/status"
      ) {
      errors
      data
      status
    }
  }
`;

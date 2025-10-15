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

export const GET_ROOM_STATUS = gql`
  query GetReservationRoomStatus($roomNumber: String, $confirmationId: String, $hotelId: String) {
    getRoomStatus(roomNumber: $roomNumber, confirmationId: $confirmationId, hotelId: $hotelId)
      @rest(
        type: "GetReservationPayload"
        path: "/booking/hotel/{args.hotelId}/rooms/{args.roomNumber}/status?confirmationId={args.confirmationId}"
      ) {
      errors
      data
      status
    }
  }
`;

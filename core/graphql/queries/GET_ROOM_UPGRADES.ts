import { gql } from '@apollo/client';

export const GET_ROOM_UPGRADES = gql`
  query GetRoomUpgrades($confirmationNumber: String, $hotelId: String) {
    getRoomUpgrades(confirmationNumber: $confirmationNumber, hotelId: $hotelId)
      @rest(
        type: "GetRoomUpgradesPayload"
        path: "/hotel/{args.hotelId}/booking/{args.confirmationNumber}/room/upgrade"
      ) {
      errors
      data
      status
    }
  }
`;

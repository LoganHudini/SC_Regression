import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_ROOM_UPGRADES = gql`
query GetRoomUpgrades($confirmationNumber: String) {
    getRoomUpgrades(confirmationNumber: $confirmationNumber)
    @rest(
      type: "GetRoomUpgradesPayload"
      path: "/hotel/${HOTEL_ID}/booking/{args.confirmationNumber}/room/upgrade"
    ) {
    errors
    data
    status
  }
}
`;

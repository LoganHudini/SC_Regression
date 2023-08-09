import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export const GET_ROOM_UPGRADES = gql`
query GetRoomUpgrades($confirmationNumber: String) {
    getRoomUpgrades(confirmationNumber: $confirmationNumber)
    @rest(
      type: "GetRoomUpgradesPayload"
      path: "/${ENVIRONMENT}/hotel/${HOTEL_ID}/booking/{args.confirmationNumber}/room/upgrade"
    ) {
    errors
    data
    status
  }
}
`;

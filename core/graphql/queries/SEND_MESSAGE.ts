import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const SEND_MESSAGE = gql`
  mutation MyMutation($body: String, $threadId: String, $guestId: String) {
    createChatMessage(
      input: {
        body: $body
        guestId: $guestId
        hotelId: "${HOTEL_ID}"
        threadId: $threadId
      }
    ) {
      message
      status
    }
  }
`;

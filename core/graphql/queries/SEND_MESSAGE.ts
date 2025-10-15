import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation MyMutation($body: String, $threadId: String, $guestId: String, $hotelId: String) {
    createChatMessage(
      input: { body: $body, guestId: $guestId, hotelId: $hotelId, threadId: $threadId }
    ) {
      message
      status
    }
  }
`;

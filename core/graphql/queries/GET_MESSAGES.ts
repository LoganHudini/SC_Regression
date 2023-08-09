import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IMessage {
  body: string;
  created: string;
  direction: string;
  id: string;
  updated: string;
  threadId: string;
}

export interface IGetMessagesApiResponse {
  getChatMessages: IMessage[];
}

export const GET_MESSAGES = gql`
  query MyQuery($email: String!, $firstName:String!, $lastName: String! ) {
    getChatMessages(
      input: {
        email: $email,
        firstName: $firstName
        lastName: $lastName
        hotelId: "${HOTEL_ID}"
      }
    ) {
      body
      created
      direction
      id
      updated
      threadId
    }
  }
`;

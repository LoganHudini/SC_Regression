import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_MESSAGEBOX_URL = gql`
  mutation MyMutation2(
  $roomNo:String!
  ) {
    generateChatUrl(
      input: {
       hotelId: "${HOTEL_ID}"
        roomNo: $roomNo
      }
    ) {
      url
    }
  }
`;

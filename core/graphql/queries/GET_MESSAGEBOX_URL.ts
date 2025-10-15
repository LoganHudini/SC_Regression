import { gql } from '@apollo/client';

export const GET_MESSAGEBOX_URL = gql`
  mutation MyMutation2($roomNo: String!, $hotelId: String!) {
    generateChatUrl(input: { hotelId: $hotelId, roomNo: $roomNo }) {
      url
    }
  }
`;

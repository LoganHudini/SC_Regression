import { gql } from '@apollo/client';

export const UPDATE_EVA = gql`
  mutation MyMutation(
    $hotelId: String!
    $checkin: GenericCheckinDataInput!
    $guests: [GenericCheckinGuestInput!]!
  ) {
    checkinTS(input: { hotelId: $hotelId, checkin: $checkin, guests: $guests }) {
      status
      message
      data
    }
  }
`;

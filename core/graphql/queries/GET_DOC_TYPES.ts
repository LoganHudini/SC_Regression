import { gql } from '@apollo/client';

export const GET_DOC_TYPES = gql`
  query GetDocTypes($confirmationNumber: String, $hotelId: String) {
    getDocTypes(confirmationNumber: $confirmationNumber, hotelId: $hotelId)
      @rest(type: "GetDocTypePayload", path: "/booking/hotel/{args.hotelId}/document/types") {
      errors
      data
      status
    }
  }
`;

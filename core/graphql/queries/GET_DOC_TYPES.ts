import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export const GET_DOC_TYPES = gql`
query GetDocTypes($confirmationNumber: String) {
    getDocTypes(confirmationNumber: $confirmationNumber)
      @rest(
        type: "GetDocTypePayload"
        path: "/${ENVIRONMENT}/booking/hotel/${HOTEL_ID}/document/types"
      ) {
      errors
      data
      status
    }
  }
`;

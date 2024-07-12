import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export const GET_TRENTIAL_TOKEN = gql`
query sessionToken($body: InitiateTokenPayload) {
  InitiateToken( body: $body)
    @rest(
      type: "InitiateTokenPayload"
      path: "/${ENVIRONMENT}/kyc/sessionToken/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const GET_TRENTIAL_STATUS = gql`
query verificationStatus($body: InitiateTokenPayload) {
  InitiateToken( body: $body)
    @rest(
      type: "InitiateTokenPayload"
      path: "/${ENVIRONMENT}/kyc/verificationStatus/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

export const CREATE_FACE = gql`
query createFace($body: InitiateTokenPayload) {
  InitiateToken( body: $body)
    @rest(
      type: "InitiateTokenPayload"
      path: "/${ENVIRONMENT}/createFaceMatch/hotel/${HOTEL_ID}"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;

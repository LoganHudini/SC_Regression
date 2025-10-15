import { gql } from '@apollo/client';
export const GET_TRENTIAL_TOKEN = gql`
  query sessionToken($body: InitiateTokenPayload, $hotelId: String) {
    InitiateToken(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiateTokenPayload"
        path: "/kyc/sessionToken/hotel/{args.hotelId}"
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
  query verificationStatus($body: InitiateTokenPayload, $hotelId: String) {
    InitiateToken(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiateTokenPayload"
        path: "/kyc/verificationStatus/hotel/{args.hotelId}"
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
  query createFace($body: InitiateTokenPayload, $hotelId: String) {
    InitiateToken(body: $body, hotelId: $hotelId)
      @rest(
        type: "InitiateTokenPayload"
        path: "/createFaceMatch/hotel/{args.hotelId}"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

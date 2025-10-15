import { gql } from '@apollo/client';

export const GET_YOUVERSE_CONFIG = gql`
  query GetYoonikConfig($body: any, $confirmationId: string, $hotelId: String) {
    getyoonikconfig(body: $body, confirmationId: $confirmationId, hotelId: $hotelId)
      @rest(
        type: "GetYoonikConfigPayload"
        path: "/initiatekyc/hotel/{args.hotelId}?confirmationId={args.confirmationId}"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

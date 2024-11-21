import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_YOUVERSE_CONFIG = gql`
  query GetYoonikConfig($body: any, $confirmationId: string) {
    getyoonikconfig(body: $body, confirmationId: $confirmationId)
      @rest(
        type: "GetYoonikConfigPayload"
        path: "/initiatekyc/hotel/${HOTEL_ID}?confirmationId={args.confirmationId}"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

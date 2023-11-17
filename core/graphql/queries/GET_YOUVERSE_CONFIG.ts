import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_YOUVERSE_CONFIG = gql`
  query GetYoonikConfig($body: any) {
    getyoonikconfig(body: $body)
      @rest(
        type: "GetYoonikConfigPayload"
          path: "/uat/initiatekyc/hotel/${HOTEL_ID}"
          method: "POST"
          bodyKey: "body"
        ) {
        errors
        data
        status
      }
    }
    `;

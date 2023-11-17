import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_YOUVERSE_RESPONSE = gql`
    query GetYoonikResponse($docId:any) {
        getyoonikresponse(docId: $docId)
        @rest(
          type: "GetYoonikResponsePayload"
          path: "/uat/kycdocstatus/{args.docId}/hotel/${HOTEL_ID}/info"
          method: "GET"
        ) {
        errors
        data
        status
      }
    }
    `;
